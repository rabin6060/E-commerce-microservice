const { logger } = require("../utils/logger")
const {userRegisterValidation} = require('../utils/user.register.validation')
const User = require('../models/user.models')
const { upload } = require("../utils/cloudinary")



const register = async(req,res,next)=>{
    logger.info("registering started...")
    try {
        const {error} = userRegisterValidation(req.body)
        if (error) {
            logger.warn("validation failed",error.details[0].message)
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }
        const user = await User.findOne({
                email:req.body.email
            }
        )
        if (user) {
            return res.status(400).json({
                success:false,
                message:"User already exist!!"
            })
        }
        const result = await upload(req.file)
        
       const newuser = await User.create({...req.body,profilePic:result.secure_url,profilePicId:result.public_id})
       res.status(200).json({success:true,newuser})
    } catch (error) {
        logger.error('registration failed',error.message)
        next(error)
        return res.status(500).json({
            success:false,
            message:'User registration failed'
        })
    }
}

module.exports = {register}