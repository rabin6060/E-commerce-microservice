const { logger } = require('./logger')

const cloudinary = require('cloudinary').v2

cloudinary.config({
    secure:true
})

const upload = async(image)=>{
    return new Promise(resolve=>{
        cloudinary.uploader.upload_stream((error,result)=>{
            if (error) {
                logger.error("image upload failed")
            }
            return resolve(result)
        }).end(image.buffer)
    })
}
module.exports = {upload}