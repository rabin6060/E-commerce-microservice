const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
    imageUrl:{
        type:String,
        required:true,
    },
    imageId:{
        type:String,
        required:true,
    }
})

const schema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    desc:{
        type:String,
        required:true,
        trim:true
    },
    categories:[{
        type:String,
        required:true
    }],
    imageUrls:[imageSchema],
    price:{
        type:Number,
        required:true,
        min:[0,"price cannot be negative"]
    },
    totalStock:{
        type:Number,
        required:true,
        min:[0,'stock cannot be negative']
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    
},{timestamps:true})



const productModel = mongoose.model('Product',schema)
module.exports = productModel