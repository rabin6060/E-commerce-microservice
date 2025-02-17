const mongoose = require('mongoose')
const { logger } = require('./logger')

function dbConnection() {
 return mongoose.connect(process.env.MONGODB_URI)
.then(()=>logger.info("connected to db"))
.catch((error)=>logger.error("db connection failed",error.message))
}

module.exports = {dbConnection}