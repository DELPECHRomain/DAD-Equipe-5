const express = require('express');
const router = express.Router();
const profileController = require('../controller/profile.controller');


router.post('/', profileController.createProfile);
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.delete('/', profileController.deleteProfile);

module.exports = router;


