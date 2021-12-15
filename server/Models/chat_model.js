/* eslint-disable */
const mongoose = require('mongoose');

const Schema = mongoose.Schema({
  messages: {
    type: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      msg: String,
      voiceCall: Object,
      location: Object,
      file: Object,
      record: String,
      sentAt: {
        type: Date,
        default: Date.now()
      },
      sent: {
        type: Boolean,
        default: true
      },
      notSeen: [String],
      tempId: Number,
      replyTo: {
        messageId: String,
        messageContent: String,
        user: {
          type: mongoose.Types.ObjectId,
          ref: 'User'
        }
      },
      deleted: Boolean
    }]
  },
  usersList: {
    type: [mongoose.Types.ObjectId],
    default: [],
    ref: 'User'
  },
  roomType: {
    type: String,
    default: 'Chats'
  },
  groupAdmins: [String],
  groupPhoto: {
    type: String,
    default: "/imgs/default-user.jpg"
  },
  groupName: String
}, { timestamps: true })

module.exports = mongoose.model('chat', Schema)
