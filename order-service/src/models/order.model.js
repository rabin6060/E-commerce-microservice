const mongoose = require('mongoose')

const productItems = new mongoose.Schema({
    productId:{
        type:String,
        unique:true,
        required:true,
    },
    title:{
        type:String,
        required:true
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

const orderSchema =  new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    items:[productItems],
    status:{
        type:String,
        default:'pending'
    },
    totalAmount:{
        type:Number,
        required:true
    }
},{timestamps:true})

const orderModel = mongoose.model('Order',orderSchema)
module.exports = orderModel