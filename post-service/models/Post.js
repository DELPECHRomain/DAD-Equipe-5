const mongoose = require('mongoose');

// Schéma reply temporaire (vide pour la récursivité)
const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replies: [] // placeholder temporaire
});

// Ajout récursif
replySchema.add({ replies: [replySchema] });

const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true }
}, { _id: false });

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  content: { type: String, required: true },
  media: [mediaSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
  hashtags: [{ type: String }],
});

module.exports = mongoose.model('Post', postSchema);
