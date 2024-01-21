const express = require("express");
const crypto = require('crypto');
const controller = require('../controllers/line.controller');
const router = express.Router();
const line = require('@line/bot-sdk');
const env = process.env.NODE_ENV || "local";
require("dotenv").config({ path: `.env.${env}` });

const config = {
    channelAccessToken: `${process.env.LINE_ACCESS_TOKEN}`,
    channelSecret: `${process.env.LINE_SECRET_TOKEN}`
};

router.use('/webhook', line.middleware(config));

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/webhook', (req, res) => {
    try {
        const signature = req.get('X-Line-Signature');
        const body = JSON.stringify(req.body);

        if (!line.validateSignature(body, config.channelSecret, signature)) {
            console.error('Invalid signature');
            return res.status(401).end();
        }
        const events = req.body.events;
        const results = events.map(controller.webhook);
        console.log(results);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});

module.exports = router;