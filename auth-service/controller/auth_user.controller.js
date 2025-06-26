const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Auth_User = require('../models/Auth_User.js');
const axios = require('axios');
require('dotenv').config();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3000/user-service';
const PROFILE_SERVICE_URL = 'http://profile-service:3001/profile-service';

module.exports = {

  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const emailAlreadyExists = await Auth_User.findOne({ email });
      if (emailAlreadyExists) {
        return res.status(400).json({ message: "Un compte existe déjà avec cet email." });
      }

      const userExistsRes = await axios.get(`${USER_SERVICE_URL}/check-username`, {
        params: { username }
      });

      if (userExistsRes.data.exists) {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const userResponse = await axios.post(`${USER_SERVICE_URL}/create`, {
        username,
        email
      });

      const userId = userResponse.data.userId;

      const newAuth = new Auth_User({
        userId,
        email,
        passwordHash,
        createdAt: new Date(),
        isActive: true,
        roles: ["user"]
      });
      await newAuth.save();

      await axios.post(`${PROFILE_SERVICE_URL}/`, {
        userId: userId,
        displayName: username,
        bio: "",
        profileImage: "",
        bannerImage: "",
        location: "",
        website: "",
        followers: [],
        following: [],
        createdAt: new Date()
      });


      return res.status(201).json({ status: true, message: "Compte créé avec succès." });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const authUser = await Auth_User.findOne({ email });
      if (!authUser) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect." });
      }

      const validPassword = await bcrypt.compare(password, authUser.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect." });
      }

      const userResponse = await axios.get(`${USER_SERVICE_URL}/${authUser.userId}`);
      const username = userResponse.data.username;

      authUser.lastLogin = new Date();
      await authUser.save();

      const key = process.env.JWT_SECRET || "jwttokenkey";
      const token = jwt.sign(
        { userId: authUser.userId, roles: authUser.roles, username },
        key,
        { expiresIn: '1h' }
      );

      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

      return res.status(200).json({
        status: true,
        message: "Connexion réussie.",
        token
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

};