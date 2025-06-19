const express = require('express');
const router = express.Router();
const postController = require('../controller/post.controller');

router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);


module.exports = router;
