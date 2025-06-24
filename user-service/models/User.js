const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
