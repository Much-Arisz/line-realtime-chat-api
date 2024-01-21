const mongoDB = require('mongoose');

const chatHistorySchema = new mongoDB.Schema({
    contactId: {
        type: String,
        required: true,
    },
    contactName: {
        type: String,
        required: true,
    },
    channel: {
        type: String, 
        required: true
    },
    senderId: {
        type: String, 
        required: true
    },
    senderType: {
        type: String, 
        required: true
    },
    senderName: {
        type: String, 
        required: true
    },
    dateTime: {
        type: Date, 
        required: true
    },
    messageType: {
        type: String, 
        required: true
    },
    detail: {
        type: String, 
        required: true
    }

}, { collection: 'ChatHistory' });

module.exports = mongoDB.model('ChatHistory', chatHistorySchema);