const Post = require('../models/Post.js');
const axios = require('axios');
require('dotenv').config();

const PROFILE_SERVICE_URL = 'http://profile-service:3001/profile-service';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3000/user-service';

const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(`${PROFILE_SERVICE_URL}/user/${userId}`);
    return response.data;
  } catch {
    return null;
  }
};

const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/${userId}`);
    return response.data;
  } catch {
    return null;
  }
};

const getFullUserData = async (userId) => {
  const [user, profile] = await Promise.all([getUserById(userId), getUserProfile(userId)]);
  if (!user && !profile) return null;
  return {
    username: user?.username || null,
    displayName: profile?.displayName || null,
  };
};

exports.createPost = async (req, res) => {
  try {
    const { userId, content, media } = req.body;
    if (!userId || !content) return res.status(400).json({ message: "userId et content sont requis." });

    const user = await getUserProfile(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

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

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    const postsWithUserData = await Promise.all(posts.map(async (post) => {
      const user = await getUserProfile(post.userId);
      const repliesWithUser = await Promise.all(post.replies.map(async function enrichReply(reply) {
        const replyUser = await getUserProfile(reply.userId);
        const nestedReplies = reply.replies ? await Promise.all(reply.replies.map(enrichReply)) : [];
        return {
          ...reply.toObject(),
          user: replyUser ? { username: replyUser.username, displayName: replyUser.displayName } : null,
          replies: nestedReplies
        };
      }));

      return {
        ...post.toObject(),
        user: user ? { username: user.username, displayName: user.displayName } : null,
        replies: repliesWithUser
      };
    }));

    res.json(postsWithUserData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    const user = await getFullUserData(req.params.userId);

    const postsWithUserData = await Promise.all(posts.map(async (post) => {
      const repliesWithUser = await Promise.all(post.replies.map(async function enrichReply(reply) {
        const replyUser = await getFullUserData(reply.userId);
        const nestedReplies = reply.replies ? await Promise.all(reply.replies.map(enrichReply)) : [];
        return {
          ...reply.toObject(),
          user: replyUser || null,
          replies: nestedReplies
        };
      }));

      return {
        ...post.toObject(),
        user: user ? { username: user.username, displayName: user.displayName } : null,
        replies: repliesWithUser
      };
    }));

    res.json(postsWithUserData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    const enrichedPost = await Post.findById(post._id);

    const enrichedReplies = await Promise.all(enrichedPost.replies.map(async function enrichReply(reply) {
      const replyUser = await getFullUserData(reply.userId);
      const nestedReplies = reply.replies ? await Promise.all(reply.replies.map(enrichReply)) : [];
      return {
        ...reply.toObject(),
        user: replyUser || null,
        replies: nestedReplies
      };
    }));

    const postUser = await getFullUserData(enrichedPost.userId);

    res.status(200).json({
      ...enrichedPost.toObject(),
      user: postUser || null,
      replies: enrichedReplies
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const addReplyToReplies = (replies, parentReplyId, newReply) => {
  for (const reply of replies) {
    if (reply._id.toString() === parentReplyId) {
      if (!reply.replies) reply.replies = [];
      reply.replies.push(newReply);
      return true;
    }
    if (reply.replies && reply.replies.length > 0) {
      const added = addReplyToReplies(reply.replies, parentReplyId, newReply);
      if (added) return true;
    }
  }
  return false;
};

exports.addReply = async (req, res) => {
  try {
    const { userId, content, parentReplyId } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const user = await getFullUserData(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Créer un subdocument reply
    const newReply = post.replies.create({
      userId,
      content,
      replies: []
    });

    if (parentReplyId) {
      const added = addReplyToReplies(post.replies, parentReplyId, newReply);
      if (!added) return res.status(404).json({ message: "Commentaire parent introuvable" });
    } else {
      post.replies.push(newReply);
    }

    await post.save();

    const enrichedPost = await Post.findById(post._id);

    const enrichReplies = async (replies) => {
      return Promise.all(replies.map(async function enrichReply(reply) {
        const replyUser = await getFullUserData(reply.userId);
        const nestedReplies = reply.replies ? await enrichReplies(reply.replies) : [];
        return {
          ...reply.toObject(),
          user: replyUser ? { _id: reply.userId, username: replyUser.username, displayName: replyUser.displayName } : null,
          replies: nestedReplies,
        };
      }));
    };

    const enrichedReplies = await enrichReplies(enrichedPost.replies);
    const postUser = await getFullUserData(enrichedPost.userId);

    res.status(201).json({
      ...enrichedPost.toObject(),
      user: postUser || null,
      replies: enrichedReplies,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPostsByFollowing = async (req, res) => {
  try {
    const { followingIds } = req.body;

    if (!Array.isArray(followingIds) || followingIds.length === 0) {
      return res.status(400).json({ message: "followingIds doit être un tableau non vide" });
    }

    const posts = await Post.find({ userId: { $in: followingIds } }).sort({ createdAt: -1 });

    const postsWithUserData = await Promise.all(posts.map(async (post) => {
      const user = await getFullUserData(post.userId);

      const repliesWithUser = await Promise.all(post.replies.map(async function enrichReply(reply) {
        const replyUser = await getFullUserData(reply.userId);
        const nestedReplies = reply.replies ? await Promise.all(reply.replies.map(enrichReply)) : [];
        return {
          ...reply.toObject(),
          user: replyUser || null,
          replies: nestedReplies
        };
      }));

      return {
        ...post.toObject(),
        user: user || null,
        replies: repliesWithUser
      };
    }));

    res.json(postsWithUserData);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
