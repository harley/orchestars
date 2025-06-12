import Joi from 'joi'

// Joi validation schema for affiliate link creation
export const createAffiliateLinkSchema = Joi.object({
  // affiliateCode: Joi.string().required().min(3).max(50).pattern(/^[a-zA-Z0-9_-]+$/).messages({
  //   'string.empty': 'Affiliate code is required',
  //   'string.min': 'Affiliate code must be at least 3 characters',
  //   'string.max': 'Affiliate code must not exceed 50 characters',
  //   'string.pattern.base': 'Affiliate code can only contain letters, numbers, underscores, and hyphens',
  // }),
  targetLink: Joi.string().uri().required().messages({
    'string.empty': 'Target URL is required',
    'string.uri': 'Target URL must be a valid URL',
  }),
  utmParams: Joi.object({
    source: Joi.string().optional().allow('').max(100).messages({
      'string.empty': 'UTM Source is required',
      'string.min': 'UTM Source must be at least 1 character',
      'string.max': 'UTM Source must not exceed 100 characters',
    }),
    medium: Joi.string().optional().allow('').max(100).messages({
      'string.empty': 'UTM Medium is required',
      'string.min': 'UTM Medium must be at least 1 character',
      'string.max': 'UTM Medium must not exceed 100 characters',
    }),
    campaign: Joi.string().optional().allow('').max(100).messages({
      'string.empty': 'UTM Campaign is required',
      'string.min': 'UTM Campaign must be at least 1 character',
      'string.max': 'UTM Campaign must not exceed 100 characters',
    }),
    term: Joi.string().optional().allow('').max(100).messages({
      'string.max': 'UTM Term must not exceed 100 characters',
    }),
    content: Joi.string().optional().allow('').max(100).messages({
      'string.max': 'UTM Content must not exceed 100 characters',
    }),
  }).required(),
  event: Joi.number().optional().messages({
    'number.base': 'Event ID must be a number',
  }),
  promotionCode: Joi.string().required().allow('').max(50).messages({
    'string.max': 'Promotion code must not exceed 50 characters',
  }),
})

// Joi validation schema for affiliate link update
export const updateAffiliateLinkSchema = Joi.object({
  // affiliateCode: Joi.string().min(3).max(50).pattern(/^[a-zA-Z0-9_-]+$/).messages({
  //   'string.min': 'Affiliate code must be at least 3 characters',
  //   'string.max': 'Affiliate code must not exceed 50 characters',
  //   'string.pattern.base': 'Affiliate code can only contain letters, numbers, underscores, and hyphens',
  // }),
  targetLink: Joi.string().uri().messages({
    'string.uri': 'Target URL must be a valid URL',
  }),
  utmParams: Joi.object({
    source: Joi.string().optional().allow('').max(100).messages({
      'string.max': 'UTM Source must not exceed 100 characters',
    }),
    medium: Joi.string().optional().allow('').max(100).messages({
      'string.max': 'UTM Medium must not exceed 100 characters',
    }),
    campaign: Joi.string().optional().allow('').max(100).messages({
      'string.max': 'UTM Campaign must not exceed 100 characters',
    }),
    term: Joi.string().optional().allow('').max(100).messages({
      'string.max': 'UTM Term must not exceed 100 characters',
    }),
    content: Joi.string().optional().allow('').max(100).messages({
      'string.max': 'UTM Content must not exceed 100 characters',
    }),
  }),
  event: Joi.number().optional().messages({
    'number.base': 'Event ID must be a number',
  }),
  promotionCode: Joi.string().optional().allow('').max(50).messages({
    'string.max': 'Promotion code must not exceed 50 characters',
  }),
  status: Joi.string().valid('active', 'disabled').messages({
    'any.only': 'Status must be either active or disabled',
  }),
})