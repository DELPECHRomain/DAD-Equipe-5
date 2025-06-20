const express = require('express');
const router = express.Router();
const profilecontroller = require('../controller/profile.controller');


router.post('/:id', profilecontroller.createProfile);
router.get('/:id', profilecontroller.getProfile);
router.put('/:id', profilecontroller.updateProfile);
router.delete('/:id', profilecontroller.deleteProfile);

module.exports = router;


