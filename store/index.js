/* eslint-disable */
import Vuex from 'vuex'
import socket from '~/plugins/socket'

export default () => {
  return new Vuex.Store({
    state: {
      openPicModal: false,
      openSettingModal: false,
      modalImg: '',
      OptionalMenu: false,
      opendMenu: 'Chats',
      openedChatMode: false,
      mainMenu: true,
      mobile: false,
      desktop: true,
      noChatOpen: true,
      openSetting: 'GeneralSettings',
      loadingElement: `<div class="button_loader"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>`,
      user: null,
      OptionalMenuUser: { photo: 'Error', username: 'Error', aboutMe: 'Error', phone: 'Error', address: 'Error', website: 'Error', friendsList: [] },
      chats: [],
      openedChat: {},
      loading: true,
      openCreateGroupModal: false,
      openEditGroupModal: false,
      inCall: false,
      call_info: {
        caller: true,
        statue: "ringing",
        contact: {
          username: "",
          photo: "",
          groupName: "",
          groupPhoto: "",
          _id: ""
        },
        joinedUsers: [],
        contactType: "user",
        callerUserID: ""
      },
      verifyData: {
        userID: null,
        token: null
      }
    },
    getters: {},
    mutations: {
      closeModal (state) {
        state.openCreateGroupModal = false
        state.openEditGroupModal = false
        state.openSettingModal = false
        state.openSetting = 'GeneralSettings'
        state.openPicModal = false
        state.modalImg = ''
      },
      openPicModal (state, img) {
        state.openPicModal = true
        state.modalImg = img
      },
      openCreateGroupModal (state) {
        state.openCreateGroupModal = true
      },
      openEditGroupModal (state) {
        state.openEditGroupModal = true
      },
      openSettingModal (state) {
        state.openSettingModal = true
      },
      openOpMenu (state, user) {
        state.OptionalMenu = true
        state.mainMenu = false
        state.OptionalMenuUser = user
      },
      closeOpMenu (state) {
        state.OptionalMenu = false
        state.mainMenu = true
      },
      changeMenu (state, chatType) {
        state.opendMenu = chatType
      },
      openChat (state, chat) {
        state.openedChatMode = true
        state.noChatOpen = false
        state.mainMenu = false,
        state.openedChat = chat
      },
      closeChat (state) {
        state.openedChatMode = false
        state.mainMenu = true
      },
      stopLoading(state){
        state.loading = false;
      },
      ToMobile (state){
        state.mobile = true
        state.desktop = false
      },
      ToDesktop (state){
        state.mobile = false
        state.desktop = true
      },
      setUser (state, userObj){
        state.user = userObj
      },
      clearUser (state){
        state.user = null
      },
      setChats (state, chats){
        state.chats = chats
      },
      updateChat (state, Chat) {
        var index = state.chats.findIndex(chat => chat._id == Chat._id);

        if (index > -1) {
          state.chats.splice(index, 1, Chat);
        }
      },
      addNewChat (state, newChat){
        state.chats.unshift(newChat);
      },
      updateFriendStatus (state, friend){
        const index = state.chats.findIndex(chat => chat.roomType == 'Chats' && chat.usersList.other._id == friend._id);

        if (index > -1) {
          state.chats[index].usersList.other.activeNow = friend.activeNow;
          state.chats[index].usersList.other.lastActive = friend.lastActive;
        }
      },
      addMessageToAChat(state, { chatID, msg, lastOneNotSeen }){
        var chats = [...state.chats];

        var index = chats.findIndex(chat => chat._id == chatID);

        if (index > -1) {
          var chat = chats.find(chat => chat._id == chatID);
          
          chat.messages.push(msg);
          
          if (lastOneNotSeen) chat.lastOneNotSeen = true;

          state.chats.splice(index, 1);
          state.chats.unshift(chat);

          if (state.openedChatMode && state.openedChat && state.openedChat._id == chatID) state.openedChat.messages = chat.messages;
        }
      },
      setMsgStatus(state, { chatID, tempId, message, sent }){
        var chats = [...state.chats];

        var index = chats.findIndex(chat => chat._id == chatID);

        if (index > -1) {
          var chat = chats.find(chat => chat._id == chatID);
          
          var messageIndex = chat.messages.findIndex(msg => msg._id == tempId);

          if (messageIndex > -1) {

            if (sent !== true) {
              var oldMessage = chat.messages.find(msg => msg._id == tempId);
              oldMessage.sent = sent;
              chat.messages.splice(messageIndex, 1, oldMessage);
            } else if (sent === true) {
              chat.messages.splice(messageIndex, 1, message);
            }

            state.chats.splice(index, 1, chat);
          }

          if (state.openedChatMode && state.openedChat && state.openedChat._id == chatID) state.openedChat.messages = chat.messages;
        }
      },
      deleteMessage(state, {msgId, chatId}) {
        var chats = [...state.chats];

        var index = chats.findIndex(chat => chat._id == chatId);

        if (index > -1) {
          var chat = chats.find(chat => chat._id == chatId);
          
          var messageIndex = chat.messages.findIndex(msg => msg._id == msgId);

          if (messageIndex > -1) {
            var message = chat.messages.find(msg => msg._id == msgId);

            message.deleted = true;

            chat.messages.splice(messageIndex, 1, message);

            state.chats.splice(index, 1, chat);
          }

          if (state.openedChatMode && state.openedChat && state.openedChat._id == chatId) state.openedChat.messages = chat.messages;
        }
      },
      editGroup(state, {groupId, groupAdmins, usersList}) {
        var allChats = [...state.chats]
        var group = allChats.find(chat => chat._id === groupId);
        
        var groupIndex = allChats.findIndex(chat => chat._id === groupId);

        if (usersList) {
          group.usersList = usersList;
          allChats.splice(groupIndex, 1, group);
          return state.chats = allChats;
        } else if (groupAdmins) {
          group.groupAdmins = groupAdmins;
          allChats.splice(groupIndex, 1, group);
          return state.chats = allChats;
        }
      },
      friendRequestSent(state, {contact}){
        state.user.requestsList.push(contact);
      },
      friendRequestAccepted(state, {contact}){
        state.user.friendsList.push(contact);
      },
      removeFromFriends(state, {contactID, chatID}){
        const friendsList = [...state.user.friendsList];
        const friendIDX = friendsList.findIndex(friend => friend._id === contactID);

        if (friendIDX > -1) {
          friendsList.splice(friendIDX, 1);

          state.user.friendsList = friendsList;

          const chatIDX = state.chats.findIndex(chat => chat._id == chatID);

          if (chatIDX > -1) {

            if (state.openedChatMode && state.openedChat && state.openedChat._id == chatID) {
              state.openedChatMode = false
              state.openedChat = {};
              state.mainMenu = true
            }

            state.chats.splice(chatIDX, 1);
          }
        }
      },
      changeUserPictureInChats(state, {newPhoto, userId}) {
        var chats = [...state.chats];

        var newChats = chats.map(chat => {

          var newMessages = chat.messages.map(message => {
            if (message.user._id == userId) message.user.photo = newPhoto;
            return message;
          });

          chat.messages = newMessages;

          for (var key in chat.usersList) {
            if (chat.usersList[key]._id == userId) {
              chat.usersList[key].photo = newPhoto;
            }
          }

          return chat;
        });

        const friendsList = state.user.friendsList.map(friend => {
          if (friend._id == userId) friend.photo = newPhoto;
          return friend;
        });

        const blockList = state.user.blockList.map(friend => {
          if (friend._id == userId) friend.photo = newPhoto;
          return friend;
        });

        const requestsList = state.user.requestsList.map(friend => {
          if (friend._id == userId) friend.photo = newPhoto;
          return friend;
        });

        state.chats = newChats;
        state.user.friendsList = friendsList;
        state.user.blockList = blockList;
        state.user.requestsList = requestsList;
      },
      startCall(state, call_info) {
        state.call_info = call_info
        state.inCall = true
      },
      async stopCall(state) {
        if (window.localAudioTrack && window.client) {
          // Destroy the local audio and track.
          localAudioTrack.close();
          // Leave the channel.
          await client.leave();

          window.localAudioTrack = null;
          window.client = null;
        }

        state.call_info = {
          caller: true,
          statue: "ringing",
          contact: {
            username: "",
            photo: "",
            groupName: "",
            groupPhoto: "",
            _id: ""
          },
          joinedUsers: [],
          contactType: "user",
          callerUserID: ""
        };
        state.inCall = false
      },
      acceptCall(state) {
        var call_info = Object.assign({}, state.call_info);

        call_info.statue = "onGoingCall";

        state.call_info = call_info;
      },
      acceptGroupCall(state, joinedUsers) {
        var call_info = Object.assign({}, state.call_info);

        call_info.statue = "onGoingCall";

        call_info.joinedUsers = joinedUsers;

        state.call_info = call_info;
      },
      addAUserToGroupCall(state, joinedUserID) {
        var call_info = Object.assign({}, state.call_info);

        // Transform User ID to Object
        var chat = state.chats.find(chat => chat._id == state.call_info.contact._id);
        if (!chat) return {};
        var joinedUser =  Object.values(chat.usersList).find(user => user._id == joinedUserID);

        call_info.joinedUsers.push(joinedUser);

        state.call_info = call_info;
      },
      removeAUserFromGroupCall(state, userID) {
        var call_info = Object.assign({}, state.call_info);

        var joinedUsers = call_info.joinedUsers.filter(user => user._id != userID);

        call_info.joinedUsers = joinedUsers;

        state.call_info = call_info;
      },
      setVerifyData(state, {userID, username, token}) {
        state.verifyData = {userID, username, token};
      }
    },
    actions: {
      async nuxtServerInit ({ commit }, { req, res }){
        const jwt = require("jsonwebtoken");

        if (req.url.startsWith("/verify")) {
          const token = req.query.t;
          if (token) {
            try {
              const {userID, username} = jwt.verify(token, process.env.JWT_SECRET);
              commit("setVerifyData", {userID, username, token});
            } catch (e) {
              console.log(e)
            }
          }
        }

        if (req.cookies.currentUser) {
  
          try {
            const { userID } = jwt.verify(req.cookies.currentUser, process.env.JWT_SECRET);

            const { user } = await this.$axios.$get(`/api/users/user?userId=${userID}`);

            const { chats } = await this.$axios.$get(`/api/chats/${userID}`);

            await this.$axios.$patch(`/api/users/${userID}`, {
              activeNow: true
            });

            commit('setUser', user);
            commit('setChats', chats);
          } catch (e) {
            // Clear User Session
            res.clearCookie("currentUser");
            // Redirect To Login Page
            res.redirect("/login");
          }

        }
      }
    }
  })
}