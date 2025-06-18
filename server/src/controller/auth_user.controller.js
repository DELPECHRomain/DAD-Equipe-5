const express = require('express');
const bcrypt = require('bcrypt');

const Auth_User = require('../models/Auth_User.js');
const jwt = require('jsonwebtoken');

module.exports = {

    register: async (req, res) => {
        const { username, email, password } = req.body;
        const emailAlreadyExists = await Auth_User.findOne({ email });
        if (emailAlreadyExists) {
            return res.status(400).json({ message: "user already exists with this email." })
        }

        const usernameAlreadyExists = await Auth_User.findOne({ username });
        if (usernameAlreadyExists) {
            return res.status(400).json({ message: "user already exists with this username." })
        }

        const hashpassword = await bcrypt.hash(password, 10);

        const newUser = new Auth_User({
            username,
            email,
            password: hashpassword,
        });

        await newUser.save();
        return res.json({ status: true, message: "record registered" })

    },

    login: async (req, res) => {
        const { email, password } = req.body;

        const user = await Auth_User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "user or password's incorrect" });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: "user or password's incorrect" });
        }

        const key = "jwttokenkey";
        const token = jwt.sign({ username: user.username }, key, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, maxAge: 360000 });
        return res.json({ status: true, message: "login successfully", token });
    }

};