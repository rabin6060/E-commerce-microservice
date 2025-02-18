const { logger } = require("../utils/logger")
const {userRegisterValidation, loginValidation} = require('../utils/user.register.validation')
const User = require('../models/user.models')
const { upload } = require("../utils/cloudinary")
const { generateToken } = require("../utils/generateToken")



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

const login = async(req,res,next)=>{
    logger.info("login started...")
    try {
        console.log(req.body)
        const {error} = loginValidation(req.body)
        if (error) {
            logger.warn("validation failed",error.details[0].message)
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }
        const user = await User.findOne({email:req.body.email})
        if (!user) {
            return res.status(400).json({
                success:false,
                message:"user invalid credentials"
            })
        }
       const isMatched = await user.comparePassword(req.body.password)
       if (!isMatched) {
        return res.status(400).json({
            success:false,
            message:"password invalid credentials"
        })
     }
        const {accessToken} = generateToken(user)
        user.accessToken = accessToken
        await user.save()
       res.status(200).json({success:true,message:'login successfully'})
    } catch (error) {
        logger.error('login failed',error.message)
        next(error)
        return res.status(500).json({
            success:false,
            message:'User login failed'
        })
    }
}

const logout = async(req,res,next)=>{
    logger.info("logout started...")
    try {
        console.log(req.body)
        const user = await User.findOne({
                email:req.body.email
            }
        )
        user.accessToken = ""
        await user.save()
        res.status(200).json({success:true,message:'logout successfully'})
    } catch (error) {
        logger.error('logout failed',error.message)
        next(error)
        return res.status(500).json({
            success:false,
            message:'User logout failed'
        })
    }
}



module.exports = {register,login,logout}