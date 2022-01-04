<template>
  <div class="main">
    <PictureModal v-if="$store.state.openPicModal" />
    <SettingModal v-if="$store.state.openSettingModal" />
    <CreateGroup v-if="$store.state.openCreateGroupModal" />
    <EditGroup v-if="$store.state.openEditGroupModal" />
    <div class="row">
      <SideBar v-if="$store.state.desktop || ($store.state.mainMenu && !$store.state.openedChatMode && $store.state.mobile)" />
      <OpenMenu v-if="$store.state.desktop || ($store.state.mainMenu && !$store.state.openedChatMode && $store.state.mobile)" />
      <OpenChat v-if="$store.state.desktop || ($store.state.openedChatMode && $store.state.mobile && !$store.state.OptionalMenu)" />
      <OptionalChatMenu v-if="$store.state.desktop && $store.state.openedChatMode && !$store.state.OptionalMenu" />
      <OptionalMenu v-if="$store.state.desktop || ($store.state.mobile && $store.state.OptionalMenu)" />
    </div>
    <audio src="/ringtone/ringtone.mp3" loop style="display: none" class="ringtone_element" />
  </div>
</template>

<style lang="scss">
@import "@/assets/scss/reset.scss";

.main {
  width: 100%;
  height: 100%;
  position: relative;
  .row {
    margin: 0;
    height: 100%;
    max-height: 100vh;
  }
}
</style>

<script>
/* eslint-disable */
import SideBar from '../components/Menus/Sidebar.vue'
import OpenMenu from '../components/Menus/OpenMenu.vue'
import OpenChat from '../components/Menus/OpenChat.vue'
import OptionalChatMenu from '../components/Menus/OptionalChatMenu.vue'
import OptionalMenu from '../components/Menus/OptionalMenu.vue'
import PictureModal from '../components/Modals/PictureModal.vue'
import SettingModal from '../components/Settings/SettingModal.vue'
import CreateGroup from '../components/Group/createGroupModal.vue'
import EditGroup from '../components/Group/editGroupModal.vue'
export default {
  components: {
    SideBar,
    OpenMenu,
    OpenChat,
    OptionalChatMenu,
    OptionalMenu,
    SettingModal,
    PictureModal,
    CreateGroup,
    EditGroup
  },
  computed: {
    currentUser () {
      return this.$store.state.user || false
    }
  },
  async mounted () {
    if (window.matchMedia('(max-width: 767px)').matches) {
      this.$store.commit('ToMobile')
    } else {
      this.$store.commit('ToDesktop')
    }

    window.onresize = () => {
      if (window.matchMedia('(max-width: 767px)').matches) {
        this.$store.commit('ToMobile')
      } else {
        this.$store.commit('ToDesktop')
      }
    }

    // check if the serveice worker can work in the current browser
    if('serviceWorker' in navigator){
      await window.Notification.requestPermission()
      this.subscribe().catch(err => console.error(err));
    }

    this.$socket.emit('connectUser', this.currentUser);

  },
  methods: {
    checkAndAddStory(user, story){
      /********************** if the user has previous stories ********************/
      if(STORIES.data[user._id]){
        STORIES.addItem(user._id, {
          id: `${user._id}_${new Date().getTime()}`,
          src: story.src,
          preview: story.src,
          type: Number(story.time),
          seen: false,
          time: new Date().getTime() / 1000,
          length: 10
        });

        // Edit Seen Statue in localStorage
        const newSeenStatue = {
          ...JSON.parse(localStorage["zuck-stories-seenItems"]),
          [user._id]: false
        }

        localStorage.setItem("zuck-stories-seenItems", JSON.stringify(newSeenStatue));

        // Edit Seen Statue in Document
        var storyElement = document.querySelector(`.story[data-id="${user._id}"]`);
        
        if (storyElement && storyElement.classList.contains("seen")) {
          storyElement.classList.remove("seen")
        }
      }
      /********************** if it's the first story *********************/
      else {
        if (user.stories.length >= 0) {
          var Story = {
            id: user._id,
            photo: user.photo,
            name: user.username,
            link: "",
            lastUpdated: story.addedAt,
            seen: false,
            items: [{
                id: user._id + '_' + new Date().getTime(),
                type: story.type,
                length: 10,
                src: story.src,
                preview: user.photo,
                link: "",
                linkText: "",
                time: Number(story.time),
                seen: false,
                addedAt: story.addedAt
              }]
          }

          STORIES.update(Story);
        }
      }
    },
    async subscribe() {
      //register service worker
      const register = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      var serviceWorker;
      if (register.installing) {
          serviceWorker = register.installing;
      } else if (register.waiting) {
          serviceWorker = register.waiting;
      } else if (register.active) {
          serviceWorker = register.active;
      }

      if (!serviceWorker) return;

      const urlBase64ToUint8Array = (base64String) => {
        const padding = "=".repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/\-/g, "+")
          .replace(/_/g, "/");
      
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
      
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      }

      if (serviceWorker.state == "activated") {
        // Get Notifications Subscription
        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.PUBLIC_VAPID_KEY)
        });

        // Send subscription to server to save
        return await this.$axios.$post("/api/subscribeToNotifications", {userId: this.$store.state.user._id, subscription: JSON.stringify(subscription)});
      }

      serviceWorker.addEventListener("statechange", async function(e) {
        if (e.target.state == "activated") {
          // Get Notifications Subscription
          const subscription = await register.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(process.env.PUBLIC_VAPID_KEY)
          });

          // Send Subscription to server to save
          await this.$axios.$post("/api/subscribeToNotifications", {userId: this.$store.state.user._id, subscription: JSON.stringify(subscription)});
        }
      });
      
    }
  },
  sockets: {
    recieveMyMsg (msg) {
      var chatID = msg.chatId;
      msg.user.photo = this.currentUser.photo;
      this.$store.commit("addMessageToAChat", { chatID, msg, lastOneNotSeen: false });
    },
    recieveFriendMsg ({message, chatId}) {
      var ALLCHATS = this.$store.state.chats;
      var lastOneNotSeen = true;

      ALLCHATS.forEach(chat => {
        if (chat._id == chatId) {
          // Check if the recieved message belongs to the opened chat
          if (this.$store.state.openedChatMode && this.$store.state.openedChat._id == chat._id) {
            // set last message to seen
            lastOneNotSeen = false;

            // remove unseen statue from the message on database
            this.$socket.emit('removeUnSeen', {chatId, userId: this.currentUser._id});

            // remove unseen statue from the message on ui
            var index = message.notSeen.findIndex(userID => userID == this.currentUser._id);
            if (index > -1) message.notSeen.splice(index, 1);
          }
        }
      });
      
      this.$store.commit("addMessageToAChat", { chatID: chatId, msg: message, lastOneNotSeen });
    },
    setMsgStatus ({tempId, message, chatID}) {
      this.$store.commit("setMsgStatus", {message, tempId, chatID, sent: true});
    },
    setMsgError ({err, tempId, chatID}) {
      this.$store.commit("setMsgStatus", {tempId, chatID, sent: "Not Sent"});

      Swal.fire({
        toast: true,
        icon: 'error',
        title: err
      });
    },
    messageDeleted({msgId, chatId}){
      this.$store.commit("deleteMessage", {msgId, chatId});
    },
    updateFriendStatus(friend){
      if (this.$store.state.chats.length) this.$store.commit("updateFriendStatus", friend);
    },
    chatCreated (chat) {
      var isTargted = chat.usersList.find(user => user._id == this.currentUser._id);

      if (isTargted) {
        this.$store.commit('addNewChat', chat);

        if (chat.noCallback) return;

        this.$socket.emit('createChat', {callback: true, _id: chat._id});
      }
    },
    setGroupEdits ({groupId, edits}) {
      const { $store, $axios } = this
      var ALLCHATS = $store.state.chats
      var i = ALLCHATS.findIndex(chat => chat._id == groupId)
      if (edits.removedUserId) {
        Object.keys($store.state.chats[i].usersList).forEach(KEY => {
          if ($store.state.chats[i].usersList[KEY]._id == edits.removedUserId) {
            delete $store.state.chats[i].usersList[KEY]
            ALLCHATS[i].groupAdmins.forEach((admin, Index) => {
              if (admin == edits.removedUserId) ALLCHATS[i].groupAdmins.splice(Index, 1)
            })
          }
        })
      } else if (edits.addMembers) {
        var number = false;
        edits.addMembers.forEach(async Member => {
          if(!number){
            Object.keys($store.state.chats[i].usersList).forEach(KEY => {
              number = Number(KEY.slice(7))
            })
          }
          number++
          var lastOne = `userNum${number}`
          // Get User Obj From Database Better
          var {user} = await $axios.$get(`/api/users/user?userId=${Member}`)
          $store.state.chats[i].usersList[lastOne] = user
        })
      } else {
        Object.keys(edits).forEach(editKey => {
          ALLCHATS[i][editKey] = edits[editKey]
        })
      }
    },
    removeFromGroup({userId, groupId}){
      if (userId == this.$store.state.user._id){
        this.$socket.emit('removeMe', groupId)
      }
    },
    joinGroup({groupId, chat}){
      this.$socket.emit('groupJoin', {groupId, chat: chat[0]})
    },
    friendRequestSent({ contact }){
      this.$store.commit("friendRequestSent", { contact });
    },
    friendRequestAccepted({ contact }){
      this.$store.commit("friendRequestAccepted", { contact });
    },
    removeFromFriends({ contactID, chatID }){
      this.$store.commit("removeFromFriends", { contactID, chatID });
      this.$socket.emit("leaveFriendRooms", { contactID, chatID });
      this.$forceUpdate();
    },
    changeUserPicture({ newPhoto, userId }){
      this.$store.commit("changeUserPictureInChats", { newPhoto, userId });
    },
    recieveStory (story) {
      const allChatsElement = document.querySelector(".allChats");
      if (allChatsElement) allChatsElement.classList.add("adaptWithStories");

      if (this.currentUser._id == story.userId) return this.checkAndAddStory(this.currentUser, story);

      this.currentUser.friendsList.forEach(friend => (friend._id == story.userId) && this.checkAndAddStory(friend, story));
    },
    receiveACall ({callerUserID, contactType, receiverID}) {

      if (callerUserID === this.$store.state.user._id) return;

      if (contactType == "user" && this.$store.state.call_info.statue === "onGoingCall") return this.$socket.emit("contactBusy", {callerUserID});
      
      var idx = this.currentUser.blockList.findIndex(user => user._id == callerUserID);
      if (contactType == "user" && idx > -1) return this.$socket.emit("cantCallBlockedContact", {callerUserID});

      if (contactType == "group" && this.$store.state.call_info.statue === "onGoingCall") return;

      const Ringtone = document.querySelector(".ringtone_element");

      Ringtone.currentTime = 0;

      Ringtone.play();

      const contact = contactType == "user" ?
        this.$store.state.user.friendsList.find(friend => friend._id === callerUserID)
        :
        this.$store.state.chats.find(chat => chat._id === receiverID);

      this.$store.commit('startCall', { caller: false, statue: "ringing", contact, contactType, callerUserID });

    }
  }
}
</script>
