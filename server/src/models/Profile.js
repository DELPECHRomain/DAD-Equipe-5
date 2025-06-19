const mongoose = require('mongoose');
const { use } = require('react');

const ProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    displayName: { type: String, required: true },
    bio: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    bannerImage: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Profile', ProfileSchema);