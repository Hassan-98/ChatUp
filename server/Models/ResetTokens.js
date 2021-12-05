/* eslint-disable */
const mongoose = require("mongoose");

const ResetTokensSchema = mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userID: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    expiration: {
        type: Date,
        required: true
    },
});

module.exports = mongoose.model("ResetToken", ResetTokensSchema)