const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Auth_User = require('../models/Auth_User.js');
const User = require('../models/User.js');
const Profile = require('../models/Profile.js');


module.exports = {

  // REGISTER
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const emailAlreadyExists = await Auth_User.findOne({ email });
      if (emailAlreadyExists) {
        return res.status(400).json({ message: "Un compte existe déjà avec cet email." });
      }

      const usernameAlreadyExists = await User.findOne({ username });
      if (usernameAlreadyExists) {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        createdAt: new Date(),
        isVerified: false
      });
      await newUser.save();

      const newAuth = new Auth_User({
        userId: newUser._id,
        email,
        passwordHash,
        createdAt: new Date(),
        isActive: true,
        roles: ["user"]
      });
      await newAuth.save();

      const newProfile = new Profile({
        userId: newUser._id,
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
      await newProfile.save();

      return res.status(201).json({ status: true, message: "Compte créé avec succès." });

    } catch (error) {
      res.json({ error });
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

      const user = await User.findById(authUser.userId);
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé." });
      }

      authUser.lastLogin = new Date();
      await authUser.save();

      const key = "jwttokenkey";
      const token = jwt.sign(
        { userId: authUser.userId, roles: authUser.roles, username: user.username },
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
      res.json({ error });
    }
  }


};
