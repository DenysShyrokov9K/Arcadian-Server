const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String
    },
    userAddress:{
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String
    },
    avatar: {
        type: String,
    },
    bio: {
        type: String,
    },
    playFabId:{
        type: String,
    },
    userhex: {
        type: String,
    },
    qrCheck: {
        type: Number,
        require: true
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = User = mongoose.model('user', UserSchema);