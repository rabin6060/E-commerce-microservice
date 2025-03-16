const joi = require('joi');

const cartValidation = (data,existingCartItem=[]) => {
   
    const cartItemSchema  = joi.object({
        productId:joi.string().required()
        .custom((value, helpers) => {
            // Check if productId already exists in existingCartItems
            const isDuplicate = existingCartItem.some(
              (item) => item.productId === value
            );
            if (isDuplicate) {
              return helpers.message( 'product already exist. Please check your cart')
            }
            return value; // Return the value if valid
          }, 'unique productId check'),
          title:joi.string().required(),
          imageUrl:joi.string().required(),
        price:joi.number().required(),
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
