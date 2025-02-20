const Product = require("../models/product.models")
const { logger } = require("../utils/logger")
const { consumeUserInfo } = require("../utils/rabbitmq.connection")
const { productValidation } = require("../utils/product.validation")
const Redis = require('ioredis')
const { upload } = require("../utils/cloudinary")

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


module.exports = {createProduct}