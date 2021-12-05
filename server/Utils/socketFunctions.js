/* eslint-disable */
const UserModel = require('../Models/user_model')
const ChatModel = require('../Models/chat_model')

// Set Last Active Date
const setLastActive = async (userId) => {
  var lastActive = Date.now()
  await UserModel.findByIdAndUpdate(userId, {
    activeNow: false,
    lastActive
  })
  return {lastActive}
}

// Save A Message To DB
const saveMessage = async (msg) => {
  try {
    const chat_room = await ChatModel.findById(msg.chatId)
    if (!chat_room.usersList.includes(msg.userId)) throw new Error("You are not allowed to send messages to this chat")

    if (msg.userToId){
      const userTo = await UserModel.findById(msg.userToId)

      var i = userTo.blockList.findIndex(user => user._id == msg.userId);
      if (i != -1) throw new Error(`You can't send messages to ${userTo.username}`);
    }

    var message = {};

    if (msg.location) message = { user: msg.userId, msg: '', sentAt: Date.now(), sent: true, location: msg.location, notSeen: msg.notSeen }

    else if (msg.voiceCall) message = { user: msg.userId, msg: '', sentAt: Date.now(), sent: true, voiceCall: msg.voiceCall, notSeen: msg.notSeen }

    else if (msg.file) message = { user: msg.userId, msg: '', sentAt: Date.now(), sent: true, file: msg.file, notSeen: msg.notSeen }

    else if (msg.record) message = { user: msg.userId, msg: '', sentAt: Date.now(), sent: true, record: msg.record, notSeen: msg.notSeen }

    else message = { user: msg.userId, msg: msg.msg, sentAt: Date.now(), sent: true, notSeen: msg.notSeen }

    chat_room.messages.push(message)

    await chat_room.save();

    return {message}
  } catch (e) {
    return {err: e.message}
  }
}


// Get The Chat In Between Two Contacts
const getChatInBetween = async (userId, userToId) => {
  var chatInBetween = await ChatModel.findOne({ usersList: { $all : [userId, userToId] }, roomType: 'Chats' })

  if (chatInBetween) {

    await ChatModel.findByIdAndDelete(chatInBetween._id);

    return chatInBetween;

  } else return false
}


// Get All Chats IDs
const getAllChatsId = async (userId) => {
  const chats = await ChatModel.find({ usersList: { $all : [userId] } }, { _id: 1 })
  return chats
}


// Get All Friends IDs
const getAllFriendsId = async (userId) => {
  const user = await UserModel.findById(userId)
  const IDs = user.friendsList.map(friend => friend._id)
  return IDs
}

// Remove Unseen Statues
const removeUnSeen = async ({userId, chatId}) => {
  const chat_room = await ChatModel.findById(chatId);

  var messages = chat_room.messages.map(msg => {
    if (msg.notSeen.length > 0) {
      var i = msg.notSeen.findIndex(userID => userID == userId);
      if (i > -1) msg.notSeen.splice(i, 1)
    }

    return msg;
  });

  chat_room.messages = messages;

  await chat_room.save();
}


// Edit Group Settings
const editGroup = async ({groupId, edits}) => {
  try {
    const chat_room = await ChatModel.findById(groupId)
    var {groupName, groupPhoto, groupAdmins, removedUserId, addMembers} = edits
    if (chat_room.roomType == 'Groups') {
      if (groupName) chat_room.groupName = groupName
      if (groupPhoto) chat_room.groupPhoto = groupPhoto
      if (groupAdmins) chat_room.groupAdmins = groupAdmins
      if (removedUserId) {
        var i = chat_room.usersList.findIndex(user => user == removedUserId)
        var index = chat_room.groupAdmins.findIndex(user => user == removedUserId)
        chat_room.usersList.splice(i, 1)
        if (index != -1) chat_room.groupAdmins.splice(index, 1)
      }
      if (addMembers) {
        addMembers.forEach(member => {
          chat_room.usersList.push(member)
        })
      }
    }
    await chat_room.save()
    var newChat = await ChatModel.find({ _id: groupId }).populate({
      path: 'usersList',
      model: 'User',
      select: ['username', 'photo', 'activeNow', 'lastActive', '_id']
    }).populate('messages.user', ['username', 'photo', '_id'])
    return {chat: newChat}
  } catch (e) {
    return e.message
  }
}

// Check Sending Messages Permissions
const checkPermissions = async (userId, chatId) => {
  try {
    const chat_room = await ChatModel.findById(chatId)
    if (!chat_room || !chat_room.usersList.includes(userId)) throw new Error("You are not allowed to send messages to this chat")
    return {allowed: true}
  } catch (e) {
    return {ERROR: e.message}
  }
}

/* EXPORT FUNCTIONS */
module.exports = {
  setLastActive,
  getChatInBetween,
  saveMessage,
  getAllChatsId,
  getAllFriendsId,
  removeUnSeen,
  editGroup,
  checkPermissions
}
