const userController = require('../controller/user.controller');

const express = require('express');

const router = express.Router();

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get('/profile', userController.getProfile);


module.exports = router;