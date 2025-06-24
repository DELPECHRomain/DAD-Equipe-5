const User = require('../models/User.js');

// Créer un user
exports.createUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = new User({ username, email });
    await user.save();
    res.status(201).json({ userId: user._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Vérifier si username déjà pris
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    const existing = await User.findOne({ username });
    res.json({ exists: !!existing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer un user par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search users by username (partiel insensible à la casse)
exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.query || '';
    const users = await User.find({
      username: { $regex: new RegExp(query, 'i') }
    }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
