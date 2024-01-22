const schema = require("../validates/line.validate");
const responseCode = require("../utils/responseCode");
const handleErrors = require("../utils/handleErrors");
const lineApi = require("../api/line.api");
const userTable = require('../models/users.model');
const chatTable = require('../models/chatHistory.model');
const line = require('@line/bot-sdk');
const env = process.env.NODE_ENV || "local";
require("dotenv").config({ path: `.env.${env}` });

// create LINE SDK client
const lineAccessToken = process.env.LINE_ACCESS_TOKEN;
const lineClient = new line.messagingApi.MessagingApiClient({ channelAccessToken: lineAccessToken });

// event handler webhook
const webhook = async (event) => {
    const logSessionText = `line/webhook =>`;

    console.log(logSessionText, "start");
    console.log(logSessionText, "event:", JSON.stringify(event));

    try {
        // Get socket.io
        const { io } = require('../app');

        const userId = event.source.userId;
        console.log(logSessionText, "type:", event.type);
        switch (event.type) {
            case "follow": {
                // Check existing richMenuAlias
                const shortId = userId.substring(0, 28).toLowerCase();
                const richMenuAliasId = `in-${shortId}`;
                const response = await lineClient.getRichMenuAlias(richMenuAliasId);
                if (!response.richMenuId) {
                    console.log(logSessionText, "richMenuis not existing");
                    // Create richmenu
                    console.log(logSessionText, "create RichMenuForNewUser");
                    lineApi.createRichMenuForNewUser(userId);
                } else {
                    await lineClient.linkRichMenuIdToUser(userId, response.richMenuId);
                }
                break;
            }
            case "message": {
                console.log(logSessionText, "handle message");

                // Get user data from database
                const user = await userTable.findOne({ lineId: userId });
                if (user) {
                    const message = event.message;
                    const messageType = message.type;

                    // Create new chat
                    console.log(logSessionText, "create new chatHistory");
                    const chat = await chatTable.create({
                        contactId: user.id,
                        contactName: user.name,
                        channel: "Line",
                        senderId: user.id,
                        senderType: user.type,
                        senderName: user.name,
                        dateTime: new Date(),
                        messageType: messageType,
                        detail: messageType === "text" ? message.text : message.id
                    });

                    const userData = user._doc;
                    const chatData = chat._doc;
                    userData._id = user.id;
                    chatData._id = chat.id;
                    delete userData.password;
                    delete userData.__v;
                    delete chatData.__v;

                    // Send SocketIo to client
                    const data = { user: userData, message: chatData };
                    io.emit('webhook', data);
                }
                break;
            }
            case "postback": {
                // Case profile
                if (event.postback && event.postback.data === "profile") {

                    // Get user data from db
                    const user = await userTable.findOne({ lineId: userId });
                    const userData = user ? user._doc : null;
                    if (userData) {
                        console.log(logSessionText, "existing user");

                        // send flex message to user
                        lineClient.pushMessage(lineApi.flexMessage(userData));
                        console.log(logSessionText, "send profile flex message");
                    } else throw responseCode.customError("User ID Line is already exist.");
                }
                break;
            }
        }
        console.log(logSessionText, "success");
    } catch (error) {
        return handleErrors(logSessionText, error);
    } finally {
        console.log(logSessionText, "end");
    }
}

// event handler webhook
const replyMessage = async (message) => {
    const logSessionText = `line/replyMessage =>`;

    console.log(logSessionText, "start");
    try {

        // Get user data from database
        const userData = await userTable.findOne({ _id: message.contactId });
        if (userData) {

            // Send message to user
            const body = {
                "to": userData.lineId,
                "messages": [
                    {
                        "type": 'text',
                        "text": message.detail
                    }]
            };
            lineClient.pushMessage(body);
            console.log(logSessionText, "handle message");

            // Create chat to database
            console.log(logSessionText, "Create new chat to database");
            delete message._id;
            await chatTable.create(message);

            console.log(logSessionText, "success");

        } else console.log(logSessionText, "data not found");

    } catch (error) {
        handleErrors(logSessionText, error);
    }

    console.log(logSessionText, "end");
}

module.exports = {
    webhook,
    replyMessage,
};
