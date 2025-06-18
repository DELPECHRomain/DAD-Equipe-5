const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (await User.findOne({ email })) 
      return res.status(400).json({ message: 'Email already in use' });
    if (await User.findOne({ username })) 
      return res.status(400).json({ message: 'Username already in use' });

    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ username, email, password: hash });
    res.status(201).json({
      _id:       u._id,
      username:  u.username,
      email:     u.email,
      createdAt: u.createdAt,
      isVerified:u.isVerified
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u || !await bcrypt.compare(password, u.password))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7*24*3600*1000 });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
