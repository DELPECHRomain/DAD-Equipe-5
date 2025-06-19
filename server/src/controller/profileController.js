const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');
const { get } = require('mongoose');

module.exports = {

    createProfile: async (req, res) => {
        try {

            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const {userId} = jwt.verify(token, process.env.JWT_SECRET);

            const existingProfile = await Profile.findOne({ userId });
            if (existingProfile) {
                return res.status(400).json({ message: "Profile already exists" });
            }

            const { displayName, bio, profileImage, bannerImage, location, website } = req.body;
            const newProfile = new Profile({
                userId,
                displayName,
                bio,
                profileImage,
                bannerImage,
                location,
                website
            });

            await newProfile.save();
            res.status(201).json({ message: "Profile created successfully", profile: newProfile });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }

    },

    getProfile: async (req, res) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { userId } = jwt.verify(token, process.env.JWT_SECRET);
            const profile = await Profile.findOne({ userId });

            if (!profile) {
                return res.status(404).json({ message: "Profile not found" });
            }

            res.status(200).json(profile);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { userId } = jwt.verify(token, process.env.JWT_SECRET);
            const updatedProfile = await Profile.findOneAndUpdate(
                { userId },
                { $set: req.body },
                { new: true }
            );

            if (!updatedProfile) {
                return res.status(404).json({ message: "Profile not found" });
            }

            res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    deleteProfile: async (req, res) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { userId } = jwt.verify(token, process.env.JWT_SECRET);
            const deletedProfile = await Profile.findOneAndDelete({ userId });

            if (!deletedProfile) {
                return res.status(404).json({ message: "Profile not found" });
            }

            res.status(200).json({ message: "Profile deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    }


}