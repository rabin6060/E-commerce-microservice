const amqp = require('amqplib')
const { logger } = require('./logger')
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

const publishCartInfo = async(routingKey,message)=>{
    const exchangeName = 'cart'
    try {
        if (!channel) {
            await rabbitConnection()
        }
        await channel.assertExchange(exchangeName,'direct',{durable:true})
        const success = await channel.publish(exchangeName,routingKey,Buffer.from(JSON.stringify(message)))
        if(!success){
            logger.warn("no msg ack")
        }
        logger.info("message published successfully")
    } catch (error) {
        logger.error("message published failed")
    }
}

const consumeProductInfo = async(routingKey)=>{
    const exchangeName = 'product'
    const queueName = 'product_info_queue';
    try {
        if (!channel) {
            await rabbitConnection()
        }
        await channel.assertExchange(exchangeName,'direct',{durable:true})
        const q = await channel.assertQueue(queueName,{durable:true})
    
        await channel.bindQueue(q.queue,exchangeName,routingKey)
    
        await channel.consume(q.queue,async(msg)=>{
            if (msg!==null) {
                try {
                    const content = JSON.parse(msg.content.toString())  
                    logger.info("message received successfully")
                    console.log(content)
                    await redisClient.set('productInfo', JSON.stringify(content));
                    channel.ack(msg)
                    
                } catch (error) {
                    logger.error("msg consume error",error)
                    channel.nack(msg, false, true);
                }
               
            }
        })
    } catch (error) {
        logger.error("error consume",error)
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

module.exports = {rabbitConnection,consumeProductInfo,publishCartInfo,consumeUserInfo}
