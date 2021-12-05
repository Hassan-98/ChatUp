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
  .main {
    width: 100%;
    height: 100vh;
    position: relative;
    .row {
      margin: 0;
    }
  }
</style>

<script>
/* eslint-disable */
import SideBar from '../components/Sidebar.vue'
import OpenMenu from '../components/OpenMenu.vue'
import OpenChat from '../components/OpenChat.vue'
import OptionalChatMenu from '../components/OptionalChatMenu.vue'
import OptionalMenu from '../components/OptionalMenu.vue'
import PictureModal from '../components/PictureModal.vue'
import SettingModal from '../components/SettingModal.vue'
import CreateGroup from '../components/createGroupModal.vue'
import EditGroup from '../components/editGroupModal.vue'
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
  mounted () {
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
    this.$socket.emit('connectUser', this.currentUser)
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
  },
  sockets: {
    recieveMsg (msg) {
      var ALLCHATS = this.$store.state.chats;
      var chatID = msg.chatId;
      var lastOneNotSeen = true;

      ALLCHATS.forEach(chat => {
        if (chat._id == chatID) {
          var user = Object.values(chat.usersList).find(friend => friend._id == msg.userId);

          msg.user = user;

          // Check if the recieved message belongs to the opened chat
          if (this.$store.state.openedChatMode && this.$store.state.openedChat._id == chat._id) {
            // set last message to seen
            lastOneNotSeen = false;
            // check if the current user not the sender of recieved message
            if (msg.userId != this.currentUser._id) {
              // remove unseen statue from the message on database
              this.$socket.emit('removeUnSeen', {chatId: chatID, userId: this.currentUser._id});

              // remove unseen statue from the message on ui
              var index = msg.notSeen.findIndex(userID => userID == msg.userId);
              if (index > -1) msg.notSeen.splice(index, 1);
            }
          }
        }
      });
      
      this.$store.commit("addMessageToAChat", { chatID, msg, lastOneNotSeen });
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
    recieveStory (story) {
      if (this.currentUser._id == story.userId) return this.checkAndAddStory(this.currentUser, story);

      this.currentUser.friendsList.forEach(friend => (friend._id == story.userId) && this.checkAndAddStory(friend, story));
    },
    receiveACall ({callerUserID, contactType, receiverID}) {

      if (callerUserID === this.$store.state.user._id) return;

      if (contactType == "user" && this.$store.state.call_info.statue === "onGoingCall") return this.$socket.emit("contactBusy", {callerUserID});

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
