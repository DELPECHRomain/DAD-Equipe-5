const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  displayName: { type: String, required: true },
  bio: { type: String },
  profileImage: { type: String },
  bannerImage: { type: String },
  location: { type: String },
  website: { type: String },
  followers: [{ type: mongoose.Schema.Types.ObjectId}],
  following: [{ type: mongoose.Schema.Types.ObjectId}],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);
