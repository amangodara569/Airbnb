const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    city: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.string().allow("", null)
});
