const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
    productId:{
        type:String,
        unique:true,
        required:true,
    },
    title:{
        type:String,
        required:String
    },
    imageUrl:{
        type:String,
        required:String
    },
    price:{
        type:Number,
        required:String
    },
    quantity:{
        type:Number,
        required:true
    },
},{_id:false})

const cartSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    cartItems:[cartItemSchema],
    totalAmount:{
        type:Number,
        required:true
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
},{timestamps:true})

const cartModel = mongoose.model("Cart",cartSchema)
module.exports = cartModel