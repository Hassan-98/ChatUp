/* eslint-disable */
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
      return res.send({ chat: chatInBetween, found: true })
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
    res.send({ chat: newChat })

  } catch (e) {
    res.send({ err: e.message })
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
    res.send({ result: newChat })

  } catch (e) {
    res.send({ err: e.message })
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
    res.send({ uploadedImg: groupPhoto, group })

  } catch (e) {
    res.send({ err: e.message })
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
    }).populate('messages.user', ['username', 'photo', '_id']);

    res.send({ chats });
    
  } catch (e) {
    res.send({ err: e.message })
  }
})

// Get a Single Chat Room
router.get('/chats/chat/:userId', authenticated, async (req, res) => {
  try {
    const chat_room = await ChatModel.findById(req.query.roomId, { messages: { $slice: -req.query.limit || -30 } } ).populate({
      path: 'usersList',
      model: 'User',
      select: ['username', 'photo', 'activeNow', 'lastActive', '_id']
    }).populate('messages.user', ['username', 'photo', '_id'])

    var i = chat_room.usersList.findIndex(user => {
      return user._id == req.params.userId
    })
    if (i == -1) throw new Error("You Are Not Allowed To Show This Chat Room")

    res.send({ chat_room })
  } catch (e) {
    res.send({ err: e.message })
  }
})

// Send Message To A Chat Room
router.patch('/chats/:userId', authenticated, multer.array('chat_photos'), async (req, res) => {
  try {
    const chat_room = await ChatModel.findById(req.query.roomId)
    if (!chat_room.usersList.includes(req.params.userId)) throw new Error("You Are Not Allowed To Send Messages To This Chat Room")

    var msg = req.body.msg || ''

    if (req.files){
      msg = req.files.map(async file => {
        const fileURL = await uploadToStorage(file);
        return fileURL;
      })
    }

    chat_room.messages.push({
      user: req.params.userId, msg, sentAt: req.body.sentAt || Date.now()
    })

    const result = await chat_room.save()

    res.send({ result })
  } catch (e) {
    res.send({ err: e.message })
  }
})

// Delete A Message In A Chat Room
router.delete('/chats/:userId', authenticated, async (req, res, next) => {
  try {
    const chat_room = await ChatModel.findById(req.query.roomId)
    if (!chat_room.users.includes(req.params.userId)) throw new Error("You Are Not Allowed To Delete This Message")

    var index = chat_room.messages.indexOf({ user: req.params.userId, msg: req.body.msg })
    if (index == -1) throw new Error("Message Is Not Found Or Already Deleted")

    chat_room.messages.splice(index, 1)

    const result = await chat_room.save()

    res.send({ result })
  } catch (e) {
    res.send({ err: e.message })
  }
})

// Upload A File To A Chat Room
router.post('/uploadFileToChat', authenticated, multer.single('file'), async (req, res) => {
  try {
    const fileURL = await uploadToStorage(req.file);
    res.send({ uploadedFile: fileURL })
  } catch (e) {
    res.send({ err: e.message })
  }
})

// Delete A File From A Chat Room
router.delete('/deleteFile', authenticated, (req, res) => {
  try {
    const oldFileName = extractName(req.query.src);
    deleteFile(oldFileName);
    res.send({ success: true })
  } catch (e) {
    res.send({ err: e.message })
  }
})

module.exports = router
