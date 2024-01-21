const mongoDB = require('mongoose');

const usersSchema = new mongoDB.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, 
        required: true
    },
    type: {
        type: String, 
        required: true
    },
    name: {
        type: String, 
        required: true
    },
    lastName: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true
    },
    lineId: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: true,
    },


}, { collection: 'Users' });

module.exports = mongoDB.model('Users', usersSchema);