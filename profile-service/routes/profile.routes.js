const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
router.post('/follow', profileController.followUser);
router.get('/search', profileController.searchProfiles);

router.get('/user/:userId', profileController.getProfile);
router.post('/', profileController.createProfile);
router.put('/user/:userId', profileController.updateProfile);
router.delete('/user/:userId', profileController.deleteProfile);



module.exports = router;
