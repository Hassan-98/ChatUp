/* eslint-disable */
const http = require('http')
const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const server = http.createServer(app)

// Modules
const mongoose = require('mongoose')
// const session = require('express-session')
// const MongoDBStore = require('connect-mongodb-session')(session)
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const webpush = require('web-push');
const DetectLanguage = require('detectlanguage');
const GROUPCALLS = require("./Models/groupCalls");

// Enable ENV Vars In Development
require('dotenv').config();

// Cross-Origin Resource Sharing
var corsOptionsDelegate = function (req, callback) {
  // CORS Whitelist URLs
  const whitelist = ["https://chatupapp.tk", "https://chatup-2020.herokuapp.com"];
  // Whitelist localhost in development
  if (process.env.NODE_ENV !== 'production') whitelist.push("http://localhost:3000");

  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true }
  } else {
    corsOptions = { origin: false }
  }
  callback(null, corsOptions)
}

app.use(cors(corsOptionsDelegate));

//setting vapid keys details
webpush.setVapidDetails('mailto:7assan.3li1998@gmail.com', process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);

// Mongoose Database
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true
});

// Disable etag and x-powered-by
app.disable("etag").disable("x-powered-by");
// Setting JSON in Body Of Requests
app.use(express.json())
// FormData Body Parser
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ 
  limit: '100mb',
  extended: true,
  parameterLimit: 50000 
}));
// Req & Res Compressor
app.use(compression());
// Helmet Protector
// app.use(helmet());
// Set Morgan Logger
app.use("/api", morgan(':method :url :status - :response-time ms'));
// Cookie Parser
app.use(cookieParser());

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

// wakeup api
app.get('/api/wakeup', async (req, res) => {
  res.json({
    success: 'API Wakeup - Success'
  })
});

// Routes Guard Middleware
const routesGuard = require('./Middlewares/routes_guard');
app.use(routesGuard);

// API Endpoints
const authAPI = require('./Routes/auth_routes');
const usersAPI = require('./Routes/users_routes');
const chatsAPI = require('./Routes/chats_routes');
const notificationsAPI = require('./Routes/notifications_routes');
app.use('/api/auth', authAPI);
app.use('/api', usersAPI);
app.use('/api', chatsAPI);
app.use('/api', notificationsAPI);

// Detect Message Language Endpoint
app.post("/detectLang", async (req, res) => {
  try {
    const detectlanguage = new DetectLanguage(process.env.DETECT_LANGUAGE_KEY);
    const lang = await detectlanguage.detectCode(req.body.msg);
    res.json(lang);
  } catch (e) {
    res.json({err: e.message});
  }
})

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await nuxt.ready()
  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  server.listen(port, host)


  /***********************************************=== ===**********************************************/
  /**************************************=== SOCKET.IO EVENTS ===*************************************/
  /***********************************************=== ===**********************************************/

  const io = require('socket.io')(server);
  const { 
    setLastActive, sendFriendRequestNotification, sendAcceptFriendNotification,
    sendStoryNotification, deleteChatInBetween, saveMessage,
    deleteMessage, getAllChatsId, getAllFriendsId,
    removeUnSeen, editGroup, checkPermissions
  } = require('./Utils/socketFunctions');

  io.on('connection', (socket) => {
    /*| The Connected User Object |*/
    var connectedUser;

    /************** Get Connected User **************/
    socket.on("connectUser", async (userdata) => {
      connectedUser = userdata;
      /*** Connect To My Room ***/
      socket.join(connectedUser._id)
      socket.join(connectedUser._id + 'PERSONAL CHANNEL')
      /*** Connect To Chat Rooms ***/
      var allChats = await getAllChatsId(connectedUser._id)
      allChats.forEach(chat => {
        socket.join(chat._id)
      })
      /*** Connect To All Friends Rooms ***/
      var allFriends = await getAllFriendsId(connectedUser._id)
      allFriends.forEach(friend => {
        socket.join(friend)
        /** Update User Status In All Online Friends Chats **/
        io.to(friend + 'PERSONAL CHANNEL').emit('updateFriendStatus', { activeNow: true, _id: connectedUser._id, lastActive: Date.now() })
      })
      /*** Join The General Room ***/
      socket.join('GENERAL_CHATUP_ROOM')
    });

    /************** Sending A Message To A Chat **************/
    socket.on('msg', async (msg, endCallMessage) => {
      const tempId = Date.now();

      const { allowed, ERROR } = await checkPermissions(msg.userId, msg.chatId, msg.userToId);

      if (allowed && !ERROR) {

        if (endCallMessage) {
          const {message, usersList} = await saveMessage(msg, tempId);

          return usersList.forEach(user => {
            io.to(user._id + 'PERSONAL CHANNEL').emit('recieveFriendMsg', {message, chatId: msg.chatId});
          });
        }

        socket.emit('recieveMyMsg', { ...msg, sentAt: Date.now(), sent: false, _id: tempId, user: { _id: msg.userId } });

        const {err, message, usersList} = await saveMessage(msg, tempId);

        if (err) return socket.emit('setMsgError', {err, tempId, chatID: msg.chatId});

        usersList.forEach(user => {
          if (msg.userId != user._id) io.to(user._id + 'PERSONAL CHANNEL').emit('recieveFriendMsg', {message, chatId: msg.chatId});
        });

        socket.emit('setMsgStatus', {tempId, message, chatID: msg.chatId});
      }
    })

    /************** Delete A Message From A Chat **************/
    socket.on("deleteMessage", async ({msgId, chatId, userId}) => {
      const {err} = await deleteMessage({msgId, chatId, userId});

      if (err) return;

      io.to(chatId).emit('messageDeleted', {msgId, chatId});
    });

    /************** Start A Chat In The Friend's UI **************/
    socket.on('createChat', (chat) => {
      socket.join(chat._id)
      if (!chat.callback) {
        socket.broadcast.to('GENERAL_CHATUP_ROOM').emit('chatCreated', chat)
      }
    })

    /************** Start A Chat In The Friend's UI **************/
    socket.on('removeUnSeen', async ({chatId, userId}) => {
      await removeUnSeen({chatId, userId})
    })

    /************** Edit Group Settings **************/
    socket.on('editGroup', async ({groupId, edits}) => {
      var {chat, err} = await editGroup({groupId, edits})
      if (!err) {
        io.to(groupId).emit('setGroupEdits', {groupId, edits})
        if (edits.removedUserId) io.to(groupId).emit('removeFromGroup', {userId: edits.removedUserId, groupId})
        if (edits.addMembers) {
          edits.addMembers.forEach(member => {
            io.to(member + 'PERSONAL CHANNEL').emit('joinGroup', {groupId, chat})
          })
        }
      }
    })

    /************** Leave Group **************/
    socket.on('removeMe', (groupId) => {
      socket.leave(groupId)
    })

    /************** Join Group **************/
    socket.on('groupJoin', ({groupId, chat}) => {
      socket.join(groupId)
      chat.noCallback = true
      socket.emit('chatCreated', chat)
    })

    /************** Sending A Stroy **************/
    socket.on('addStory', async (st) => {
      const story = { userId: st.userId, ...st.story };
      
      socket.emit('recieveStory', story);
      
      var allFriends = await getAllFriendsId(connectedUser._id)
      sendStoryNotification(allFriends, connectedUser._id);
      allFriends.forEach(friend => {
        io.to(friend+"PERSONAL CHANNEL").emit('recieveStory', story)
      })
    })

    /************** Send Friend Request **************/
    socket.on("sendFriendRequest", ({targetedContactID, senderContact}) => {
      io.to(targetedContactID+"PERSONAL CHANNEL").emit("friendRequestSent", { contact: senderContact });
      sendFriendRequestNotification(targetedContactID, senderContact._id);
    });

    /************** Remove A Friend **************/
    socket.on("removeContact", async ({contactID}) => {
      const { _id } = await deleteChatInBetween(contactID, connectedUser._id);

      if (_id) {
        socket.emit("removeFromFriends", { contactID, chatID: _id });
        return io.to(contactID+"PERSONAL CHANNEL").emit("removeFromFriends", { contactID: connectedUser._id, chatID: _id });
      }

      socket.emit("removeFromFriends", { contactID, chatID: null });
      io.to(contactID+"PERSONAL CHANNEL").emit("removeFromFriends", { contactID: connectedUser._id, chatID: null });
    });

    /************** Leave Friend's Rooms **************/
    socket.on("leaveFriendRooms", ({contactID, chatID}) => {
      socket.leave(contactID);
      socket.leave(contactID+"PERSONAL CHANNEL");
      if (chatID) socket.leave(chatID);
    });

    /************** Accept Friend Request **************/
    socket.on("acceptFriendRequest", ({friendID, contact}) => {
      io.to(friendID+"PERSONAL CHANNEL").emit("friendRequestAccepted", { contact });
      sendAcceptFriendNotification(contact._id, friendID);
    });

    /************** Change User Picture **************/
    socket.on("changeUserPicture", ({newPhoto, userId}) => {
      socket.broadcast.to(userId).emit("changeUserPicture", {newPhoto, userId});
    });


    /*****************************************************************/
    /********************| Voice Call Events |************************/
    /*****************************************************************/
    
    /************** Ringing Other Users To A Call **************/
    socket.on("startACall", ({callerUserID, receiverID, contactType}) => {
      if (contactType == 'user') io.to(receiverID+"PERSONAL CHANNEL").emit("receiveACall", {callerUserID, contactType});
      else io.to(receiverID).emit("receiveACall", {callerUserID, contactType, receiverID});
    });

    /************** Cancel Call Due To Busy Contact **************/
    socket.on("contactBusy", ({callerUserID}) => {
      io.to(callerUserID+"PERSONAL CHANNEL").emit("contactBusy");
    });

    /************** Cancel Call Due To Busy Contact **************/
    socket.on("cantCallBlockedContact", ({callerUserID}) => {
      io.to(callerUserID+"PERSONAL CHANNEL").emit("cantCallBlockedContact");
    });

    /************** Accepting Call & Start The Call **************/
    socket.on("acceptCall", ({callerUserID, channel}) => {
      io.to(callerUserID+"PERSONAL CHANNEL").emit("callAccepted", {channel});
    });

    /* 
      Emited On Clicking On Accept Group Call (True => Emit 'askToJoinGroupCall' from UI) (False => Emit 'startAGroupCall'  from UI)
        And
      On Joining OnGoing Group Call From Call Button (True => Emit 'askToJoinGroupCall' from UI), (False =>  Start Ringing The Group)

      (After Emitting The response will send to the asker to make an action)
    */
    socket.on("isOnGoingCall", async ({ groupID }) => {
      var isOnGoingCall = await GROUPCALLS.findOne({ groupID });

      if (isOnGoingCall && !isOnGoingCall.joinedUsersIDs.length) {
        await GROUPCALLS.findOneAndDelete({ groupID });

        return socket.emit("isOnGoingCall", { isOnGoingCall: false });
      }

      if (isOnGoingCall) socket.emit("isOnGoingCall", { isOnGoingCall: true, callerUserID: isOnGoingCall.callerID });

      else socket.emit("isOnGoingCall", { isOnGoingCall: false });

    });

    /************** Initializtion Of A Group Call & Start The Call Functionality **************/
    socket.on("startAGroupCall", async ({ groupID, callerUserID, accepterUserID }) => {

      var groupCall = await GROUPCALLS.create({ 
        groupID, 
        joinedUsersIDs: [callerUserID, accepterUserID], 
        channel: `voiceCall-${groupID}`,
        callerID: callerUserID
      });

      socket.emit("startAGroupCall", { group_call_info: groupCall });
      
      io.to(callerUserID + "PERSONAL CHANNEL").emit("startAGroupCall", { group_call_info: groupCall });

    })

    /************** When Some Contact Joins The OnGoing Group Call **************/
    socket.on("askToJoinGroupCall", async ({groupID, askerUserID}) => {
      try {
        var groupCall = await GROUPCALLS.findOne({ groupID });

        groupCall.joinedUsersIDs.push(askerUserID);

        var updatedGroupCall = await groupCall.save();

        socket.emit("startAGroupCall", { group_call_info: updatedGroupCall });

        groupCall.joinedUsersIDs.forEach(userID => {
          if (userID != askerUserID) io.to(userID + 'PERSONAL CHANNEL').emit('addAUserToGroupCall', {askerUserID})
        })
      } catch {}
    });
    
    /************** Cancel A Group Call **************/
    socket.on("cancelGroupCall", ({groupID}) => {
      io.to(groupID).emit("callCancelled", {groupID});
    })
    
    /************** End & Close A Group Call **************/
    socket.on("closeGroupCall", async ({groupID}) => {
      try {
        await GROUPCALLS.findOneAndDelete({ groupID });
      } catch {}
      io.to(groupID).emit("groupCallClosed", { groupID });
    })

    /************** When Some Contact Leaves The Group Call **************/
    socket.on("removeAUserFromGroupCall", async ({groupID, removedUserID}) => {
      try {
        var groupCall = await GROUPCALLS.findOne({ groupID });

        var index = groupCall.joinedUsersIDs.findIndex(userID => userID == removedUserID);
  
        groupCall.joinedUsersIDs.splice(index, 1);
  
        groupCall.joinedUsersIDs.forEach(userID => {
          io.to(userID + 'PERSONAL CHANNEL').emit('removeAUserFromGroupCall', {removedUserID})
        });
  
        await groupCall.save();
      } catch {}
    });

    /************** Cancel A Call **************/
    socket.on("cancelCall", ({otherUserID}) => {
      io.to(otherUserID+"PERSONAL CHANNEL").emit("callCancelled");
    })

    /************** Close The Running Call **************/
    socket.on("closeCall", ({otherUserID}) => {
      io.to(otherUserID+"PERSONAL CHANNEL").emit("callClosed");
    })

    /************** Action On Disconnect **************/
    socket.on('disconnect', async () => {
      if (connectedUser) {
        /** Set User Disconnection on Database **/
        const { lastActive } = await setLastActive(connectedUser._id);
        /** Update User Status In All Online Friends UI **/
        const allFriends = await getAllFriendsId(connectedUser._id);
        allFriends.forEach(friend => {
          io.to(friend + 'PERSONAL CHANNEL').emit('updateFriendStatus', { activeNow: false, _id: connectedUser._id, lastActive });
        });

        /** If User was in a call, unsubscribe him from this call, and tell other users in the call that he is disconnected  */
        const onGoingUserGroupCall = await GROUPCALLS.findOne({ joinedUsersIDs: { $in: [connectedUser._id] } });

        if (onGoingUserGroupCall) {
          var index = onGoingUserGroupCall.joinedUsersIDs.findIndex(userID => userID == connectedUser._id);

          onGoingUserGroupCall.joinedUsersIDs.splice(index, 1);

          await onGoingUserGroupCall.save();

          onGoingUserGroupCall.joinedUsersIDs.forEach(userID => {
            io.to(userID + 'PERSONAL CHANNEL').emit('removeAUserFromGroupCall', {removedUserID: connectedUser._id})
          });
        }

      }
    })
  })

  /***********************************************=== ===**********************************************/
  /***********************************************=== ===**********************************************/

  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()