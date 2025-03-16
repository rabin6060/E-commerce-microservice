const Order = require("../models/order.model");
const { logger } = require("../utils/logger")
const Redis = require('ioredis')
const stripe = require('../utils/stripe.connection')

const redisClient = new Redis()
redisClient.on("connect", () => logger.info("Redis connected"));
redisClient.on("error", (err) => logger.error("Redis connection failed", err));

const addOrder = async(req,res)=>{
    logger.info("adding order...")
    try {
        const result =await redisClient.get("userId")
        const {userId} = JSON.parse(result)
        if (!result) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in cache, please log in again",
            });
        }
        const totalAmount = req.body.items.reduce((sum,item)=>sum+item.price*item.quantity,0)
        const orderBody = {
            userId:userId,
            totalAmount,
            items:[...req.body.items]
        }
        console.log(orderBody)
        const order = new Order(orderBody)
        await order.save()

        //create a stripe checkout session
        const lineItems = order.items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                },
                unit_amount: item.price * 100, // Stripe expects amounts in cents
            },
            quantity: item.quantity,
        }));
        const session = await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            mode:'payment',
            line_items:lineItems,
            success_url: `http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:4200/cancel`,
            metadata: { orderId: order._id.toString() },

        })
        res.status(201).json({
            success:true, 
            order,
            session_id:session.id
        })
    } catch (error) {
        logger.error("order place failed",error)
        return res.status(500).json({
            success:false,
            message:"order place failed"
        })
    }
}

const success = async(req,res)=>{
    logger.info("stripe order status started..")
    try {
        const sessionId = req.query.sessionId
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        const orderId = session.metadata.orderId

        await Order.findByIdAndUpdate(orderId,{status:'paid'})
        logger.info("payment successfull")
        res.json({
            success:true,
            message:"order placed success"
        });
    } catch (error) {
        logger.error("order place status change failed",error)
        return res.status(500).json({
            success:false,
            message:"order place status change failed"
        })
    }
}
const cancel = async(req,res)=>{
    logger.info("payment cancel")
    return res.json({
        success:false,
        message:"payment cancelled"
    })
}
module.exports = {addOrder,success,cancel}