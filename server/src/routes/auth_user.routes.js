const authUserController = require('../controller/auth_user.controller');

const express = require('express');

const router = express.Router();

router.post('/register', authUserController.register);

router.post('/login', authUserController.login);

router.get('/profile', authUserController.getProfile);

module.exports = router;