/* eslint-disable */
const router = require('express').Router()
const { authenticated } = require('../Middlewares/auth_middleware')
const UserModel = require('../Models/user_model')
const { multer, uploadToStorage, extractName, deleteFile } = require("../Utils/uploadToStorage");


// Get User Data With Params Or Email Address
router.get('/users/user', async (req, res) => {
  try {
    var id = req.query.userId
    var email = req.query.email

    if (id) user = await UserModel.findOne({_id: id})
    else if (email) user = await UserModel.findOne({email})
    else throw new Error("Please Provide A Search Query");

   // Remove Expired User Stories
   if (user.stories.length) {

    user.stories = user.stories.filter(story => {
      if (Date.now() < story.expireAt) return true;
      
      const storySrc = extractName(story.src);
      deleteFile(storySrc);
 
      return false;
    });

    await user.save();

   }

   // Remove Expired User's Friends Stories
   if (user.friendsList.length) {

    await new Promise(resolve => {
      user.friendsList.forEach(async (friend, idx) => {

        if (friend.stories.length) {

          friend.stories = friend.stories.filter(story => {
            if (Date.now() < story.expireAt) return true;
            
            const storySrc = extractName(story.src);
            deleteFile(storySrc);
            
            return false;
          });

          user.friendsList[idx] = friend;
          await UserModel.findByIdAndUpdate(friend._id, {stories: friend.stories});

        }
  
        if (user.friendsList.length - 1 === idx) resolve();

      })

     });

   }

    res.send({ user });
  } catch (e) {
    res.send({ err: e.message })
  }
})

// Edit User Data
router.patch('/users/:userId', authenticated, async (req, res) => {
  try {
    await UserModel.findByIdAndUpdate(req.params.userId, req.body)

    const newUser = await UserModel.findOne({_id: req.params.userId})
    res.send({ success: newUser })
  } catch (e) {
    res.send({ err: e.message })
  }
})


// Edit User Password
router.patch('/users/pass/:userId', authenticated, async (req, res) => {
  try {
    const { newPass, oldPass } = req.body
    const password = await UserModel.checkPass(req.params.userId, newPass, oldPass)
    const user = await UserModel.findByIdAndUpdate(req.params.userId, { password }, { runValidators: true, context: 'query' })

    const newUser = await UserModel.findOne({_id: req.params.userId})
    res.send({ success: newUser })
  } catch (e) {
    res.send({ err: e.message })
  }
})

// Edit User Picture
router.patch('/users/pic/:userId', authenticated, multer.single('avatar'), async (req, res) => {
    try {
      if (!req.file) throw new Error("No Images Provided");
      const photo = await uploadToStorage(req.file);
      const user = await UserModel.findByIdAndUpdate( req.params.userId, { photo }, { runValidators: true, new: true })
      const oldPhotoName = extractName(req.body.currentImage);
      deleteFile(oldPhotoName);
      res.send({ success: user })
    } catch (e) {
      res.send({ err: e.message })
    }
  }
)

// Send Friend Request
router.post('/users/friendRequest/:userId', authenticated, async (req, res) => {
  try {
    const userToId = req.query.id
    const userId = req.params.userId
    const user = await UserModel.findById(userId, {friendsList: 1})
    const userTo = await UserModel.findById(userToId, {blockList: 1, requestsList: 1})

    var is_he_a_friend = user.friendsList.find(friend => friend._id == userToId);

    var did_i_sent_him_a_request = userTo.requestsList.find(request => request._id == userId);

    var did_he_sent_me_a_request = user.requestsList.find(request => request._id == userToId);

    var did_he_blocked_me = userTo.blockList.find(friend => friend._id == userId);

    if (is_he_a_friend) throw new Error("This contact is already in your friends");
    if (did_he_blocked_me) throw new Error("This contact is blocked you");
    if (did_i_sent_him_a_request) throw new Error("You already sent a freind request");
    if (did_he_sent_me_a_request) throw new Error("This contact already sent you a friend request");


    userTo.requestsList.push(userId);

    await userTo.save();

    const newUser = await UserModel.findOne({_id: userId});

    res.send({ user: newUser });
  } catch (e) {
    res.send({err: e.message});
  }
})

// Block A User
router.post('/users/block/:userId', authenticated, async (req, res) => {
  try {
    const userToId = req.query.id
    const userId = req.params.userId
    const user = await UserModel.findById(userId, {blockList: 1})

    var blockFound = user.blockList.find(friend => friend._id == userToId);

    if (blockFound) throw new Error("This contact is already in your block list")


    user.blockList.push(userToId);

    await user.save();

    const newUser = await UserModel.findOne({_id: userId});
    
    res.send({ user: newUser });
  } catch (e) {
    res.send({err: e.message});
  }
})

// unBlock A User
router.post('/users/unblock/:userId', authenticated, async (req, res) => {
  try {
    const userToId = req.query.id;
    const userId = req.params.userId;
    const user = await UserModel.findById(userId, {blockList: 1});

    var blockedUser = user.blockList.find(friend => friend._id == userToId);

    if (!blockedUser) throw new Error("This contact is not in your block list");

    var index = user.blockList.findIndex(user => user._id == blockedUser._id);

    if (index > -1) user.blockList.splice(index, 1);
    
    await user.save();

    const newUser = await UserModel.findOne({_id: userId});

    res.send({ user: newUser });
  } catch (e) {
    res.send({err: e.message});
  }
})

// Add A Friend ( Accept Request )
router.post('/users/friends/:userId', authenticated, async (req, res) => {
  try {
    const userToId = req.query.reqId
    const userId = req.params.userId
    const user = await UserModel.findById(userId, {friendsList: 1, requestsList: 1})
    const userTo = await UserModel.findById(userToId, {friendsList: 1})

    
    var userToObject = user.requestsList.find(request => request._id == userToId);

    var index = user.requestsList.findIndex(user => user._id == userToObject._id);

    if (index > -1) user.requestsList.splice(index, 1);

    user.friendsList.push(userToId);

    userTo.friendsList.push(userId);

    await user.save();
    await userTo.save();

    const newUser = await UserModel.findOne({_id: userId});

    res.send({ user: newUser });
  } catch (e) {
    res.send({err: e.message});
  }
})

// Remove A Friend
router.delete('/users/friends/:userId', authenticated, async (req, res) => {
  try {
    const userToId = req.query.freindId;
    const userId = req.params.userId;
    const user = await UserModel.findById(userId, {friendsList: 1});
    const userTo = await UserModel.findById(userToId, {friendsList: 1});

    var userToObject = user.friendsList.find(friend => friend._id == userToId);
    var userObject = userTo.friendsList.find(friend => friend._id == userId);

    console.log(user.friendsList, userTo.friendsList);

    if (!userObject) throw new Error("Contact is not in your friends anymore");

    var userIndex = user.friendsList.findIndex(user => user._id == userToObject._id);
    if (userIndex > -1) user.friendsList.splice(userIndex, 1);

    var userToIndex = userTo.friendsList.findIndex(user => user._id == userObject._id);
    if (userToIndex > -1) userTo.friendsList.splice(userToIndex, 1);

    
    console.log(userIndex, userToIndex);

    await user.save();
    await userTo.save();

    const newUser = await UserModel.findOne({_id: userId});

    res.send({ user: newUser });
  } catch (e) {
    res.send({err: e.message});
  }
})

// Get All Users Data
router.get('/users', authenticated, async (req, res) => {
  try {
    const Users = await UserModel.find({});
    res.send({ Users });
  } catch (e) {
    res.send(e.message)
  }
})

// Upload Story
router.post('/users/story', authenticated, multer.single('story'), async (req, res) => {
    try {
      const src = await uploadToStorage(req.file);
      const user = await UserModel.findById(req.query.userId);

      const story = { 
        type: req.body.type,
        src,
        time: req.body.time,
        addedAt: Date.now(),
        expireAt: Date.now() + (1000 * 60 * 60 * 24)
      };

      user.stories.push(story);
      await user.save();

      const newUser = await UserModel.findOne({_id: req.query.userId});

      res.send({ success: newUser, story });
    } catch (e) {
      res.send({ err: e.message });
    }
  }
)

module.exports = router
