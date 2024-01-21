const express = require("express");
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { middleware } = require("../middleware");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/register", async (req, res) => {
    const response = await controller.register(req);
    res.status(response.statusCode).send(response.body);
});

router.post("/login", async (req, res) => {
    const response = await controller.login(req);
    res.status(response.statusCode).send(response.body);
});

module.exports = router;