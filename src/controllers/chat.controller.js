const schema = require("../validates/chat.validate");
const bcrypt = require('bcryptjs');
const line = require('@line/bot-sdk');
const lineApi = require("../api/line.api");
const responseCode = require("../utils/responseCode");
const handleErrors = require("../utils/handleErrors");
const userTable = require('../models/users.model');
const chatTable = require('../models/chatHistory.model');
const jwt = require("jsonwebtoken");
const { response } = require("express");
const env = process.env.NODE_ENV || "local";
require("dotenv").config({ path: `.env.${env}` });

const secretKey = process.env.JWT_SECRET_KEY;
const lineAccessToken = process.env.LINE_ACCESS_TOKEN;
const lineClient = new line.messagingApi.MessagingApiClient({ channelAccessToken: lineAccessToken });

const getUsersList = async (req) => {
    const logSessionText = `chat/getUserList =>`;
    console.log(logSessionText, "start");

    let responseResult = {};
    try {

        // Get user list and map
        console.log(logSessionText, "get user list");
        const usersList = await userTable.find({ type: 'User' });
        if (usersList.length > 0) {
            const contactId = usersList.map(user => user.id);
            console.log(logSessionText, "userList:", usersList);

            // Get Last Message
            console.log(logSessionText, "get chat message");
            const chatMessages = await chatTable.find({ contactId: { $in: contactId } }).sort({ dateTime: 1 });
            console.log(logSessionText, "chatMessage:", chatMessages);

            // Map user list to chat messages
            console.log(logSessionText, "mapping userList & chatMessages");
            const chatMessageMap = chatMessages.reduce((map, message) => {
                if (!map[message.contactId]) {
                    map[message.contactId] = [];
                }
                const chatMessage = message._doc;
                delete chatMessage.__v;
                map[message.contactId].push(chatMessage);
                return map;
            }, {});

            // Prepare response
            const mergedUserList = usersList.map(user => {
                const messages = chatMessageMap[user.id] || [];
                const userData = user._doc;
                delete userData.password;
                delete userData.__v;
                return userData ? { ...userData, message: messages } : null;
            }).filter(Boolean);

            console.log(logSessionText, "success");
            responseResult = responseCode.success({ userList: mergedUserList });
        } else {
            console.log(logSessionText, "user not found ");
            responseResult = responseCode.success({ userList: [] });
        }

    } catch (error) {
        responseResult = handleErrors(logSessionText, error);
    }

    console.log(logSessionText, "response:", responseResult);
    console.log(logSessionText, "end");
    return responseResult;
}

const getImageChat = async (req, res) => {
    const body = req.query;
    const logSessionText = `chat/getImageChat =>`;
    console.log(logSessionText, "start");
    console.log(logSessionText, "body:", body);

    let responseResult = {};
    try {
        await schema.getImageChat.validateAsync(body);

        const { id } = body;

        const responseData = await lineApi.getContent(id);
        console.log(logSessionText, "end");

        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(responseData);

    } catch (error) {
        responseResult = handleErrors(logSessionText, error);

        console.log(logSessionText, "end");
        res.status(500).send(responseResult.body);
    }
}

module.exports = {
    getUsersList,
    getImageChat
};
