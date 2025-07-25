import Joi from 'joi'

export const userRegisterSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'First name is required',
    'string.max': 'First name must not exceed 50 characters',
  }),
  lastName: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Last name is required',
    'string.max': 'Last name must not exceed 50 characters',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
  }),
  phoneNumber: Joi.string()
    .trim()
    .pattern(/^[0-9+\-() ]{7,20}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be valid',
    }),
})
