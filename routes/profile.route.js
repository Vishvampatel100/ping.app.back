import express from "express";
import mongoose from "mongoose";
import Profile from "../models/Profile.model.js";
import admin from "../firebase/firebaseAdmin.js";

const profileRouter = express.Router();

profileRouter.get('/', async(req, res) => {
    try {
        const profiles = await Profile.find();
        res.status(200).json({ success: true, data: profiles });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

profileRouter.get('/email/:email', async(req, res) => {
    const { email } = req.params;

    try {
        const profile = await Profile.findOne({ email });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

profileRouter.post('/', async(req, res) => {
    const profile = req.body;

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    profile.uid = decodedToken.uid;

    if(!profile.fname || !profile.sname || !profile.bdate || !profile.email || !profile.displayName || !profile.tagline || !profile.uid) {
        res.status(400).json({ success: false, message: 'Please fill all the required fields' });
        return;
    }
    profile.profileid = await generateUniqueProfileId();
    const newProfile = new Profile(profile);
    try {
        await newProfile.save();
        res.status(201).json({ success: true, data: newProfile });
    } catch (error) {  
        res.status(500).json({ success: false, message: "Server Error" });
        
        console.log('Error fetching profile:', error.message);
    }
});

profileRouter.put('/:id', async(req, res) => {
    const { id } = req.params;
    const profile = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ success: false, message: 'Profile not found' });
        return;
    }

    try {
        const updatedProfile = await Profile.findByIdAndUpdate(id, profile, { new: true });
        res.status(200).json({ success: true, data: updatedProfile });
    } catch (error) {
        res.status(404).json({ success: false, message: 'Profile not found' });
    }
});

profileRouter.delete('/:id', async(req, res) => {
    const { id } = req.params;

    try{
        await Profile.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Profile deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const generateUniqueProfileId = async () => {
    let unique = false;
    let profileId;

    while (!unique) {
        profileId = Math.random().toString().substr(2, 10); // Generate random 10 digit ID
        profileId = "PFL"+profileId
        const existingChannel = await Profile.findOne({ profileId });
        if (!existingChannel) {
            unique = true;
        }
    }

    return profileId;
};

export default profileRouter;