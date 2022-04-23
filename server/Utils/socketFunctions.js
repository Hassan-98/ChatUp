/* eslint-disable */
const USER = require('../Models/user_model');
const CHAT = require('../Models/chat_model');
const webpush = require('web-push');
const mongoose = require('mongoose');
const { extractName, deleteFile } = require("./uploadToStorage")

// Set Last Active Date
const setLastActive = async (userId) => {
  var lastActive = Date.now()
  await USER.findByIdAndUpdate(userId, {
    activeNow: false,
    lastActive
  })
  return {lastActive}
}

// Send Friend Request Notifications
const sendFriendRequestNotification = async (userId, senderId) => {
  const sender = await USER.findById(senderId);
  const user = await USER.findById(userId);

  if (sender && user && user.notifications_subscriptions && user.notifications_subscriptions.length) {
    user.notifications_subscriptions.forEach(subscription => {
      // Notification Payload
      const payload = JSON.stringify({
        title: `New friend request from ${sender.username}`,
        body: "There is new request to checkout",
        image: "/imgs/chatLogoDark.png" 
      });
      
      // Send A Notification To This User
      webpush.sendNotification(JSON.parse(subscription), payload);
    });
  }
}

// Send Accept Friend Notifications
const sendAcceptFriendNotification = async (userId, senderId) => {
  const sender = await USER.findById(senderId);
  const user = await USER.findById(userId);

  if (sender && user && sender.notifications_subscriptions && sender.notifications_subscriptions.length) {
    sender.notifications_subscriptions.forEach(subscription => {
      // Notification Payload
      const payload = JSON.stringify({
        title: `${user.username} accepted your friend request`,
        body: `You can chat with ${user.username} and see his diaries`,
        image: "/imgs/chatLogoDark.png" 
      });
      
      // Send A Notification To This User
      webpush.sendNotification(JSON.parse(subscription), payload);
    });
  }
}

// Send Story Notification
const sendStoryNotification = async (friendsIDs, senderId) => {
  const sender = await USER.findById(senderId);

  friendsIDs.forEach(async (friendId) => {
    const friend = await USER.findById(friendId);
  
    if (sender && friend && friend.notifications_subscriptions && friend.notifications_subscriptions.length) {
      friend.notifications_subscriptions.forEach(subscription => {
        // Notification Payload
        const payload = JSON.stringify({
          title: `${sender.username} added to his diaries`,
          body: `Go checkout ${sender.username}'s diaries`,
          image: "/imgs/chatLogoDark.png" 
        });
        
        // Send A Notification To This User
        webpush.sendNotification(JSON.parse(subscription), payload);
      });
    }
  })
}

// Send A Message Notifications
const sendMessageNotifications = (users, senderId, chat, messageType) => {
  const sender = users.find(user => user._id == senderId);
  users.forEach(user => {
    if (user._id !== sender._id && !user.activeNow && user.notifications_subscriptions && user.notifications_subscriptions.length) {
      user.notifications_subscriptions.forEach(subscription => {
        let message = "";
        
        switch (messageType) {
          case "loaction":
            message = "Location Sent"
            break;
          case "voiceCall":
            message = "Missed Voice Call"
            break;
          case "file":
            message = "File Sent"
            break;
          case "record":
            message = "Record Sent"
            break;
          default:
            message = chat.messages.at(-1).msg.length > 20 ? chat.messages.at(-1).msg.slice(0, 20) + "..." : chat.messages.at(-1).msg;
            break;
        }

        // Notification Payload
        const payload = JSON.stringify({
          title: `New message from ${chat.roomType == "Chats" ? sender.username : chat.groupName}`,
          body: message,
          image: "/imgs/chatLogoDark.png" 
        });
        
        // Send A Notification To This User
        webpush.sendNotification(JSON.parse(subscription), payload);
      });
    }
  });
}

// Save A Message To DB
const saveMessage = async (msg, tempId) => {
  try {
    var message = { user: msg.userId, msg: '', sentAt: Date.now(), sent: true, notSeen: msg.notSeen, tempId };

    let messageType = "message";

    if (msg.location) {
      message.location = msg.location;
      messageType = "location";
    }

    else if (msg.voiceCall) {
      message.voiceCall = msg.voiceCall;
      messageType = "voiceCall";
    }

    else if (msg.file) {
      message.file = msg.file;
      messageType = "file";
    }

    else if (msg.record) {
      message.record = msg.record;
      messageType = "record";
    }

    else message.msg = msg.msg

    if (msg.replyTo) message.replyTo = {
      ...msg.replyTo,
      user: mongoose.Types.ObjectId(msg.replyTo.userId)
    };

    const savedChat = await CHAT.findByIdAndUpdate(msg.chatId, 
      { $push: { messages: message } },
      {
        new: true,
        populate: [
          { 
            path: "usersList",
            select: ["username", "notifications_subscriptions", "activeNow"]
          },
          { 
            path: "messages.user",
            select: ["username", "photo"]
          },
          { 
            path: "messages.replyTo.user",
            select: ["username"]
          }
        ]
      }
    )
    .populate()
    .select({ usersList: 1, messages: 1, roomType: 1, groupName: 1 })
    .lean();

    const Message = savedChat.messages.at(-1);

    // Send A Notification to Chat Users
    sendMessageNotifications(savedChat.usersList, msg.userId, savedChat, messageType);

    return { message: Message, usersList: savedChat.usersList }
  } catch (e) {
    return {err: e.message}
  }
}


// Set Message As Deleted At DB
const deleteMessage = async ({msgId, chatId, userId}) => {
  try {
    const chat_room = await CHAT.findById(chatId).select({ messages: 1 });

    const messageIdx = chat_room.messages.findIndex(message => message._id == msgId);

    if (messageIdx === -1) throw new Error(`Message is not found`);

    const message = chat_room.messages[messageIdx];

    if (!message || message.user != userId) throw new Error(`You are not allowed to delete this message`);

    message.deleted = true;

    if (message.file) {
      try {
        const oldFileName = extractName(message.file);
        deleteFile(oldFileName);
      } catch {}
    }
    
    chat_room.messages.splice(messageIdx, 1, message);

    await chat_room.save();

    return { message }
  } catch (e) {
    return { err: e.message }
  }
}

// Delete The Chat In Between Two Contacts
const deleteChatInBetween = async (userId, userToId) => {
  var chatInBetween = await CHAT.findOneAndRemove({ usersList: { $all : [userId, userToId] }, roomType: 'Chats' })

  if (chatInBetween) return chatInBetween;
  else return false
}


// Get All Chats IDs
const getAllChatsId = async (userId) => {
  const chats = await CHAT.find({ usersList: { $all : [userId] } }, { _id: 1 })
  return chats
}


// Get All Friends IDs
const getAllFriendsId = async (userId) => {
  const user = await USER.findById(userId)
  const IDs = user.friendsList.map(friend => friend._id)
  return IDs
}

// Remove Unseen Statues
const removeUnSeen = async ({userId, chatId}) => {
  const chat_room = await CHAT.findById(chatId);

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
    const chat_room = await CHAT.findById(groupId)
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
    var newChat = await CHAT.find({ _id: groupId }).populate({
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
const checkPermissions = async (userId, chatId, userToId) => {
  try {
    const chat_room = await CHAT.findById(chatId).select({ usersList: 1 }).lean();
    
    if (!chat_room || !chat_room.usersList.map(id => String(id)).includes(userId)) throw new Error("You are not allowed to send messages to this chat");
    
    if (userToId){
      const userTo = await USER.findById(userToId).select({ username: 1, blockList: 1 }).lean();

      var idx = userTo.blockList.findIndex(user => String(user._id) == userId);
      
      if (idx > -1) throw new Error(`You can't send messages to ${userTo.username}`);
    }

    return { allowed: true }
  } catch (e) {
    return { ERROR: e.message }
  }
}

/* EXPORT FUNCTIONS */
module.exports = {
  setLastActive,
  deleteChatInBetween,
  saveMessage,
  deleteMessage,
  getAllChatsId,
  getAllFriendsId,
  removeUnSeen,
  editGroup,
  sendFriendRequestNotification,
  sendAcceptFriendNotification,
  sendStoryNotification,
  checkPermissions
}
