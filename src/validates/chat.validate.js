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

const getImageChat = Joi.object({
    id: Joi.string().required().error(() => {
        return invalidData('username');
    })
})

module.exports = {
    replyMessage,
    getImageChat
}