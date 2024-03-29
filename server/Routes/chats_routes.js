﻿/* eslint-disable */
const router = require('express').Router();
const { authenticated } = require('../Middlewares/auth_middleware');
const ChatModel = require('../Models/chat_model');
const UserModel = require('../Models/user_model');
const { multer, uploadToStorage, extractName, deleteFile } = require("../Utils/uploadToStorage");


// Create Users Chat Room
router.post('/chats/:userId', authenticated, async (req, res) => {
  try {
    var userId = req.params.userId
    var userToId = req.query.userTo
    // Check If The User Is In Freinds List
    var user = await UserModel.findById(userId, {friendsList: 1, blockList: 1});
    var userTo = await UserModel.findById(userToId, {blockList: 1});

    var chatInBetween = await ChatModel.findOne({ usersList: { $all : [userId, userToId] }, roomType: 'Chats' }).populate({
      path: 'usersList',
      model: 'User',
      select: ['username', 'photo', 'activeNow', 'lastActive', '_id']
    }).populate('messages.user', ['username', 'photo', '_id'])

    if (chatInBetween) {
      return res.json({ chat: chatInBetween, found: true })
    }

    var friendFound = false
    var blockFound = false

    user.friendsList.forEach(friend => {
      if (friend._id == userToId) {
        friendFound = true
      }
    })
    user.blockList.forEach(friend => {
      if (friend._id == userToId) {
        blockFound = true
      }
    })
    userTo.blockList.forEach(friend => {
      if (friend._id == userId) {
        blockFound = true
      }
    })

    if (!friendFound) throw new Error("You Can't Send Messages To Someone Who Is Not A Friend Yet")
    if (blockFound) throw new Error("You Can't Send Messages To Someone Who Blocked You Or You Blocked Him")

    // Setup Welcome MSG
    const messages = [{user: userId, msg: "Welcome To The New Chat Room", sent: true, sentAt: Date.now()}]
    // Setup Room Users List
    const usersList = [userId, userToId]
    // Setup Room Type
    var roomType = req.body.roomType || 'Chats'

    // Create The New Room
    const chat = await ChatModel.create({ messages, usersList, roomType })

    var newChat = await ChatModel.findById(chat._id).populate({
      path: 'usersList',
      model: 'User',
      select: ['username', 'photo', 'activeNow', 'lastActive', '_id']
    }).populate('messages.user', ['username', 'photo', '_id'])
    // Send The Response Back
    res.json({ chat: newChat })

  } catch (e) {
    res.json({ err: e.message })
  }
})

// Create Users Group Room
router.post('/chats/group/:userId', authenticated, multer.single('groupPhoto'), async (req, res) => {
  try {
    var userId = req.params.userId
    var usersIDs = req.body.users.split(',')
    // Check If The User Is In Freinds List
    var user = await UserModel.findById(userId, {friendsList: 1, blockList: 1})

    var blockFound = false

    usersIDs.forEach(async userFriend => {
      var userTo = await UserModel.findById(userFriend, {blockList: 1});

      userTo.blockList.forEach(friend => {
        if (friend._id == userId) blockFound = true;
      })
      user.blockList.forEach(friend => {
        if (friend._id == userTo._id) blockFound = true
      })
    })

    if (blockFound) throw new Error("You can't send messages to someone who blocked you or you blocked him")

    // Setup Welcome MSG
    const messages = [{user: userId, msg: "Welcome To The New Chat Room", sent: true, sentAt: Date.now()}]
    // Setup Room Users List
    const usersList = [...usersIDs]
    // Setup Room Admins List
    const groupAdmins = [userId]
    // Setup Room Type
    var roomType = 'Groups'
    // Group Name
    var groupName = req.body.groupName
    // Group Photo
    if (!req.file) throw new Error("No Images Provided");

    const groupPhoto = await uploadToStorage(req.file);

    // Create The New Room
    const chat = new ChatModel({ messages, usersList, groupAdmins, roomType, groupPhoto, groupName })
    const result = await chat.save();

    var newChat = await ChatModel.find({ _id: result._id }).populate({
      path: 'usersList',
      model: 'User',
      select: ['username', 'photo', 'activeNow', 'lastActive', '_id']
    }).populate('messages.user', ['username', 'photo', '_id']);
    
    // Send The Response Back
    res.json({ result: newChat })

  } catch (e) {
    res.json({ err: e.message })
  }
})


// Create Users Group Room
router.patch('/chats/group/updatePic', authenticated, multer.single('groupPhoto'), async (req, res, next) => {
  try {
    if (!req.file) throw new Error("No Images Provided");
    const groupPhoto = await uploadToStorage(req.file);
    const group = await ChatModel.findByIdAndUpdate(req.params.chatId, { groupPhoto }, { runValidators: true, new: true })
    const oldPhotoName = extractName(req.body.currentImage);
    deleteFile(oldPhotoName);
    // Send The Response Back
    res.json({ uploadedImg: groupPhoto, group })

  } catch (e) {
    res.json({ err: e.message })
  }
})

// Get All Users Chat Rooms
router.get('/chats/:userId', authenticated, async (req, res) => {
  try {
    const userId = req.params.userId;

    const chats = await ChatModel.find({ usersList: { $all : [userId] } }, { messages: { $slice: -req.query.limit || -30 } }, { sort: { updatedAt: -1 } }).populate({
      path: 'usersList',
      model: 'User',
      select: ['username', 'photo', 'activeNow', 'lastActive', '_id']
    }).populate('messages.user', ['username', 'photo', '_id']).populate('messages.replyTo.user', ['username', '_id']);

    res.json({ chats });
    
  } catch (e) {
    res.json({ err: e.message })
  }
})


// Get a Single Chat Room
router.get('/chats/chat/:userId', authenticated, async (req, res) => {
  try {
    const chat_room = await ChatModel.findById(req.query.roomId, { messages: { $slice: -req.query.limit || -30 } } )
    .populate({
      path: 'usersList',
      model: 'User',
      select: ['username', 'photo', 'activeNow', 'lastActive', '_id']
    })
    .populate('messages.user', ['username', 'photo', '_id'])
    .populate('messages.replyTo.user', ['username', '_id'])
    .lean();

    var i = chat_room.usersList.findIndex(user => user._id == req.params.userId);

    if (i == -1) throw new Error("You are not allowed to show this chat room")

    res.json({ chat_room })
  } catch (e) {
    res.json({ err: e.message })
  }
})

// Upload A File To A Chat Room
router.post('/uploadFileToChat', authenticated, multer.single('file'), async (req, res) => {
  try {
    const fileURL = await uploadToStorage(req.file);
    res.json({ uploadedFile: fileURL })
  } catch (e) {
    res.json({ err: e.message })
  }
})

// Delete A File From A Chat Room
router.delete('/deleteFile', authenticated, (req, res) => {
  try {
    const oldFileName = extractName(req.query.src);
    deleteFile(oldFileName);
    res.json({ success: true })
  } catch (e) {
    res.json({ err: e.message })
  }
})

module.exports = router
