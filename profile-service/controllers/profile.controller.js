const Profile = require('../models/Profile.js');
const User = require('../models/User.js');

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId })
      .populate('userId', 'username'); 

    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
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
    res.json(profile);
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

exports.searchProfiles = async (req, res) => {
  
  const query = req.query.query || "";

  try {
    if (query === "") {
      // Retourne les 5 premiers profils avec username
      const profiles = await Profile.find({})
        .sort({ createdAt: 1 })
        .limit(5)
        .populate('userId', 'username');

      return res.json(profiles);
    }

    const regexQuery = new RegExp(query, "i");

    const profiles = await Profile.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $match: {
          $or: [
            { "user.username": { $regex: regexQuery } },
            { "displayName": { $regex: regexQuery } }
          ]
        }
      },
      { $limit: 10 },
      {
        $project: {
          userId: 1,
          displayName: 1,
          bio: 1,
          profileImage: 1,
          bannerImage: 1,
          location: 1,
          website: 1,
          followers: 1,
          following: 1,
          createdAt: 1,
          user: {
            _id: 1,
            username: 1
          }
        }
      }
    ]);

    res.json(profiles);

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

    const currentUserProfile = await Profile.findOne({ userId: currentUserId });
    const targetUserProfile = await Profile.findOne({ userId: userIdToFollow });

    if (!currentUserProfile || !targetUserProfile) {
      return res.status(404).json({ message: "Profil introuvable." });
    }

    const isFollowing = currentUserProfile.following.includes(userIdToFollow);

    if (isFollowing) {
      currentUserProfile.following.pull(userIdToFollow);
      targetUserProfile.followers.pull(currentUserId);
    } else {
      currentUserProfile.following.push(userIdToFollow);
      targetUserProfile.followers.push(currentUserId);
    }

    await currentUserProfile.save();
    await targetUserProfile.save();

    res.json({ following: !isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// profile.controller.js
exports.updateProfileImages = async (userId, updates) => {
  return await Profile.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true }
  );
};


