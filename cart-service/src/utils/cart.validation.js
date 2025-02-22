const joi = require('joi');

const cartValidation = (data) => {
    const cartItemSchema  = joi.object({
        productId:joi.string().required(),
        price:joi.number().required(),
        totalStock:joi.number().required(),
        quantity:joi.number().required(),
        
    })
    const schema = joi.object({
        userId: joi.string().required(),
        totalAmount: joi.number().required(),
        cartItems:joi.array().items(cartItemSchema).required()
    });
   
    return schema.validate(data, { abortEarly: false }); 
};

const cartEditValidation = (data) => {
    const cartItemSchema  = joi.object({
        productId:joi.string().required(),
        price:joi.number().required(),
        quantity:joi.number().min(0).required(),
        
    })
   
    return cartItemSchema.validate(data, { abortEarly: false }); 
};




module.exports = { cartValidation,cartEditValidation };
