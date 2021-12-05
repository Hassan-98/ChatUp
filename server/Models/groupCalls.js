/* eslint-disable */
const mongoose = require("mongoose");

const groupCallSchema = mongoose.Schema({
    groupID: {
        type: String,
        required: true,
        unique: true
    },
    joinedUsersIDs: {
        type: Array
    },
    channel: {
        type: String,
        required: true
    },
    callerID: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("GroupCall", groupCallSchema)