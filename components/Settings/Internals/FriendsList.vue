<template>
  <div class="open-setting">
    <h4>Friends List</h4>
    <input v-model="searchTxt" type="text" placeholder="Search Friends" @keyup="search">
    <div v-if="friendsList.length == 0" class="no-friends">
      <h4>No Friends Yet</h4>
    </div>
    <div v-else class="friendsList">
      <div v-for="friend in friendsList" :key="friend._id" class="friend">
        <img :src="friend.photo" @click="openProfile(friend)">
        <h4 @click="openProfile(friend)">
          {{ friend.username }}
        </h4>
        <i v-tooltip="'Remove friend'" class="fal fa-user-times" @click="removeFriend(friend._id, friend.username)" />
        <i v-tooltip="'Send message'" class="fal fa-comment-dots" @click="startChat(friend._id)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .open-setting {
    padding: 0 5px;
    & > h4 {
      margin: 0 0 8px 0;
      padding: 0 0 8px 0;
      border-bottom: 1px solid #ccc;
      font-weight: bold;
      color: var(--mc);
    }
    & > input {
      width: 100%;
      border: 1px solid #ccc;
      padding: 10px 12px;
      display: block;
      margin: 0 0 10px 0;
      border-radius: 5px;
      background: var(--white);
      font-family: 'Open Sans', sans-serif;
      font-size: 13px;
      color: var(--mc);
      &::placeholder {
        color: var(--mc);
      }
      &:focus {
        border-color: var(--mc);
      }
    }

    .no-friends {
      width: 100%;
      margin: 15px auto;
      padding: 100px 0;
      color: var(--mc);
      text-align: center;
      background: rgba($color: #000000, $alpha: 0.05);
      border-radius: 10px;
    }

    .friendsList {
      overflow-y: scroll;
      width: 100%;
      margin: 15px auto;
      max-height: 500px;

      &::-webkit-scrollbar {
        width: 2px;
        height: 2px;
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        width: 2px;
        height: 2px;
        background-color: rgba($color: #000, $alpha: 0.3);
      }

      & > h5 {
        margin: 10px;
        color: var(--mc);
        font-weight: bold;
      }
      .friend {
        display: inline-flex;
        align-items: center;
        padding: 8px 0 8px 15px;
        margin: 10px 10px 10px 0;
        background: var(--bg);
        border-radius: 8px;
        position: relative;
        box-shadow: none;
        width: calc(50% - 10px);
        &:nth-of-type(even) {
          margin-right: 0;
          width: 50%;
        }
        @include sm {
          width: 100%!important;
        }
        img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-right: 7px;
        }
        h4 {
          font-weight: bold;
          color: var(--mc);
          cursor: pointer;
        }
        i {
          position: absolute;
          padding: 8px;
          background: transparent;
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: var(--mc);
          &:first-of-type {
            right: 15px;
          }
          &:last-of-type {
            right: 55px;
          }
          &:hover {
            color: var(--text);
          }
          @include sm {
            border-color: transparent;
          }
        }
      }
    }
  }
</style>

<script>
/* eslint-disable */
export default {
  data () {
    return {
      searchTxt: ''
    }
  },
  computed: {
    currentUser () {
      return this.$store.state.user || false;
    },
    friendsList (){
      return this.$store.state.user?.friendsList;
    }
  },
  methods: {
    async openProfile (userObj) {
      var {user} = await this.$axios.$get(`/api/users/user?userId=${userObj._id}`)
      this.$store.commit('openOpMenu', user)
      this.$store.commit('closeModal');
    },
    async removeFriend (id, username) {
      const { $socket, $axios, currentUser } = this;

      Swal.fire({
        title: `Remove From Friends?`,
        text: `You will not be able to chat with ${username} again!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Remove'
      }).then(async (result) => {
        if (result.value) {
          const res = await $axios.$delete(`/api/users/friends/${currentUser._id}?freindId=${id}`);

          if(res.err) {
            return Swal.fire({
              toast: true,
              icon: 'error',
              title: res.err,
            });
          } else {
            $socket.emit('removeContact', {contactID: id});

            Swal.fire({
              toast: true,
              icon: 'success',
              title: `${username} has been removed from your friends`
            });

          }
        }
      })
    },
    search() {
      var username = new RegExp(this.searchTxt, 'i')
      this.friendsList = this.currentUser.friendsList.filter(friend => friend.username.search(username) > -1)
    },
    async startChat (id) {
      const { currentUser, $axios, $store, $socket } = this
      const res = await $axios.$post(`/api/chats/${currentUser._id}?userTo=${id}`)

      if (res.err) {
        return Swal.fire({
          toast: true,
          icon: 'error',
          title: res.err,
        });
      } else if (!res.found) {
          var chatObj = res.chat;

          chatObj.lastOneNotSeen = false;

          var openedChat = Object.assign({}, chatObj);

          const usersList = { me: {}, other: {} };

          chatObj.usersList.forEach((user) => {
            if (user._id === currentUser._id) usersList.me = user
            else usersList.other = user
          })

          openedChat.usersList = usersList;

          $store.commit('addNewChat', chatObj);

          $store.commit('openChat', openedChat);

          $socket.emit('createChat', chatObj);
        
          $store.commit('changeMenu', "Chats");
          
          // To Invoke New Added Chat
          if (document.querySelector(".main-sidebar-btns[title='Groups']")) {
            document.querySelector(".main-sidebar-btns[title='Groups']").click();
            setTimeout(() => document.querySelector(".main-sidebar-btns[title='Chats']").click(), 10);
          }

          setTimeout(() => $store.commit('closeModal'), 20);
      } else {
        var chat = $store.state.chats.find(room => room._id == res.chat._id)
        chat.lastOneNotSeen = false;
        $store.commit('openChat', chat);
        $store.commit('closeModal');
      }
    }
  }
}
</script>
