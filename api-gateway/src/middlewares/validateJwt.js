const jwt = require('jsonwebtoken')
const { logger } = require('../utils/logger')

const validateJwt = (req,res,next)=>{
    const accessToken = req.headers['authorization']?.split(" ")[1]
    if (!accessToken) {
        logger.warn("please send token")
        return res.status(404).json("no token found")
    }
    jwt.verify(accessToken,process.env.JWT_SECRET,function(err,decoded){
        if (err) {
            logger.warn("jwt token verification failed")
            return res.status(500).json("jwt token verification failed")
        }
    })
    next()
}

module.exports = {validateJwt}