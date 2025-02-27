import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    channelid: { type: String, required: true },
    privacycd: { type: String, required: true },
    channelname: { type: String, required: true },
    channeltypecd: { type: String, required: true },
    tagline: { type: String, required: true },
    channelPic: { type: String },
    ownerid: { type: String, required: true },
    subscribers: { type: [String] },
    about: { type: String },
},
{
    timestamps: true,
});

const Channel = mongoose.model("Channel", channelSchema);

export default Channel;