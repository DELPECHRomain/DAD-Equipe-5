const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');

router.get('/:userId', profileController.getProfile);
router.post('/', profileController.createProfile);
router.put('/:userId', profileController.updateProfile);
router.delete('/:userId', profileController.deleteProfile);

module.exports = router;
