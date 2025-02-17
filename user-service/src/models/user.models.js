const mongoose = require('mongoose')
const argon = require('argon2')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
    },
    lastName:{
        type:String
    },
    profilePicId:{
        type:String
    },
    profilePic:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:'User',
    }
},{timestamps:true})

userSchema.pre('save',async function(next){
    try {
        this.password = await argon.hash(this.password)
    } catch (error) {
        next(error)
    }
})

userSchema.methods.comparePassword=async function (password){

    await argon.verify(user.password,password)
}

const userModel = mongoose.model('User',userSchema)
module.exports = userModel