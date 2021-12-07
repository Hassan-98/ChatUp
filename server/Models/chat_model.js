const mongoose = require('mongoose')

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
        type: mongoose.Schema.ObjectId,
        ref: 'Message'
      },
      deleted: Boolean
    }]
  },
  usersList: {
    type: [mongoose.Schema.ObjectId],
    default: [],
    ref: 'User'
  },
  roomType: {
    type: String,
    defalut: 'Chats'
  },
  groupAdmins: [String],
  groupPhoto: {
    type: String,
    default: '/un.gif'
  },
  groupName: String
}, { timestamps: true })

module.exports = mongoose.model('chat', Schema)
