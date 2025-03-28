
const { logger } = require("../utils/logger")
const Redis = require('ioredis');
const { consumeProductInfo, publishCartInfo } = require("../utils/rabbitmq.connection");
const Cart = require("../models/cart.models");
const { cartValidation, cartEditValidation } = require("../utils/cart.validation");


const redisClient = new Redis()
redisClient.on("connect", () => logger.info("Redis connected"));
redisClient.on("error", (err) => logger.error("Redis connection failed", err));


const addCart = async(req,res)=>{
    logger.info("adding to a cart started...")
    try {
        
        const result =await redisClient.get("userId")
        const {userId} = JSON.parse(result)
        if (!result) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in cache, please log in again",
            });
        }
        const {price,quantity,productId} = req.body
        const totalAmount =price * quantity
        const response = await fetch(`http://localhost:3000/v1/product/${productId}`,{
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'authorization':req.headers.authorization
            }
        })
        const product = await response.json()
        
        const cartItemData ={price,quantity,productId,title:product?.title,imageUrl:product?.imageUrls[0].imageUrl}
        const newBody = {cartItems:[cartItemData],userId:userId,totalAmount:parseInt(totalAmount)}
        let cartItem = await Cart.findOne({
            userId:userId,
        })

        
        
        const {error} = cartValidation(newBody,(cartItem ? cartItem.cartItems:[]))
            if (error) {
                logger.warn("validation failed",error.details[0].message)
                return res.status(400).json({
                    success:false,
                    message:error.details[0].message
                })
            }
        
        // console.log(newBody)
        if (cartItem) {
            cartItem?.cartItems.push(cartItemData)
            cartItem.totalAmount =(cartItem.totalAmount || 0) + price * quantity
            await cartItem.save()
        }else{
            cartItem = new Cart(newBody)
            await cartItem.save()
        }
        const message = {
            productId:productId,
            quantity:quantity
        }
    
        await publishCartInfo('cart_created',message)
        await redisClient.del([`carts/${userId}`])
       res.status(201).json({
        success:true,
        message:'Added to cart successfully!!',
        cart:cartItem
       })
    } catch (error) {
        logger.error('adding to cart failed',error)
        return res.status(500).json({
            success:false,
            message:'adding to cart failed'
        })
    }
}

const getAllCarts = async(req,res)=>{
    logger.info("fetch all carts started...")
    try {
        const result =await redisClient.get("userId")
        const {userId} = JSON.parse(result)
        if (!result) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in cache, please log in again",
            });
        }
        const cachedKey = `carts/${userId}`
        const cachedProducts = await redisClient.get(cachedKey)
        if (cachedProducts) {
            return res.status(201).json(JSON.parse(cachedProducts))
        }
        const carts = await Cart.findOne({userId:userId}).sort({'createdAt':-1}).select('-__v')
        await redisClient.setex(cachedKey,60,JSON.stringify(carts))
        res.status(201).json(carts)
    } catch (error) {
        logger.error('no products found',error)
        return res.status(500).json({
            success:false,
            message:'no products found'
        })
    }
}

const removeCartItem = async(req,res)=>{
    logger.info("remove cart items started..")
    try {
        const {id} = req.params
        const {action} = req.query
        const {productId,price,quantity} = req.body

        const result =await redisClient.get("userId")
        const {userId} = JSON.parse(result)
        if (!result) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in cache, please log in again",
            });
        }

        const {error} = cartEditValidation(req.body)
        if (error) {
            logger.warn("validation failed",error.details[0].message)
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }
        
        let cart = await Cart.findById(id)
        if (!cart) {
            return res.status(404).json({
                success:false,
                message:"cart does not exist"
            })
        }
        const cartItemIndex = cart.cartItems.findIndex(item=>item.productId===productId)
        if (cartItemIndex === -1) {
            return res.status(404).json({
              success: false,
              message: "product not found in cart",
            });
          }
        const cartItem = cart.cartItems[cartItemIndex]
        if(action==='rem' && cartItem.quantity === quantity){
            cart.cartItems = cart.cartItems.filter(cartItem =>cartItem.productId !==productId)
            cart.totalAmount -= price*quantity
        }else{
            const oldQuantity = cartItem.quantity
            cartItem.quantity = quantity
            if (action==='dec') {
                cart.totalAmount -= (oldQuantity - quantity)*price
            }else if(action==='inc'){
                cart.totalAmount += (quantity - oldQuantity)*price
            }
        }
        await cart.save()
        const message = {
            productId:productId,
            quantity:quantity
        }
        await redisClient.del([`carts/${userId}`])
        await publishCartInfo('cart_updated',message)
        return res.status(200).json({
            success:true,
            cart:cart
        })
    } catch (error) {
        logger.error('cart remove failed',error)
        return res.status(500).json({
            success:false,
            message:'cart remove failed'
        })
    }
}



module.exports = {addCart,getAllCarts,removeCartItem}