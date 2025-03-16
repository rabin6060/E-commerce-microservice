require('dotenv').config()
const express = require('express')
const { logger } = require('./utils/logger')
const { errorHandler } = require('./middlewares/errorHandler')
const cors = require('cors')
const helmet = require('helmet')
const {rateLimit} = require('express-rate-limit')
const Redis = require('ioredis')
const { RedisStore} = require('rate-limit-redis')
const proxy = require('express-http-proxy')
const { validateJwt } = require('./middlewares/validateJwt')



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


const proxyOptions = {
    proxyReqPathResolver:(req,res)=>{
        return req.originalUrl.replace(/^\/v1/,'/api')
    },
    proxyErrorHandler:(err,res,next)=>{
        logger.error(`proxy error : ${err.message}`)
        next(err)
    }
}
app.use('/v1/auth',(req,res,next)=>{
    if (req.headers['content-type'].startsWith('multipart/form-data')) {
        proxy(process.env.USER_SERVICE_PORT,{

            ...proxyOptions,
            parseReqBody:false,
            proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
             proxyReqOpts.headers['Content-Type'] = srcReq.headers['content-type'];
             return proxyReqOpts
            },
            //send the body as it is
            proxyReqBodyDecorator:(bodyContent,srcReq)=>{
             return srcReq.body
            },
            userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
             logger.info(`reponse received from user-service ${proxyRes.statusCode}`)
             return proxyResData
            }
         
         })(req,res,next)
    }else{
        proxy(process.env.USER_SERVICE_PORT,{

            ...proxyOptions,
            parseReqBody:true, //enable body parsing
            proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
                proxyReqOpts.headers['Content-Type'] = 'application/json';
                return proxyReqOpts;
            },
            //send the body as it is
            proxyReqBodyDecorator:(bodyContent,srcReq)=>{
             return srcReq.body
            },
            userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
             logger.info(`reponse received from user-service ${proxyRes.statusCode}`)
             return proxyResData
            }
         
         })(req,res,next)
    }
})

app.use('/v1/product',validateJwt,proxy(process.env.PRODUCT_SERVICE_PORT ,{
    ...proxyOptions,
    parseReqBody:false,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        if(srcReq.headers['content-type'].startsWith('multipart/form-data')){
            proxyReqOpts.headers['content-type']=srcReq.headers['content-type'];
        }
        else proxyReqOpts.headers['Content-Type'] = 'application/json';
        return proxyReqOpts;
    },
    //send the body as it is
    proxyReqBodyDecorator:(bodyContent,srcReq)=>{
     return srcReq.body
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
     logger.info(`reponse received from product-service ${proxyRes.statusCode}`)
     return proxyResData
    }
}))

app.use('/v1/cart',validateJwt,proxy(process.env.CART_SERVICE_PORT ,{
            ...proxyOptions,
            parseReqBody:true, //enable body parsing
            proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
                proxyReqOpts.headers['Content-Type'] = 'application/json';
                return proxyReqOpts;
            },
            //send the body as it is
            proxyReqBodyDecorator:(bodyContent,srcReq)=>{
             return srcReq.body
            },
            userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
             logger.info(`reponse received from cart-service ${proxyRes.statusCode}`)
             return proxyResData
            }
}))

app.use('/v1/order',validateJwt,proxy(process.env.ORDER_SERVICE_PORT ,{
    ...proxyOptions,
    parseReqBody:true, //enable body parsing
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        return proxyReqOpts;
    },
    //send the body as it is
    proxyReqBodyDecorator:(bodyContent,srcReq)=>{
     return srcReq.body
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
     logger.info(`reponse received from order-service ${proxyRes.statusCode}`)
     return proxyResData
    }
}))


app.listen(port,async()=>{
    logger.info(`api-gateway server running at port ${port}`)
    logger.info(`user-service server running at port ${process.env.USER_SERVICE_PORT}`)
    logger.info(`product-service server running at port ${process.env.PRODUCT_SERVICE_PORT}`)
    logger.info(`cart-service server running at port ${process.env.CART_SERVICE_PORT}`)
    logger.info(`order-service server running at port ${process.env.ORDER_SERVICE_PORT}`)
})

app.use(errorHandler)


