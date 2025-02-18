const jwt = require('jsonwebtoken')


const generateToken = (user)=>{
    const payload = {
        userId:user._id,
        email:user.email
    }
    const accessToken =  jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn:'7d'
    })
    return {accessToken}
}

module.exports = {generateToken}

