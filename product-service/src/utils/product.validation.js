const joi = require('joi');

const productValidation = (data) => {
    const imageSchema  = joi.object({
        imageId:joi.string().required(),
        imageUrl:joi.string().required()
    })
    const schema = joi.object({
        title: joi.string().min(5).required(),
        userId: joi.string().min(5).required(),
        desc: joi.string().min(10).required(),
        categories:joi.array().items(joi.string()).required(),
        price: joi.number().min(0).required(),
        totalStock:joi.number().min(0).required(),
        isAvailable:joi.boolean().optional(),
        imageUrls:joi.array().items(imageSchema).min(1).required()
    });
   

    

    return schema.validate(data, { abortEarly: false }); 
};




module.exports = { productValidation };
