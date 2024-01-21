const Joi = require('joi');
const { invalidData } = require('../utils/responseCode');

const replyMessage = Joi.object({
    name: Joi.string().required().error(() => {
        return invalidData('username');
    }),
    text: Joi.string().required().error(() => {
        return invalidData('text');
    })
})

module.exports = {
    replyMessage,
}