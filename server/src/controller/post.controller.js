const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

// Middleware pour extraire l'utilisateur depuis le JWT
function getUserIdFromToken(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Token manquant');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.id;
}

exports.createPost = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const newPost = new Post({ content: req.body.content, author: userId });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'username');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: 'Post non trouvé' });
    if (post.author.toString() !== userId) return res.status(403).json({ error: 'Non autorisé' });

    post.content = req.body.content || post.content;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: 'Post non trouvé' });
    if (post.author.toString() !== userId) return res.status(403).json({ error: 'Non autorisé' });

    await post.deleteOne();
    res.status(200).json({ message: 'Post supprimé' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
