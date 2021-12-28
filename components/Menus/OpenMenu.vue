<template>
  <div class="OpendMenu">
    <!-- Head Menu -->
    <div class="row menu-head">
      <div class="col-12 p-0 m-0">
        <h4>
          <img v-tooltip="currentUser.username" @click="openProfile" :src="currentUser.photo" class="img-fluid" alt="current user">
          {{ $store.state.opendMenu }}
        </h4>
      </div>
      <div class="icons-bar">
        <div class="head-icon">
          <i v-tooltip="'Friend Requests'" class="fa-duotone fa-bell notification" :class="currentUser.requestsList.length > 0 && `newRequests`" @click="showFriendRequests">
            <span v-if="currentUser.requestsList.length > 0" class="new" />
          </i>
        </div>
        <div class="head-icon">
          <i v-tooltip="'Create new group'" class="fa-duotone fa-users-medical" @click="createNewGroup" />
        </div>
        <div class="head-icon">
          <i v-tooltip="'Find contact'" class="fa-duotone fa-magnifying-glass-plus" @click="addNewFriend" />
        </div>
        <div class="head-icon">
          <i v-tooltip="'Add to diaries'" class="fa-duotone fa-icons" @click="addNewDiary" />
        </div>
      </div>
    </div>

    <!-- Chat Search -->
    <input v-model="searchTxt" type="text" :placeholder="`Search ${$store.state.opendMenu}`" @keyup="searchChats">

    <div id="stories" />

    <!-- All Chats -->
    <div class="allChats">
      <div v-if="search.length == 0 || !chats" class="row empty-chats">
        <div class="col-12">
          <h4>No Chats Yet</h4>
          <span>Add Some Friends & Start Chatting</span>
        </div>
      </div>
      <div v-for="chat in search" v-else :key="chat._id" class="chat row" @click="openChat(chat)">
        <div class="img">
          <img
            :src="chat.usersList.other ? chat.usersList.other.photo : chat.groupPhoto"
            alt="chat-img"
            :style="chat.lastOneNotSeen && 'border-color:darkred'"
          >
        </div>
        <div class="body">
          <h6>{{ chat.usersList.other ? chat.usersList.other.username : chat.groupName }}</h6>
          <p v-if="!chat.messages[chat.messages.length - 1].deleted" :style="chat.lastOneNotSeen ? 'font-weight:900' : 'font-weight:normal'">
            {{
              chat.messages[chat.messages.length - 1].location ? 'Location Sent' :
              chat.messages[chat.messages.length - 1].voiceCall ? chat.messages[chat.messages.length - 1].voiceCall.missed ? "Missed Voice Call" : "Voice Call" :
              chat.messages[chat.messages.length - 1].file ? 'File Sent' :
              chat.messages[chat.messages.length - 1].record ? 'Record Sent' :
              chat.messages[chat.messages.length - 1].msg | cutOff
            }}
            <i v-if="chat.lastOneNotSeen" class="fas fa-circle redAlert" />
          </p>
          <p v-else :style="chat.lastOneNotSeen ? 'font-weight:900' : 'font-weight:normal'">
            Message Deleted
            <i v-if="chat.lastOneNotSeen" class="fas fa-circle redAlert" />
          </p>
        </div>
        <div class="time">
          <p>{{ chat.messages[chat.messages.length - 1].sentAt | format }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .OpendMenu {
    height: 100vh;
    background: var(--bg);
    padding: 5px 10px;
    box-shadow: 1px 0 1px rgba($color: #000000, $alpha: 0.1);
    position: relative;
    z-index: 4;
    flex: 0 0 20%;
    .col-2, .col-3, .col-4, .col-6, .col-7, .col-8 {
      padding: 0;
      text-align: left;
    }
    @include lg {
      flex: 0 0 26%;
    }
    @include md {
      flex: 0 0 30%;
    }
    @include sm {
      flex: 0 0 88%;
    }
    @include xs {
      flex: 0 0 82%;
    }
    .menu-head {
      align-items: center;
      justify-content: space-between;
      padding: 5px 0;
      h4 {
        font-weight: bold;
        color: var(--mc);
        text-align: left;
        @include sm {
          margin: 0 0 7px;
        }
        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 5px;
          position: relative;
          top: -2px;
          border: 2px solid #ccc;
          cursor: pointer;
        }
      }
      .icons-bar {
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding: 0 5px;
        .head-icon {
          margin-top: 5px;
          margin-bottom: 5px;
          i {
            color: var(--mc);
            font-size: 24px;
            text-align: center;
            border-radius: 20px;
            cursor: pointer;
            position: relative;
            @include sm {
              font-size: 22px;
            }
            &.notification {
              &.newRequests {
                color: red;
              }
              .new {
                display: block;
                position: absolute;
                top: -2px;
                right: -2px;
                width: 9px;
                height: 9px;
                border-radius: 50%;
                background: red;
              }
            }
            &:hover{
              color: var(--wit);
            }
          }
        }
      }
    }
    input {
      width: 100%;
      border: 1px solid #ccc;
      color: var(--mc);
      padding: 8px 12px;
      display: block;
      margin: 0 0 10px 0;
      border-radius: 8px;
      background: #fff;
      font-family: 'Open Sans', sans-serif;
      font-size: 13px;
      background: var(--bg);
      &::placeholder {
        color: var(--wit);
      }
      &:focus {
        border-color: var(--mc);
      }
      @include sm {
        padding: 5px 10px;
      }
    }
    .allChats {
      height: calc(100vh - 165px);
      overflow-y: scroll;
      &.adaptWithStories {
        height: calc(100vh - 265px);
      }
      @include sm {
        height: calc(100vh - 140px);
        &.adaptWithStories {
          height: calc(100vh - 240px);
        }
      }
      .empty-chats {
        padding: 20px 0;
        h4, span {
          text-align: center;
          font-weight: bold;
          color: var(--wit);
        }
        span {
          font-weight: normal;
          display: block;
        }
      }
      .chat {
        border-bottom: 1px solid var(--borders);
        padding: 12px 0 12px 10px;
        cursor: pointer;
        position: relative;
        border-radius: 10px;
        &:hover {
          background: var(--white);

        }
        .img {
          img {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            border: 2px solid #ccc;
            box-shadow: 0 0 5px rgba($color: #000000, $alpha: 0.2);
          }
        }
        .body {
          padding: 0 8px;
          h6 {
            text-transform: capitalize;
            margin: 7px 0 0;
            font-weight: bold;
            color: var(--mc);
            @include sm {
              font-size: 15px;
            }
          }
          p {
            font-family: 'Tajawal', sans-serif;
            margin: 0;
            font-size: 12px;
            color: var(--mc);
            .redAlert {
              color: red;
              font-size: 8px;
              margin-left: 5px;
            }
          }
        }
        .time {
          position: absolute;
          top: 7px;
          right: 5px;
          text-align: center;
          p {
            color: var(--mc);
            margin: 28px 5px 0 0;
            font-size: 10px;
          }
        }
      }
    }
    .stories.carousel {
      padding: 0;
      .story {
        width: 60px!important;
        & > .item-link > .item-preview {
          height: 80px!important;
          padding: 2px;
          border-radius: 9px;
        }
        & > .item-link > .info {
          margin-top: 0!important;
          strong {
            font-size: 11px;
            color: var(--mc);
          }
        }
      }
    }
    .stories.facesnap {
      .story {
        & > .item-link>.item-preview>* {
          border-radius: 7px;
          border: 0;
        }
      }
    }
  }
  .multifirend {
    width: 95%;
    height: 200px;
    background: transparent;
    padding: 5px 10px;
      border-radius: 5px;
    outline: none;
    option {
      padding: 5px;
      border-radius: 5px;
      background: #ccc;
      margin: 5px 0;
      &::before{
        content: "* "
      }
    }
  }
</style>

<script>
/* eslint-disable */
import moment from 'moment';

export default {
  data () {
    return {
      searchTxt: '',
      search: []
    }
  },
  computed: {
    currentUser () {
      return this.$store.state.user || false
    },
    chats () {
      if (this.$store.state.chats.length === 0) return [];

      const chats = this.$store.state.chats.filter((chat) => chat.roomType === this.$store.state.opendMenu);

      // Coverting Users Array To Object
      const allChats = this.convertChatsUsers(chats);
    
      // Set Search Array To Chats
      this.search = allChats;

      return allChats;
    },
    opendMenu (){
      return this.$store.state.opendMenu
    }
  },
  watch: {
    opendMenu(menu) {
      if (menu == "Chats" || menu == "Groups" || menu == "Archives") {
        if (this.$store.state.chats.length === 0) return;

        const chats = this.$store.state.chats.filter((chat) => chat.roomType === this.$store.state.opendMenu);

        // Coverting Users Array To Object
        const allChats = this.convertChatsUsers(chats);

        this.search = allChats;

        this.$forceUpdate();
      }
    }
  },
  mounted () {
    this.search = this.chats;

    const stories = this.getStories();

    if (stories.length) document.querySelector(".allChats").classList.add("adaptWithStories");

    // START STORIES SYSTEM
    window.STORIES = new Zuck(document.getElementById('stories'), {
      skin: 'facesnap',      // container class
      avatars: true,         // shows user photo instead of last story item preview
      list: false,           // displays a timeline instead of carousel
      openEffect: true,      // enables effect when opening story
      cubeEffect: false,     // enables the 3d cube effect when sliding story
      autoFullScreen: false, // enables fullscreen on mobile browsers
      backButton: true,      // adds a back button to close the story viewer
      backNative: false,     // uses window history to enable back button on browsers/android
      previousTap: true,     // use 1/3 of the screen to navigate to previous item when tap the story
      localStorage: true,    // set true to save "seen" position. Element must have a id to save properly.
      reactive: false,        // set true if you use frameworks like React to control the timeline (see react.sample.html)
      rtl: false,            // enable/disable RTL
      stories
    });

    /* Check If There Are Any New Stories Added While I'm Offline */
    stories.forEach(story => {
      if (Number(story.lastUpdated) > new Date(this.currentUser.lastActive).getTime()) {
        // Edit Seen Statue in localStorage
        const newSeenStatue = {
          ...JSON.parse(localStorage["zuck-stories-seenItems"]),
          [story.id]: false
        }

        localStorage.setItem("zuck-stories-seenItems", JSON.stringify(newSeenStatue));

        // Edit Seen Statue in Document
        var storyElement = document.querySelector(`.story[data-id="${story.id}"]`);
        
        if (storyElement && storyElement.classList.contains("seen")) {
          storyElement.classList.remove("seen")
        }
      }
    });

  },
  methods: {
    async openProfile () {
      var {user} = await this.$axios.$get(`/api/users/user?userId=${this.currentUser._id}`)
      this.$store.commit('openOpMenu', user);
      this.$store.commit('closeModal');
    },
    convertChatsUsers(chats){
      const currentUser = this.$store.state.user;

      var chats = chats.map((chat) => {
        var ChatUsers = Object.values(chat.usersList);

        if (!ChatUsers.length) return {};

        if (this.$store.state.opendMenu === 'Chats') {

          const usersList = {}

          ChatUsers.forEach((user) => {
            if (user._id === currentUser._id) usersList.me = user;
            else usersList.other = user;
          })

          chat.usersList = usersList

        } else if (this.$store.state.opendMenu === 'Groups') {

          const usersList = {}

          ChatUsers.forEach((user, i) => {
            if (user._id === currentUser._id) usersList.me = user;
            else usersList[`userNum${i}`] = user;
          })

          chat.usersList = usersList
        }

        var counter = 0;
        chat.messages.forEach((msg) => {
          if (msg.notSeen.length > 0) {
            msg.notSeen.forEach(id => {
              if (id == currentUser._id) counter++;
            });
          }
        });
        if (counter > 0) chat.lastOneNotSeen = true;

        return chat;
      });
      return chats;
    },
    getStories () {
        // All Stories
        var allStories = [];

        // My Story
        if(this.currentUser.stories && this.currentUser.stories.length > 0) {

          var myStory = {
            id: this.currentUser._id,
            photo: this.currentUser.photo,
            name: this.currentUser.username,
            link: "",
            lastUpdated: new Date().getTime(),
            items: []
          }

          var myStoryItems = this.currentUser.stories.map(story => {
            return {
                id: this.currentUser._id + '_' + new Date().getTime(),
                type: story.type,
                length: 10,
                src: story.src,
                preview: this.currentUser.photo,
                link: "",
                linkText: "",
                time: Number(story.time),
                seen: false,
                addedAt: story.addedAt
              }
          })

          myStory.items = myStoryItems;

          myStory.lastUpdated = myStoryItems[myStoryItems.length - 1].addedAt;

          allStories.push(myStory);
          
        }

        // My Friends Stories
        this.currentUser.friendsList.forEach(friend => {
          if (friend.stories && friend.stories.length > 0) {

            var myFriendStory = {
              id: friend._id,
              photo: friend.photo,
              name: friend.username,
              link: "",
              lastUpdated: new Date().getTime(),
              items: []
            }

            var myFriendStoryItems = friend.stories.map(story => {
              return {
                  id: friend._id + '_' + new Date().getTime(),
                  type: story.type,
                  length: 10,
                  src: story.src,
                  preview: friend.photo,
                  link: "",
                  linkText: "",
                  time: Number(story.time),
                  seen: false,
                  addedAt: story.addedAt
                }
            })

            myFriendStory.items = myFriendStoryItems;

            myFriendStory.lastUpdated = myFriendStoryItems[myFriendStoryItems.length - 1].addedAt;

            allStories.push(myFriendStory);

          }
        })

        return allStories;
    },
    openChat (chat) {
      var currentUserID = this.currentUser._id;

      if (chat.lastOneNotSeen) {
        chat.lastOneNotSeen = false;
        this.$socket.emit('removeUnSeen', {chatId: chat._id, userId: currentUserID});
        
        // Edit Chat Messages Unseen Statue
        var messages = chat.messages.map(message => {
          // remove unseen statue from the message
          var index = message.notSeen.findIndex(userID => userID == currentUserID);
          if (index > -1) message.notSeen.splice(index, 1);

          return message;
        });

        chat.messages = messages;
      }

      this.$store.commit('updateChat', chat);
      this.$store.commit('openChat', chat);
    },
    addNewFriend () {
      const { $axios } = this
      Swal.fire({
        title: 'Find a contact',
        text: "enter contact's email address",
        icon: "info",
        input: 'text',
        inputPlaceholder: "enter contact's email address",
        showCancelButton: true,
        confirmButtonText: "Search",
        allowOutsideClick: false,
        closeOnClickOutside: false,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to enter email address!'
          } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))) {
            return 'email address is not vaild'
          }
        },
        preConfirm(value){
          Swal.showLoading()
          return $axios.$get(`/api/users/user?email=${value}`)
        }
      }).then(({value}) => {
        if (value && value.user) this.$store.commit('openOpMenu', value.user);
        else if (value && value.err) {
          Swal.fire({
            toast: true,
            icon: 'error',
            title: "Cannot find a contact with this email address"
          })
        }
      })
    },
    createNewChat(){
      const { $axios } = this
      Swal.fire({
        title: 'Enter Email Address',
        input: 'text',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to enter email address!'
          } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))) {
            return 'email address is not vaild'
          }
        },
        preConfirm(value){
          Swal.showLoading()
          return $axios.$get(`/api/users/user?email=${value}`)
        }
      }).then(({value}) => {
        if (value != false && value.user) this.$store.commit('openOpMenu', value.user)
        else Swal.fire({
            toast: true,
            icon: 'error',
            title: "user is not found"
          })
      })
    },
    createNewGroup () {
      this.$store.commit('openCreateGroupModal')
    },
    showFriendRequests(){
      this.$store.commit('openSettingModal')
      this.$store.state.openSetting = 'FriendsRequests'
      setTimeout(() => {
        var btn = document.querySelector('.requestsListBtn')
        Object.values(btn.parentElement.children).forEach((child) => {
          child.classList.remove('active')
        })
        btn.classList.add('active')
       }, 0)
    },
    searchChats(){
      var username = new RegExp(this.searchTxt, 'i')
      this.search = this.chats.filter(chat => {
        if (chat.usersList.other) {
          if (chat.usersList.other.username.search(username) > -1) return chat
        } else {
          if (chat.groupName.search(username) > -1) return chat
        }
      })
    },
    addNewDiary (){
      const { $socket, $store, $axios, currentUser } = this
      Swal.fire({
        title: 'Add to your diaries',
        text: "select an image or a video",
        icon: "info",
        input: 'file',
        allowOutsideClick: false,
        closeOnClickOutside: false,
        showCancelButton: true,
        confirmButtonText: "Upload",
        inputValidator: (value) => {
          if (!value || !value.type) {
            return 'You need pick an image or video'
          } else if (value.type.split('/')[0] != 'image' && value.type.split('/')[0] != 'video') {
            return 'You can only pick an image or video'
          }
        },
        preConfirm(value){
          Swal.showLoading()
          var formdata = new FormData()
          formdata.append('story', value)
          formdata.append('type', value.type.split('/')[0])
          formdata.append('time', new Date().getTime() / 1000)
          return $axios.$post(`/api/users/story?userId=${currentUser._id}`, formdata)
        }
      }).then(({value}) => {
        var {err, success, story} = value
        if (success) {
          $store.commit('setUser', success)
          $socket.emit('addStory', {
            userId: currentUser._id,
            story
          })
        }
        else Swal.fire({
            toast: true,
            icon: 'error',
            title: err.message
          })
      })
    }
  },
  filters: {
    cutOff(v) {
      if (v.slice(0, 20).length < v.length) return v.slice(0, 20) + '...'
      else return v.slice(0, 20)
    },
    format(v) {
      return moment(v).fromNow()
    }
  }
}
</script>
