const express = require('express');
const router  = express.Router();
const profileController = require('../controllers/profile.controller');

const upload = require('../middleware/upload');  

router.post('/follow', profileController.followUser);
router.get('/search', profileController.searchProfiles);
router.get('/:userId',     profileController.getProfile);
router.post('/',           profileController.createProfile);
router.put('/:userId',     profileController.updateProfile);
router.delete('/:userId',  profileController.deleteProfile);

router.put(
  '/:userId/images',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'bannerImage',  maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = {};

      if (req.files.profileImage)
        updates.profileImage = `/${req.files.profileImage[0].path}`;
      if (req.files.bannerImage)
        updates.bannerImage  = `/${req.files.bannerImage[0].path}`;

      const profile = await profileController.updateProfileImages(userId, updates);
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur upload images' });
    }
  }
);

module.exports = router;
