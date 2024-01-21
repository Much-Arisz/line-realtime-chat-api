const axios = require('axios');
const fs = require('fs');
const line = require('@line/bot-sdk');
const env = process.env.NODE_ENV || "local";
require("dotenv").config({ path: `.env.${env}` });

// create LINE SDK client
const lineBotsDataUrl = process.env.LINE_BOT_DATA_URL;
const lineAccessToken = process.env.LINE_ACCESS_TOKEN;
const lineClient = new line.messagingApi.MessagingApiClient({ channelAccessToken: lineAccessToken });
const header = { headers: { 'Authorization': `Bearer ${lineAccessToken}`, 'Content-Type': 'application/json' } };

const createRichMenuForNewUser = async (userId) => {
    const logSessionText = `createRichMenuForNewUser =>`;
    console.log(logSessionText, "start");

    let isLogin = true;
    let richMenuId = "";
    let aliasId = "";

    // 1. Create richmenu login
    richMenuId = await createRichMenu({ userId, isLogin });

    // 2. Upload richmenu login image 
    await uploadRichMenuImage({ richMenuId, isLogin });
    console.log(logSessionText, "upload richmenu login image");

    // 3. Create alias login
    aliasId = await createRichMenuAlias({ richMenuId, userId, isLogin });
    console.log(logSessionText, "create richmenu login alias");

    // 4. Set richmenu to User
    await lineClient.linkRichMenuIdToUser(userId, richMenuId);
    console.log(logSessionText, "set richmenu login to user");

    isLogin = false;
    // 5. Create richmenu logout
    richMenuId = await createRichMenu({ userId, aliasId, isLogin });
    console.log(logSessionText, "create richmenu login");

    // 6 Upload richmenu logout image 
    await uploadRichMenuImage({ richMenuId, isLogin });
    console.log(logSessionText, "upload richmenu logout image");

    // 7. Create alias logout
    await createRichMenuAlias({ richMenuId, userId, isLogin });
    console.log(logSessionText, "create richmenu login alias");

    console.log(logSessionText, "success");
}

const createRichMenu = async ({ userId, aliasId, isLogin = false }) => {
    const richMenuRequest = {
        size: {
            width: 2500,
            height: 843
        },
        selected: true,
        name: isLogin ? "register-login" : "profile-logout",
        chatBarText: "Manage account",
        areas: [
            {
                bounds: {
                    x: 0,
                    y: 0,
                    width: 1250,
                    height: 843
                },
                action:
                    isLogin ? {
                        type: "uri",
                        label: "register",
                        uri: `https://drum-star-stud.ngrok-free.app/user/register?userId=${userId}`
                    } : {
                        type: "postback",
                        data: "profile",
                        label: "profile",
                        displayText: "My Profile"
                    }
            },
            {
                bounds: {
                    x: 1250,
                    y: 0,
                    width: 1250,
                    height: 843
                },
                action:
                    isLogin ? {
                        type: "uri",
                        label: "login",
                        uri: `https://drum-star-stud.ngrok-free.app/user/login?userId=${userId}`
                    } : {
                        type: "richmenuswitch",
                        data: "switch",
                        richMenuAliasId: aliasId,
                    }
            }
        ]
    };

    const response = await lineClient.createRichMenu(richMenuRequest);
    const richMenuId = response.richMenuId;
    return richMenuId;
}

const uploadRichMenuImage = async ({ richMenuId, isLogin }) => {
    const imageFilePath = isLogin ? './src/images/register-login.jpg' : './src/images/profile-logout.jpg';
    const imageBuffer = fs.readFileSync(imageFilePath);

    const response = await axios.post(`${lineBotsDataUrl}/richmenu/${richMenuId}/content`, imageBuffer,
        { headers: { 'Content-Type': 'image/jpeg', 'Authorization': `Bearer ${lineAccessToken}` } });
    if (response.status !== 200) throw new Error("uploadRichMenuImage error");
}

const createRichMenuAlias = async ({ richMenuId, userId, isLogin }) => {
    const shortId = userId.substring(0, 28).toLowerCase();
    const richMenuAliasId = isLogin ? `in-${shortId}` : `out-${shortId}`;

    const data = { richMenuAliasId: richMenuAliasId, richMenuId: richMenuId };
    await lineClient.createRichMenuAlias(data);
    return richMenuAliasId;
}

const deleteRichMenu = async (userId) => {
    const logSessionText = `deleteRichMenu =>`;
    console.log(logSessionText, "start");

    // Get richmenu & alias Id
    const shortId = userId.substring(0, 28).toLowerCase();
    const richMenuAliasArray = [`in-${shortId}`, `out-${shortId}`];
    const richMenu = await Promise.all(richMenuAliasArray.map(id => lineClient.getRichMenuAlias(id)));
    console.log(logSessionText, "get richmenu");

    // delete richmenu & alias Id
    const deleteRichMenuArray = [];
    richMenuAliasArray.map((aliasId, i) => {
        deleteRichMenuArray.push(lineClient.deleteRichMenuAlias(aliasId));
        deleteRichMenuArray.push(lineClient.deleteRichMenu(richMenu[i].richMenuId));
    })
    Promise.all(deleteRichMenuArray);
    console.log(logSessionText, "delete richmenu");

    console.log(logSessionText, "success");
}

const flexMessage = (userData) => {
    return {
        "to": userData.lineId,
        "messages": [
            {
                "type": "flex",
                "altText": "User Profile",
                "contents": {
                    "type": "bubble",
                    "header": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "text",
                                "text": "My Profile",
                                "weight": "bold",
                                "size": "lg"
                            }
                        ],
                        "margin": "10px"
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Name",
                                                "size": "sm"
                                            }
                                        ],
                                        "width": "108px"
                                    },
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": userData.name,
                                                "size": "sm"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Last Name",
                                                "size": "sm"
                                            }
                                        ],
                                        "width": "108px"
                                    },
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": userData.lastName,
                                                "size": "sm"
                                            }
                                        ]
                                    }
                                ],
                                "margin": "10px"
                            },
                            {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Email",
                                                "size": "sm"
                                            }
                                        ],
                                        "width": "108px"
                                    },
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": userData.email,
                                                "size": "sm"
                                            }
                                        ]
                                    }
                                ],
                                "margin": "10px"
                            }
                        ]
                    },
                    "styles": {
                        "header": {
                            "backgroundColor": "#BEBEBE"
                        }
                    }
                }
            }
        ]
    }
}

const getContent = async (id) => {

    header.responseType = 'arraybuffer';
    const response = await axios.get(`${lineBotsDataUrl}/message/${id}/content`, header);
    if (response.status !== 200) throw new Error("uploadRichMenuImage error");
    return response.data;
}

module.exports = {
    createRichMenuForNewUser,
    createRichMenu,
    uploadRichMenuImage,
    createRichMenuAlias,
    deleteRichMenu,
    flexMessage,
    getContent
};