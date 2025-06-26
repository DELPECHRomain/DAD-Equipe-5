const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controllers');

router.post('/posts', postController.createPost);
router.get('/posts', postController.getAllPosts);
router.get('/posts/user/:userId', postController.getPostsByUser);
router.post('/posts/:postId/replies', postController.addReply);
router.post('/posts/:postId/like', postController.toggleLike);
router.post('/posts/following', postController.getPostsByFollowing);
router.get('/posts/hashtag/:tag', postController.getPostsByHashtag);


module.exports = router;
