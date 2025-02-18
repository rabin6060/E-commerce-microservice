const joi = require('joi');

const userRegisterValidation = (data) => {
    const schema = joi.object({
        username: joi.string().min(5).messages({
            'string.min': 'Username must be at least 5 characters long',
        }).required(),

        firstName: joi.string().min(5).messages({
            'string.min': 'First name must be at least 5 characters long',
        }).optional(),

        lastName: joi.string().min(5).messages({
            'string.min': 'Last name must be at least 5 characters long',
        }).optional(),

        email: joi.string().email().required().messages({
            'string.email': 'Invalid email format',
        }),

        password: joi.string().required(),

        profilePic: joi.string().optional(),

        role: joi.string().default('User').optional(),
    });

    return schema.validate(data, { abortEarly: false }); 
};



function loginValidation(data){
    console.log(data)
    const loginSchema = joi.object({
        email:joi.string().email().required(),
        password:joi.string().required()
    })
    return loginSchema.validate(data)
}

module.exports = { userRegisterValidation,loginValidation };
