const schema = require("../validates/auth.validate");
const bcrypt = require('bcryptjs');
const line = require('@line/bot-sdk');
const responseCode = require("../utils/responseCode");
const handleErrors = require("../utils/handleErrors");
const userTable = require('../models/users.model');
const jwt = require("jsonwebtoken");
const env = process.env.NODE_ENV || "local";
require("dotenv").config({ path: `.env.${env}` });

const secretKey = process.env.JWT_SECRET_KEY;
const lineAccessToken = process.env.LINE_ACCESS_TOKEN;
const lineClient = new line.messagingApi.MessagingApiClient({ channelAccessToken: lineAccessToken });

const register = async (req) => {
    const body = req.body;
    const logSessionText = `auth/register =>`;

    console.log(logSessionText, "start");
    console.log(logSessionText, "body:", JSON.stringify(body));

    let responseResult = {};
    try {
        // Validate request parameters
        await schema.register.validateAsync(body);

        const { username, password, type, name, lastName, email, lineId } = body;

        // Check username is exist
        let existingUser = await userTable.findOne({ username });
        if (existingUser) {
            console.log(logSessionText, "existing user");
            throw responseCode.customError("Username is already exist.");
        }

        let image = "";
        if (type === "User") {
            if (!lineId) throw responseCode.invalidData("Line ID");
            let existingLineId = await userTable.findOne({ lineId });
            if (existingLineId) {
                console.log(logSessionText, "existing user");
                throw responseCode.customError("User ID Line is already exist.");
            }
            const profile = await lineClient.getProfile(lineId);
            image = profile.pictureUrl;
        }

        // Create new user
        const newUser = new userTable({ username, password, type, name, lastName, email, lineId: lineId ?? null, image });
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        await newUser.save();

        // Generate token
        const jwtData = { id: newUser.id };
        const jwtKeys = jwt.sign(jwtData, secretKey);

        // Prepare response
        const userData = newUser._doc;
        delete userData.password;
        delete userData.__v;

        console.log(logSessionText, "success");
        responseResult = responseCode.success({ ...userData, token: jwtKeys });

    } catch (error) {
        responseResult = handleErrors(logSessionText, error);
    }

    console.log(logSessionText, "response:", responseResult);
    console.log(logSessionText, "end");
    return responseResult;
}

const login = async (req) => {
    const body = req.body;
    const logSessionText = `auth/login =>`;

    console.log(logSessionText, "start");
    console.log(logSessionText, "body:", JSON.stringify(body));

    let responseResult = {};
    try {
        // Validate request parameters
        await schema.login.validateAsync(body);

        const { username, password } = body;

        // Chceck username is exist
        const user = await userTable.findOne({ username });
        const userData = user ? user._doc : null;
        if (!userData) {
            console.log(logSessionText, "user not found");
            responseResult = responseCode.customMessage("Username or password incorrect");
        } else {
            console.log(logSessionText, "has userData");

            // Compare password against database
            const isPasswordValid = await bcrypt.compare(password, userData.password);
            if (!isPasswordValid) {
                console.log(logSessionText, "invalid password");
                return responseCode.customMessage("Username or password incorrect");

            } else delete userData.password;

            // Generate token
            console.log(logSessionText, "userId", user.id);
            console.log(logSessionText, "generated token");
            const jwtData = { id: user.id };
            const jwtKeys = jwt.sign(jwtData, secretKey);


            console.log(logSessionText, "user type:", userData.type);
            if (userData.type === "User") {

                // Change richmenu from login to logout
                console.log(logSessionText, "change to richmenu logout");
                const shortId = userData.lineId.substring(0, 28).toLowerCase();
                const richMenuAliasId = `out-${shortId}`;
                const richMenu = await lineClient.getRichMenuAlias(richMenuAliasId);
                const richMenuId = richMenu.richMenuId;
                console.log(logSessionText, "get richmenu id");

                await lineClient.linkRichMenuIdToUser(userData.lineId, richMenuId);
                console.log(logSessionText, "set new richmenu to user");
            }

            // Prepare response
            delete userData.password;
            delete userData.__v;

            console.log(logSessionText, "success");
            responseResult = responseCode.success({ ...userData, token: jwtKeys });
        }
    } catch (error) {
        responseResult = handleErrors(logSessionText, error);
    }

    console.log(logSessionText, "response:", responseResult);
    console.log(logSessionText, "end");
    return responseResult;
};

module.exports = {
    register,
    login,
};
