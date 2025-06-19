const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 280 },
  createdAt: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Post', postSchema);