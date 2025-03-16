const amqp = require('amqplib')
const { logger } = require('./logger')
const { redisConnect } = require('./redis.connection')
const Redis = require('ioredis')

let connection
let channel


const redisClient = new Redis()
redisClient.on("connect", () => logger.info("Redis connected"));
redisClient.on("error", (err) => logger.error("Redis connection failed", err));

const rabbitConnection = async()=>{
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL)
        logger.info("rabbitmq connnection successfully")
        channel = await connection.createChannel()
        return channel
    } catch (error) {
        logger.error("rabbitmq connection failed",error)
        throw error
    }
}

const publish = async(routingKey,message)=>{
    const exchangeName = 'product'
    try {
        if (!channel) {
            await rabbitConnection()
        }
        channel.assertExchange(exchangeName,'direct',{durable:true})
        channel.publish(exchangeName,routingKey,Buffer.from(JSON.stringify(message)))
        logger.info("message published successfully")
    } catch (error) {
        logger.error("message published failed")
    }
}

const consumeUserInfo = async(routingKey)=>{
     const exchangeName = 'user'
     const queue_name = 'user_info_queue'
    try {
        if (!channel) {
            await rabbitConnection()
        }
        await channel.assertExchange(exchangeName,'direct',{durable:true})
        const q = await channel.assertQueue(queue_name,{durable:true})
    
        await channel.bindQueue(q.queue,exchangeName,routingKey)
    
        await channel.consume(q.queue,async(msg)=>{
            if (msg!==null) {
                try {
                    const content = JSON.parse(msg.content.toString())  
                    console.log(content)
                    await redisClient.set('userId', JSON.stringify(content));
                    channel.ack(msg)
                    
                } catch (error) {
                    logger.error("msg consume error",error)
                }
               
            }
        },{noAck:false})
    } catch (error) {
        logger.error("error consume",error)
    }

} 

const consumeCartInfo = async(routingKey,cb)=>{
    const exchangeName = 'cart'
    const queue_name = 'cart_info_queue'
   try {
       if (!channel) {
           await rabbitConnection()
       }
       await channel.assertExchange(exchangeName,'direct',{durable:true})
       const q = await channel.assertQueue(queue_name,{durable:true})
   
       await channel.bindQueue(q.queue,exchangeName,routingKey)
   
       await channel.consume(q.queue,async(msg)=>{
           if (msg!==null) {
               try {
                   const content = JSON.parse(msg.content.toString()) 
                   cb(content) 
                   logger.info("message received successfully",content)
                   channel.ack(msg)
                   
               } catch (error) {
                   logger.error("msg consume error",error)
               }
              
           }
       })
   } catch (error) {
       logger.error("error consume",error)
   }

} 

module.exports = {rabbitConnection,consumeUserInfo,publish,consumeCartInfo}
