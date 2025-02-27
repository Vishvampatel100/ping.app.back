import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    profileid: { type: String, required: true },
    fname: { type: String, required: true },
    sname: { type: String, required: true },
    bdate: { type: Date, required: true },
    email: { type: String, required: true },
    displayName: { type: String, required: true },
    tagline: { type: String, required: true },
    uid: { type: String, required: true },
    profilePic: { type: String },
},
{
    timestamps: true,
});

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
