const productModel = require("../models/product.models")
const { logger } = require("../utils/logger")

const handleProductStock =async (content)=>{
    const {productId,quantity} = content
    try {
        const product = await productModel.findById(productId)
        const oldStock = product.totalStock
        if(oldStock===0){
            product.isAvailable = false
            logger.info("out of stock")
        }
        if (oldStock<quantity) {
            logger.error("out of stock")
            throw Error("no")
        }
        product.totalStock = oldStock-quantity
        await product.save() 
        logger.info("product quantity updated")
    } catch (error) {
        logger.error("product totalStock update failed")
    }
}

module.exports = {handleProductStock}