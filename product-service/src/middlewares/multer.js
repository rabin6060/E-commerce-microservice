const multer = require('multer');
const { logger } = require('../utils/logger');


const upload = multer({
    storage:multer.memoryStorage(),
    limits: {fileSize:5 *1024*1024}
}).array('imageUrls',5)

const multerMiddleware = async(req,res,next)=>{
    req.on('close', () => {
        logger.warn('Client disconnected during file upload');
      });
    
      
      upload(req, res, (err) => {
        if (!req.files) {
          logger.info("no file uploaded")
        }

        if (err) {
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            logger.error("image more than 5 received:", err.code);
            return res.status(400).json({ success: false, message: 'please upload less than 5 images' });
          }
        }
    
        next();
      });
}

module.exports = {multerMiddleware}