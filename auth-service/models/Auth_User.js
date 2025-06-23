const mongoose = require('mongoose');

const AuthUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  roles: { type: [String], default: ['user'] },
});

const Auth_User = mongoose.model('Auth_User', AuthUserSchema);
module.exports = Auth_User;
