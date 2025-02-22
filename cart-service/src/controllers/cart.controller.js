
const { logger } = require("../utils/logger")
const Redis = require('ioredis');
const { consumeProductInfo } = require("../utils/rabbitmq.connection");
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
        const {price,quantity,productId,totalStock} = req.body
        if (quantity>totalStock) {
            return res.status(400).json({
                success:false,
                message:"total Stock reached"
            })
        }
        const totalAmount =price * quantity
        const cartItemData = {price,quantity,productId,totalStock}
        const newBody = {cartItems:[cartItemData],userId:userId,totalAmount:parseInt(totalAmount)}
        console.log(newBody)
        const {error} = cartValidation(newBody)
        if (error) {
            logger.warn("validation failed",error.details[0].message)
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }
        let cartItem = await Cart.findOne({userId:userId})
        if (cartItem) {
            cartItem?.cartItems.push(cartItemData)
            cartItem.totalAmount =(cartItem.totalAmount || 0) + price * quantity
            await cartItem.save()
        }else{
            cartItem = new Cart(newBody)
            await cartItem.save()
        }
        
        
       res.status(201).json({
        success:true,
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
        const removeCartItem = async(req,res)=>{
            logger.info("remove cart items started..")
            try {
                const {id} = req.params
                const {action} = req.query
                const {productId,price,quantity} = req.body
        
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
                cart.cartItems.forEach(cartI=>{
                    if ((quantity === cartI.quantity) && (action==='rem')) {
                        //remove item from cart
                        cart.cartItems = cart.cartItems.filter(cartItem=>cartItem.productId!==productId)
        
                    }else{
                        //increase or decrease cartItem
                        cart.cartItems = cart.cartItems.map(cartItem=>{
                            if (cartItem.productId===productId) {
                                if((quantity <= cartItem.totalStock)){
                                    cartItem.quantity = quantity
                                }else if(quantity > cartItem.totalStock){
                                    return res.status(200).json({
                                        success:false,
                                        message:"total Stock reached"
                                    })
                                }
                            }
                        })
                    }
                })
                if((action==='dec')|| (action==='rem')){
                    cart.totalAmount = cart.totalAmount - quantity * price
                }else if(action==='inc'){
                    cart.totalAmount = cart.totalAmount + quantity * price
                }
                
               
             //   await cart.save()
                return res.status(200).json({
                    success:true,
                    cart
                })
            } catch (error) {
                logger.error('cart remove failed',error)
                return res.status(500).json({
                    success:false,
                    message:'cart remove failed'
                })
            }
        }
        const cachedKey = 'carts'
        const cachedProducts = await redisClient.get(cachedKey)
        if (cachedProducts) {
            return res.status(201).json(JSON.parse(cachedProducts))
        }
        const carts = await Cart.find({}).sort({'createdAt':-1}).select('-__v')
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
        return res.status(200).json({
            success:true,
            cart
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