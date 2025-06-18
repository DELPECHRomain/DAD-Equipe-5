const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
  password:   { type: String, required: true },
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true  
});

module.exports = mongoose.model('User', userSchema);
