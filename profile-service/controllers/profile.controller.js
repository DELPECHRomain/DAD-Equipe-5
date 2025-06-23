const Profile = require('../models/Profile.js');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3000/user-service';

// Helper pour récupérer un user par ID
const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/${userId}`);
    return response.data;
  } catch (err) {
    return null;
  }
};

// GET profile + user info
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const user = await getUserById(profile.userId);

    res.json({
      ...profile.toObject(),
      user: user ? { _id: user._id, username: user.username } : null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE profile
exports.createProfile = async (req, res) => {
  try {
    const profile = new Profile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE profile
exports.updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const user = await getUserById(profile.userId);

    res.json({
      ...profile.toObject(),
      user: user ? { _id: user._id, username: user.username } : null
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// DELETE profile
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SEARCH profiles
exports.searchProfiles = async (req, res) => {
  const query = req.query.query || "";

  try {
    if (query === "") {
      const profiles = await Profile.find({})
        .sort({ createdAt: 1 })
        .limit(5);

      const profilesWithUser = await Promise.all(profiles.map(async (profile) => {
        const user = await getUserById(profile.userId);
        return {
          ...profile.toObject(),
          user: user ? { _id: user._id, username: user.username } : null
        };
      }));

      return res.json(profilesWithUser);
    }

    const userResponse = await axios.get(`${USER_SERVICE_URL}/search`, {
      params: { query }
    });

    const matchingUserIds = userResponse.data.map(user => user._id);

    const profiles = await Profile.find({
      $or: [
        { userId: { $in: matchingUserIds } },
        { displayName: { $regex: new RegExp(query, 'i') } }
      ]
    }).limit(10);

    const profilesWithUser = await Promise.all(profiles.map(async (profile) => {
      const user = await getUserById(profile.userId);
      return {
        ...profile.toObject(),
        user: user ? { _id: user._id, username: user.username } : null
      };
    }));

    res.json(profilesWithUser);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const { currentUserId, userIdToFollow } = req.body;

    if (!currentUserId || !userIdToFollow) {
      return res.status(400).json({ message: "Paramètres manquants." });
    }

    if (currentUserId === userIdToFollow) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous suivre vous-même." });
    }

    if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(userIdToFollow)) {
      return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    const userToFollowObjectId = new mongoose.Types.ObjectId(userIdToFollow);

    const currentUserProfile = await Profile.findOne({ userId: currentUserObjectId });
    const targetUserProfile = await Profile.findOne({ userId: userToFollowObjectId });

    if (!currentUserProfile || !targetUserProfile) {
      return res.status(404).json({ message: "Profil introuvable." });
    }

    const isFollowing = currentUserProfile.following.some(followedId => followedId.equals(userToFollowObjectId));

    if (isFollowing) {
      currentUserProfile.following.pull(userToFollowObjectId);
      targetUserProfile.followers.pull(currentUserObjectId);
    } else {
      currentUserProfile.following.push(userToFollowObjectId);
      targetUserProfile.followers.push(currentUserObjectId);
    }

    await currentUserProfile.save();
    await targetUserProfile.save();

    res.json({ following: !isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
