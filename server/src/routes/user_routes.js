const express = require('express');
const {
  registerUser,
  loginUser,
  getUserById,
  verifyUser
} = require('../controller/usersController');
// const auth = require('../middlewares/auth'); // non utilisé pour l'instant

const router = express.Router();

router.post('/register', registerUser);
router.post('/login',    loginUser);
router.get('/:id',        getUserById);       
router.patch('/:id/verify', verifyUser);      

module.exports = router;
