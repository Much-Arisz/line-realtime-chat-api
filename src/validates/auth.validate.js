const Joi = require('joi');
const { invalidData } = require('../utils/responseCode');

const register = Joi.object({
    username: Joi.string().required().error(() => {
        throw invalidData('Username');
    }),
    password: Joi.string().required().error(() => {
        throw invalidData('Password');
    }),
    type: Joi.string().required().error(() => {
        throw invalidData('Type');
    }),
    name: Joi.string().required().error(() => {
        throw invalidData('Name');
    }),
    lastName: Joi.string().required().error(() => {
        throw invalidData('Last Name');
    }),
    email: Joi.string().required().email().error(() => {
        throw invalidData('Email');
    }),
    lineId: Joi.string().allow(null).error(() => {
        throw invalidData('Line Id');
    })
})

const login = Joi.object({
    username: Joi.string().required().error(() => {
        throw invalidData('username');
    }),
    password: Joi.string().required().error(() => {
        throw invalidData('password');
    })
})

module.exports = {
    register,
    login,
}