import Joi from "joi"

const loginSchema = Joi.object({
    email: Joi.string().email().required().empty('').messages({
        'string.email': 'Invalid email or password',
        'any.required': 'Email is required',
        'string.empty': 'Email is required',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required',
    })
})

const registerSchema = Joi.object({
    email: Joi.string().email().required().empty('').messages({
        'string.email': 'Provide valid email',
        'any.required': 'Email is required',
        'string.empty': ''
    }),
    names: Joi.string().required().messages({
        'any.required': 'Names are required'
    }),
    username: Joi.string().required().messages({
        'any.required': 'Username is required'
    }),
    password: Joi.string().required().min(4).messages({
        'string.min': 'Password must be at least 4 characters long',
        'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm Password is required',
    }),
})

const groupCreationSchema = Joi.object({
    groupName: Joi.string().required().messages({
        'any.required': 'Group name is required',
    }),
    members: Joi.array<string>().required().messages({
        'any.required': 'Members are required',
    }),
    image: Joi.string()
})

const addMemberSchema = Joi.object({
    members: Joi.array<string>().required().messages({
        'any.required': 'Members are required',
    }),
    groupId: Joi.string().required().messages({
        'any.required': 'Group id is required',
    })
})

export default {
    loginSchema,
    registerSchema,
    groupCreationSchema,
    addMemberSchema
}