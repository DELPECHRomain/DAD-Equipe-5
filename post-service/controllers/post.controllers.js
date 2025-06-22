const Post = require('../models/Post.js');
const User = require('../models/User.js');

// Créer un post
exports.createPost = async (req, res) => {
  try {
    const { userId, content, media } = req.body;

    // Validation basique
    if (!userId || !content) {
      return res.status(400).json({ message: "userId et content sont requis." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Création du post
    const post = new Post({
      userId,
      content: content.trim(),
      media: Array.isArray(media) ? media : [],
      likes: [],
      replies: []
    });

    await post.save();

    res.status(201).json(post);

  } catch (err) {
    console.error("Erreur création post :", err);
    res.status(500).json({ message: err.message });
  }
};


// Récupérer tous les posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "username displayName")
      .populate("replies.userId", "username displayName");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer les posts d’un utilisateur
exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("userId", "username displayName")
      .populate("replies.userId", "username displayName");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ajouter une réponse à un post
exports.addReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    post.replies.push({
      userId: req.body.userId,
      content: req.body.content,
    });

    await post.save();

    // Recharger le post avec les infos utilisateur peuplées avant de renvoyer
    const populatedPost = await Post.findById(post._id)
      .populate("userId", "username displayName")
      .populate("replies.userId", "username displayName");

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const userId = req.body.userId;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("userId", "username displayName")
      .populate("replies.userId", "username displayName");

    res.status(200).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Récupérer les posts des utilisateurs suivis (followingIds)
exports.getPostsByFollowing = async (req, res) => {
  try {
    const { followingIds } = req.body;

    if (!Array.isArray(followingIds) || followingIds.length === 0) {
      return res.status(400).json({ message: "followingIds doit être un tableau non vide" });
    }

    // Recherche posts où userId est dans la liste followingIds, triés du plus récent au plus ancien
    const posts = await Post.find({ userId: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .populate("userId", "username displayName")
      .populate("replies.userId", "username displayName");

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


