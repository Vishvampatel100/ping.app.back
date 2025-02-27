import express from "express";
import mongoose from "mongoose";
import Channel from "../models/Channel.model.js";
import Profile from "../models/Profile.model.js";
import admin from "../firebase/firebaseAdmin.js";

const channelRouter = express.Router();

channelRouter.get('/', async(req, res) => {
    try {
        const channels = await Channel.find();
        res.status(200).json({ success: true, data: channels });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

channelRouter.post('/', async(req, res) => {
    const channel = req.body;
    channel.channelid = await generateUniqueChannelId();

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    channel.ownerid = await getOwnerId(uid);

    if(!channel.privacycd || !channel.channelname || !channel.channeltypecd || !channel.tagline || !channel.ownerid) {
        res.status(400).json({ success: false, message: 'Please fill all the required fields' });
        return;
    }

    const newChannel = new Channel(channel);
    try {
        await newChannel.save();
        res.status(201).json({ success: true, data: newChannel });
    } catch (error) {  
        res.status(500).json({ success: false, message: "Server Error" });
        console.log(error);
    }
});

channelRouter.put('/:id', async(req, res) => {
    const { id } = req.params;
    const channel = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ success: false, message: 'Channel not found' });
        return;
    }

    try {
        const updatedChannel = await Channel.findByIdAndUpdate(id, channel, { new: true });
        res.status(200).json({ success: true, data: updatedChannel });
    } catch (error) {
        res.status(404).json({ success: false, message: 'Channel not found' });
    }
});

channelRouter.delete('/:id', async(req, res) => {
    const { id } = req.params;

    try{
        await Channel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Channel deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const generateUniqueChannelId = async () => {
    let unique = false;
    let channelId;

    while (!unique) {
        channelId = Math.random().toString().substr(2, 10); // Generate random 10 digit ID
        channelId = "CNL"+channelId
        const existingChannel = await Channel.findOne({ channelId });
        if (!existingChannel) {
            unique = true;
        }
    }

    return channelId;
};

const getOwnerId = async (uid) => {
    const profile = await Profile.findOne({ uid });
    return profile.profileid;
};

export default channelRouter;