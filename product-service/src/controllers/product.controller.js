const Product = require("../models/product.models")
const { logger } = require("../utils/logger")
const { consumeUserInfo } = require("../utils/rabbitmq.connection")
const { productValidation } = require("../utils/product.validation")
const Redis = require('ioredis')
const { upload, deleteImage } = require("../utils/cloudinary")

const redisClient = new Redis()
redisClient.on("connect", () => logger.info("Redis connected"));
redisClient.on("error", (err) => logger.error("Redis connection failed", err));


const createProduct = async(req,res)=>{
    logger.info("registering started...")
    try {
        if (!req.files) {
            logger.warn("no images .")
            return res.status(400).json({message:"please select images"})
        }
        let images = []
        images = (await Promise.all(req.files.map(async(image)=>{
            const response = await upload(image)
            if (response) {
                return {
                    imageId:response.public_id,
                    imageUrl:response.secure_url
                }
            }
            return null
        })))
       
        await consumeUserInfo('user_created')
        const result =await redisClient.get("userId")
        const {userId} = JSON.parse(result)
        const newBody = {...req.body,userId:userId,imageUrls:images}
        
        const {error} = productValidation(newBody)
        if (error) {
            logger.warn("validation failed",error.details[0].message)
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }
        
        const newProduct = new Product(newBody)
        await newProduct.save()
        
       res.status(201).json(newProduct)
    } catch (error) {
        logger.error('product creation failed',error)
        return res.status(500).json({
            success:false,
            message:'product creation failed'
        })
    }
}

const getAllProducts = async(req,res)=>{
    logger.info("fetch all products started...")
    try {
        const cachedKey = 'products'
        const cachedProducts = await redisClient.get(cachedKey)
        if (cachedProducts) {
            return res.status(201).json(JSON.parse(cachedProducts))
        }
        const products = await Product.find({}).sort({'createdAt':-1}).select('-__v')
        await redisClient.setex(cachedKey,60,JSON.stringify(products))
        res.status(201).json(products)
    } catch (error) {
        logger.error('no products found',error)
        return res.status(500).json({
            success:false,
            message:'no products found'
        })
    }
}

const getSingleProductById = async(req,res)=>{
    logger.info("fetch single products started...")
    try {
        const {id} = req.params
        const cachedKey = 'productByID'
        const cachedProducts = await redisClient.get(cachedKey)
        if (cachedProducts) {
            return res.status(201).json(JSON.parse(cachedProducts))
        }
        const product = await Product.findById(id).select('-__v')
        if (!product) {
            return res.status(403).json({
                success:false,
                message:"product does not exist"
            })
        }
        await redisClient.setex(cachedKey,120,JSON.stringify(product))
        res.status(201).json(product)
    } catch (error) {
        logger.error('no product found',error)
        return res.status(500).json({
            success:false,
            message:'no product found'
        })
    }
}

const getProductsByUserId = async(req,res)=>{
    logger.info("fetch users products started...")
    try {
        const result =await redisClient.get("userId")
        if (!result) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in cache, please log in again",
            });
        }
        const {userId} = JSON.parse(result)
       
        const cachedKey = 'productByUserID'
        const cachedProducts = await redisClient.get(cachedKey)
        if (cachedProducts) {
            return res.status(201).json(JSON.parse(cachedProducts))
        }
        
        const products = await Product.find({userId:userId}).sort({createdAt:-1}).select('-__v')
        
        if (!products) {
            return res.status(403).json({
                success:false,
                message:"product does not exist"
            })
        }
        await redisClient.setex(cachedKey,120,JSON.stringify(products))
        res.status(201).json(products)
    } catch (error) {
        logger.error('no products found',error)
        return res.status(500).json({
            success:false,
            message:'no products found'
        })
    }
}

const editPtoduct = async(req,res)=>{
    logger.info("edit product started...")
    try {
        const {id} = req.params
        const result =await redisClient.get("userId")
        if (!result) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in cache, please log in again",
            });
        }
        const {userId} = JSON.parse(result)
        const product = await Product.findById(id)
        if (!product) {
            return res.status(403).json({
                success:false,
                message:"product does not exist"
            })
        }
        //check user creates the product or not
        if (product.userId!==userId) {
            return res.status(403).json({
                success:false,
                message:"you are not authorized to edit others product"
            })
        }
        //after frontend



    } catch (error) {
        logger.error('edit product failed',error)
        return res.status(500).json({
            success:false,
            message:'edit product failed'
        })
    }
}

const deleteProduct = async(req,res)=>{
    logger.info("product deleted started...")
    try {
        const result =await redisClient.get("userId")
        if (!result) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in cache, please log in again",
            });
        }
        const {userId} = JSON.parse(result)
        const {id} = req.params
       
        const product = await Product.findById(id)
        if (!product) {
            return res.status(403).json({
                success:false,
                message:"product does not exist"
            })
        }
        if (product.userId!==userId) {
            return res.status(403).json({
                success:false,
                message:"you are not authorized to delete others product"
            })
        }
        
        await product.deleteOne()
        //delete the associate image with the product
        product && (await Promise.all(product.imageUrls.map(async(image)=>{
            await deleteImage(image.imageId)
        })))
        
        await redisClient.del(['productByID','products','productByUserID'])
        res.status(200).json({
            success:true,
            message:"product deleted successfully"
        })
    } catch (error) {
        logger.error('product deletion failed',error)
        return res.status(500).json({
            success:false,
            message:'product deletion failed'
        })
    }
}


module.exports = {createProduct,getAllProducts,getSingleProductById,deleteProduct,getProductsByUserId,editPtoduct}