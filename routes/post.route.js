import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.model.js";
import admin from "../firebase/firebaseAdmin.js";
import Profile from "../models/Profile.model.js";

const postRouter = express.Router();

// postRouter.get('/', async(req, res) => {
//     try {
//         const posts = await Post.find();
//         res.status(200).json({ success: true, data: posts });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// });

//get posts by channelId
postRouter.get('/channel/:channelId', async(req, res) => {
    const { channelId } = req.params;

    
    try {
        const posts = await Post.aggregate([
            { $match: { channelId: channelId } },
            { $lookup: { from: "profiles", let: { authorId: "$authorId" }, pipeline: [{ $match: { $expr: { $eq: ["$profileid", "$$authorId"] } } }], as: "author" } },
            { $unwind: {path: "$author", preserveNullAndEmptyArrays: true} },
            { $project: { _id: 0, postId: 1, author: { displayName: 1 }, channelId: 1, title: 1, content: 1, tags: 1, attachment: 1, createdAt: 1 } }
        ]);
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

postRouter.post('/', async(req, res) => {
    const post = req.body;
    post.postId = await generateUniquePostId();

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    post.authorId = await getAuthorId(uid);

    if(!post.authorId || !post.title || !post.content || !post.channelId) {
        res.status(400).json({ success: false, message: 'Please fill all the required fields' });
        return;
    }

    const newPost = new Post(post);
    try {
        await newPost.save();
        res.status(201).json({ success: true, data: newPost });
    } catch (error) {  
        res.status(500).json({ success: false, message: "Server Error" });
        console.log(error);
    }
});

postRouter.put('/:id', async(req, res) => {
    const { id } = req.params;
    const post = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ success: false, message: 'Post not found' });
        return;
    }

    try {
        const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });
        res.status(200).json({ success: true, data: updatedPost });
    } catch (error) {
        res.status(404).json({ success: false, message: 'Post not found' });
    }
});

postRouter.delete('/:id', async(req, res) => {
    const { id } = req.params;

    try{
        await Post.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const generateUniquePostId = async () => {
    let unique = false;
    let postId;

    while (!unique) {
        postId = Math.random().toString().substr(2, 20); // Generate random 20 digit ID
        postId = "PST"+postId
        const existingPost = await Post.findOne({ postId });
        if (!existingPost) {
            unique = true;
        }
    }

    return postId;
};

const getAuthorId = async (uid) => {
    const profile = await Profile.findOne({ uid });
    return profile.profileid;
};

export default postRouter;