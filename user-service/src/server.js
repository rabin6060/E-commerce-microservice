require('dotenv').config()
const express = require('express')
const { logger } = require('./utils/logger')
const { errorHandler } = require('./middlewares/errorHandler')
const cors = require('cors')
const helmet = require('helmet')
const {rateLimit} = require('express-rate-limit')
const Redis = require('ioredis')
const { RedisStore} = require('rate-limit-redis')
const userRouter = require('./routes/user.routes')
const { dbConnection } = require('./utils/db.connection')

const app = express()
const port = process.env.PORT || 3000

const redisClient = new Redis()
redisClient.on('error',(err)=>logger.error(err))

app.use(cors())
app.use(helmet())
app.use(express.json())




//rate limit
const rateLimiter = rateLimit({
    windowMs: 5*60*60, //5 min
    limit:100 ,//limit each IP to 100 req for 5 min
    legacyHeaders:false,
    standardHeaders:true,
    handler:(req,res)=>{
        logger.warn(`Sensitive rate limit exceeded for this ip ${req.ip}`)
        res.status(429).send('Too Many Requests');
    },
    store: new RedisStore({
        sendCommand: (...args)=>redisClient.call(...args)
    })
})

app.use(rateLimiter)



app.use((req,res,next)=>{
    logger.info(`req path: ${req.path} and method: ${req.method}`)
    logger.info(`req body ${req.body}`)
    next()
})

app.use('/api/auth',userRouter)


app.listen(port,()=>{
    dbConnection()
    logger.info(`user-service server running at port ${process.env.PORT}`)
})

app.use(errorHandler)


