const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/create', userController.createUser);
router.get('/check-username', userController.checkUsername);
router.get('/search', userController.searchUsers);
router.get('/:userId', userController.getUserById);

module.exports = router;
