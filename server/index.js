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
const cors = require('cors');
const DetectLanguage = require('detectlanguage');
const GROUPCALLS = require("./Models/groupCalls");

// Cross-Origin Resource Sharing
app.use(cors({
  origin: "/"
}));

// Enable ENV Vars In Development
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

// Mongoose Database
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true
});

// Setting JSON in Body Of Requests
app.use(express.json())
// Form Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// Cookie Parser
app.use(cookieParser());

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

// Routes Guard Middleware
const routesGuard = require('./Middlewares/routes_guard');
app.use(routesGuard);

// API Endpoints
const authAPI = require('./Routes/auth_routes');
const usersAPI = require('./Routes/users_routes');
const chatsAPI = require('./Routes/chats_routes');
app.use('/api/auth', authAPI);
app.use('/api', usersAPI);
app.use('/api', chatsAPI);

// Detect Message Language Endpoint
app.post("/detectLang", async (req, res) => {
  try {
    const detectlanguage = new DetectLanguage(process.env.DETECT_LANGUAGE_KEY);
    const lang = await detectlanguage.detectCode(req.body.msg);
    res.send(lang);
  } catch (e) {
    res.send({err: e.message});
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
  const { setLastActive, getChatInBetween, saveMessage, getAllChatsId, getAllFriendsId, removeUnSeen, editGroup, checkPermissions } = require('./Utils/socketFunctions');

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
    socket.on('msg', async (msg) => {
      var fakeId = Math.floor(Math.random() * 1000000000000000)
      const { allowed, ERROR } = await checkPermissions(msg.userId, msg.chatId)
      if (allowed && !ERROR) {

        io.to(msg.chatId).emit('recieveMsg', { ...msg, sentAt: Date.now(), sent: false, _id: fakeId, user: { _id: msg.userId } });

        var {err} = await saveMessage(msg);

        if (err) return socket.emit('Error', {err, msgId: fakeId});

        socket.emit('setMsgStatus', fakeId);
      }
    })

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
      allFriends.forEach(friend => {
        io.to(friend+"PERSONAL CHANNEL").emit('recieveStory', story)
      })
    })

    /************** Send Friend Request **************/
    socket.on("sendFriendRequest", ({targetedContactID, senderContact}) => {
      io.to(targetedContactID+"PERSONAL CHANNEL").emit("friendRequestSent", { contact: senderContact });
    });

    /************** Remove A Friend **************/
    socket.on("removeContact", async ({contactID}) => {
      const { _id } = await getChatInBetween(contactID, connectedUser._id);

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
    });


    /*****************************************************************/
    /********************| Voice Call Events |************************/
    /*****************************************************************/
    
    /************** Ringing Other Users To A Call **************/
    socket.on("startACall", ({callerUserID, receiverID, contactType}) => {
      if (contactType == 'user') io.to(receiverID+"PERSONAL CHANNEL").emit("receiveACall", {callerUserID, contactType});
      else io.to(receiverID).emit("receiveACall", {callerUserID, contactType, receiverID});
    })

    /************** Cancel Call Due To Busy Contact **************/
    socket.on("contactBusy", ({callerUserID}) => {
      io.to(callerUserID+"PERSONAL CHANNEL").emit("contactBusy");
    })

    /************** Accepting Call & Start The Call **************/
    socket.on("acceptCall", ({callerUserID, channel}) => {
      io.to(callerUserID+"PERSONAL CHANNEL").emit("callAccepted", {channel});
    })

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
      var groupCall = await GROUPCALLS.findOne({ groupID });

      groupCall.joinedUsersIDs.forEach(userID => {
        io.to(userID + 'PERSONAL CHANNEL').emit('addAUserToGroupCall', {askerUserID})
      })

      groupCall.joinedUsersIDs.push(askerUserID);

      var updatedGroupCall = await groupCall.save();

      socket.emit("startAGroupCall", { group_call_info: updatedGroupCall });
    });
    
    /************** Cancel A Group Call **************/
    socket.on("cancelGroupCall", ({groupID}) => {
      io.to(groupID).emit("callCancelled", {groupID});
    })
    
    /************** End & Close A Group Call **************/
    socket.on("closeGroupCall", async ({groupID, lastUserID}) => {
      await GROUPCALLS.findOneAndDelete({ groupID });
      io.to(lastUserID+"PERSONAL CHANNEL").emit("callClosed");
      io.to(groupID).emit("groupCallClosed", { groupID });
    })

    /************** When Some Contact Leaves The Group Call **************/
    socket.on("removeAUserFromGroupCall", async ({groupID, removedUserID}) => {
      var groupCall = await GROUPCALLS.findOne({ groupID });

      var index = groupCall.joinedUsersIDs.findIndex(userID => userID == removedUserID);

      groupCall.joinedUsersIDs.splice(index, 1);

      groupCall.joinedUsersIDs.forEach(userID => {
        io.to(userID + 'PERSONAL CHANNEL').emit('removeAUserFromGroupCall', {removedUserID})
      });

      await groupCall.save();
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

          onGoingUserGroupCall.joinedUsersIDs.forEach(userID => {
            io.to(userID + 'PERSONAL CHANNEL').emit('removeAUserFromGroupCall', {removedUserID: connectedUser._id})
          });

          await onGoingUserGroupCall.save();
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