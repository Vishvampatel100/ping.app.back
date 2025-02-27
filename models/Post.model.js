import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    postId: { type: String, required: true },
    authorId: { type: String, required: true },
    channelId:{ type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String] },
    attachment: { type: String }
},
{
    timestamps: true,
});

const Post = mongoose.model("Post", postSchema);

export default Post;
