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
            resolve(result)
        }).end(image.buffer)
    })
}
const deleteImage = async(publicId)=>{
    await cloudinary.uploader.destroy(publicId)
    .then((result)=>{
        logger.info("profile pic deleted",result)
    }).catch(error=>logger.error("profile pic deletion failed",error.stack))
}

module.exports = {upload,deleteImage}