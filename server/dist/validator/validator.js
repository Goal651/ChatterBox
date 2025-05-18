"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().empty('').messages({
        'string.email': 'Invalid email or password',
        'any.required': 'Email is required',
        'string.empty': 'Email is required',
    }),
    password: joi_1.default.string().required().messages({
        'any.required': 'Password is required',
        'string.empty': 'Password is required'
    })
});
const registerSchema = joi_1.default.object({
    username: joi_1.default.string().required().messages({
        'any.required': 'Username is required',
        'string.empty': 'Username is required'
    }),
    email: joi_1.default.string().email().required().empty('').messages({
        'string.email': 'Provide valid email',
        'any.required': 'Email is required',
        'string.empty': 'Email is required'
    }),
    password: joi_1.default.string().required().min(4).messages({
        'string.min': 'Password must be at least 4 characters long',
        'any.required': 'Password is required',
    }),
    confirmPassword: joi_1.default.string().required().valid(joi_1.default.ref('password')).messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm Password is required',
    }),
});
const groupCreationSchema = joi_1.default.object({
    groupName: joi_1.default.string().required().messages({
        'any.required': 'Group name is required',
    }),
    members: joi_1.default.array().required().messages({
        'any.required': 'Members are required',
    }),
    image: joi_1.default.string(),
    description: joi_1.default.string().required().messages({
        'any.required': 'Description is required',
    })
});
const addMemberSchema = joi_1.default.object({
    members: joi_1.default.array().required().messages({
        'any.required': 'Members are required',
    }),
    groupId: joi_1.default.string().required().messages({
        'any.required': 'Group id is required',
    })
});
const updateUserSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().empty('').messages({
        'string.email': 'Provide valid email',
        'any.required': 'Email is required',
        'string.empty': ''
    }),
    names: joi_1.default.string().required().messages({
        'any.required': 'Names are required'
    }),
    username: joi_1.default.string().required().messages({
        'any.required': 'Username is required'
    }),
    image: joi_1.default.string()
});
exports.default = {
    loginSchema,
    registerSchema,
    groupCreationSchema,
    addMemberSchema,
    updateUserSchema
};
