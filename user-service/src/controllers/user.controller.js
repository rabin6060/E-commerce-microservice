const { logger } = require("../utils/logger")
const {userRegisterValidation, loginValidation} = require('../utils/user.register.validation')
const User = require('../models/user.models')
const { upload, deleteImage } = require("../utils/cloudinary")
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
        if(!req.file){
            return res.status(400).json({ message: 'No file uploaded' });
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
       res.status(200).json({success:true,accessToken:accessToken,message:'login successfully'})
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
        
        const user = await User.findById(req.user.userId)
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

const editUserProfile = async(req,res)=>{
    logger.info("user edit started...")
    try {
        const user = await User.findById(req.user.userId)
            if (!user) {
                return res.status(400).json({
                    success:false,
                    message:"user doesn't exist"
                })
            }
        if(req.file){
            if(user.profilePic){
                await deleteImage(user.profilePicId)
            }
            
            //update user
            const result = await upload(req.file)
            
            user.profilePic = result.secure_url
            user.profilePicId=result.public_id
            
        }
        const {username,firstName,lastName}=req.body
        username && (user.username = username)
        firstName && (user.firstName = firstName)
        lastName && (user.lastName = lastName)
        await user.save()
        res.status(200).json({success:true,message:'user updated successfully',user:user})
    } catch (error) {
        logger.error('update failed',error.message)
        return res.status(500).json({
            success:false,
            message:'User update failed'
        })
    }
}


const deleteUser = async(req,res)=>{
    logger.info("user deletion started...")
    try {
        
        const user = await User.findOne({email:req.user.email})
        if (!user) {
            return res.status(400).json({
                success:false,
                message:"user doesn't exist"
            })
        }
        
        await user.deleteOne()
        await deleteImage(user.profilePicId)
        res.status(200).json({success:true,message:'user deleted successfully'})
    } catch (error) {
        logger.error('deletion failed',error.message)
        return res.status(500).json({
            success:false,
            message:'User deletion failed'
        })
    }
}




module.exports = {register,login,logout,deleteUser,editUserProfile}