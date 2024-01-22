const express = require("express");
const router = express.Router();
const controller = require('../controllers/chat.controller');
const { middleware } = require("../middleware");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(middleware);

router.post("/getUserList", async (req, res) => {
    const response = await controller.getUsersList(req);
    res.status(response.statusCode).send(response.body);
});

router.post("/getImageChat", async (req, res) => {
    await controller.getImageChat(req, res);
});

module.exports = router;