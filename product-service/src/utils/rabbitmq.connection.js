const amqp = require('amqplib')
const { logger } = require('./logger')
const { redisConnect } = require('./redis.connection')
const Redis = require('ioredis')

let connection
let channel
const exchangeName = 'user'

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
    }
}

// const publish = async(message)=>{
//     try {
//         if (!channel) {
//             await rabbitConnection()
//         }
//         channel.assertExchange(exchangeName,'direct',{durable:false})
//         channel.assertQueue('',{exclusive:true})
//         channel.publish(exchangeName,'',Buffer.from(JSON.stringify(message)))
//         logger.info("message published successfully")
//     } catch (error) {
//         logger.error("message published failed")
//     }
// }

const consumeUserInfo = async(routingKey)=>{
    try {
        if (!channel) {
            await rabbitConnection()
        }
        await channel.assertExchange(exchangeName,'direct',{durable:false})
        const q = await channel.assertQueue("",{durable:true})
    
        await channel.bindQueue(q.queue,exchangeName,routingKey)
    
        await channel.consume(q.queue,async(msg)=>{
            if (msg!==null) {
                try {
                    const content = JSON.parse(msg.content.toString())  
                    
                    await redisClient.set('userId', JSON.stringify(content));
                    channel.ack(msg)
                    
                } catch (error) {
                    logger.error("msg consume error",error)
                }
               
            }
            logger.info("no message")
        })
    } catch (error) {
        logger.error("error consume",error)
    }

} 

module.exports = {rabbitConnection,consumeUserInfo}
