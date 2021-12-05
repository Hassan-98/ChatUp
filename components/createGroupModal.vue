<template>
  <div class="create-group-modal">
    <div class="create-group-modal-body">
      <UploadingLoader v-if="isUploading" />
      <div class="main">
        <span>Create New Group</span>
        <i v-tooltip="'close'" class="far fa-times closeBtn" @click="closeModal" />
        <hr>
        <div class="group_info">
          <div class="input_group">
            <label>Group Name</label>
            <span class="input">
              <i class="fas fa-users" />
              <input v-model="groupName" type="text" placeholder="Group Name">
            </span>
          </div>
          <div class="input_group">
            <label>Group Photo</label>
            <span class="input">
              <i class="fas fa-image" />
              <input class="group-photo" type="file">
            </span>
          </div>
        </div>

        <div class="select_friends_search">
          <input type="text" placeholder="Search Friends" class="search_friends_input" @keyup="searchFriends">
          <div v-if="searchFriendsList.length" class="selection_list">
            <div v-for="friend in searchFriendsList" :key="friend._id" class="friend" @click="selectFriend(friend)">
              <img :src="friend.photo" alt="friend picture">
              <span> <b>{{ friend.username }}</b> &nbsp; | &nbsp; {{ friend.email }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedFriends.length" class="friendsList">
          <div v-for="friend in selectedFriends" :key="friend._id" class="friend">
            <img :src="friend.photo" alt="">
            <h4>{{ friend.username }}</h4>
            <button :id="friend._id" @click="removeFromSelected">
              <i class="fas fa-times" />
            </button>
          </div>
        </div>

        <div v-else class="no_selected">
          <h3>No Friends Selected</h3>
        </div>
        <button class="create_group" @click.prevent="create">
          Create Group
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .create-group-modal {
    width: 100%;
    height: 100%;
    background: rgba($color: #000, $alpha: 0.8);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 999999;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    .create-group-modal-body {
      background: rgba($color: #000, $alpha: 0.5);
      width: 80%;
      height: 90%;
      @include md {
        width: 90%;
        height: 90%;
      }
      @include xs {
        width: 100%;
        height: 100%;
        border-radius: 0;
      }
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 1px 1px 10px rgba($color: #000, $alpha: 0.2);
      .main {
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        background: var(--white);
        text-align: left;
        padding: 15px;
        span {
          font-size: 24px;
          color: var(--mc);
        }
        & > i{
          float: right;
          font-size: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-weight: bold;
          color: var(--mc);
          &::after {
            content: '';
            clear: both;
          }
        }

        .group_info {
          display: flex;
          flex-wrap: wrap;
          width: 85%;
          margin: 15px auto;

          @include sm {
            width: 95%;
          }

          .input_group {
            display: inline-flex;
            flex-wrap: wrap;
            margin-right: 10px;
            width: calc(50% - 10px);

            &:nth-of-type(even) {
              margin-right: 0;
              width: 50%;
            }

            @include sm {
              width: 100%!important;
            }

            label {
              color: #aaa;
              padding: 0;
              width: 100%;
              margin-top: 10px;
            }
            span.input {
              display: flex;
              padding: 0;
              width: 100%;
              i {
                padding: 7px 10px;
                margin: 0 0 5px;
                background: #f2f2f2;
                border-radius: 0;
                border: 2px solid #f2f2f2;
                border-right: 0;
                font-size: 25px;
                color: #aaa;
              }
              select {
                border: none;
              }
              input, select {
                background: #F8F8F8;
                outline: none;
                padding: 7px 12px;
                font-size: 15px;
                display: block;
                margin: 0 0 5px;
                width: 100%;
                border-radius: 0;
                border-left: 0;
                &:focus {
                  border-color: #f2f2f2;
                  & i {
                    border-color: var(--mc2);
                  }
                }
              }
              textarea {
                padding: 7px 12px;
                font-size: 15px;
                display: block;
                margin: 0 0 5px;
                width: 100%;
                border-radius: 0;
                &:focus {
                  border-color: #f2f2f2;
                }
              }
              &.input-file {
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                img {
                  width: 120px;
                  height: 120px;
                  border-radius: 50%;
                  margin: 5px 0 15px;
                  border: 2px dashed var(--wit);
                }
              }
            }
          }
        }

        .select_friends_search {
          display: flex;
          flex-wrap: wrap;
          width: 85%;
          margin: 15px auto;
          position: relative;

          @include sm {
            width: 95%;
          }

          input {
            width: 100%;
            height: 40px;
            border: none;
            padding: 10px 15px;
            margin: 0;
            border-radius: 10px;
            background: #fff;
            font-family: 'Open Sans', sans-serif;
            font-size: 15px;
            background: var(--bg);
            border: 1px solid var(--mc);
            color: var(--mc);
            &::placeholder {
              color: var(--wit);
            }
            &:focus {
              border-color: var(--mc);
            }
          }
          .selection_list {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
            position: absolute;
            z-index: 1;
            top: 40px;
            left: 0;
            background-color: #f6f6f6;
            border-radius: 0 0 15px 15px;
            border: 3px solid #f6f6f6;
            overflow: hidden;
            .friend {
              width: 100%;
              position: relative;
              padding: 10px 15px;
              cursor: pointer;
              &:hover {
                background-color: #fff;
              }
              img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-right: 10px;
              }
              span {
                font-size: 15px;
              }
            }
          }
        }

        .no_selected {
          width: 85%;
          margin: 15px auto;
          padding: 50px 0;
          color: var(--mc);
          text-align: center;
          background: rgba($color: #000000, $alpha: 0.05);
          border-radius: 10px;

          @include sm {
            width: 95%;
          }
        }

        .friendsList {
          overflow-y: scroll;
          width: 85%;
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

          @include sm {
            width: 95%;
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
              margin-bottom: 0;
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
            }
            button {
              position: absolute;
              padding: 0;
              margin: 0;
              top: 50%;
              transform: translateY(-50%);
              right: 20px;
              font-size: 24px;
              border-radius: 50%;
              cursor: pointer;
              border: 0;
              background: none;
              box-shadow: none;
              color: var(--mc);
              &:hover {
                color: red;
              }
            }
          }
        }

        button.create_group {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: block;
          margin: 20px auto;
          border-radius: 7px;
          background: var(--mc);
          font-weight: bold;
          color: var(--white);
          border: none;
          font-size: 18px;
          padding: 12px 50px;
          box-shadow: 0 0 5px rgba($color: #000, $alpha: 0.05);
          &:hover {
            transform: translateX(-50%);
            box-shadow: none;
          }
          @include sm {
            width: 95%;
          }
        }
      }
    }
  }
</style>

<script>
/* eslint-disable */
import UploadingLoader from './loadingRequest.vue';

export default {
  data () {
    return {
      selectedUser: "",
      groupName: '',
      searchTxt: '',
      isUploading: false,
      searchFriendsList: [],
      selectedFriends: []
    }
  },
  components: {
    UploadingLoader
  },
  computed: {
    currentUser () {
      return this.$store.state.user;
    },
    friendsList () {
      return this.$store.state.user?.friendsList;
    }
  },
  methods: {
    searchFriends(e){
      var text = e.target.value;

      if (!text) {
        document.querySelector(".select_friends_search").classList.remove("list_open");
        return this.searchFriendsList = [];
      }

      document.querySelector(".select_friends_search").classList.add("list_open");

      this.searchFriendsList = this.friendsList.filter((friend) => friend.username.toLowerCase().includes(text.toLowerCase()));
    },
    selectFriend(friend){
      var found = this.selectedFriends.find(user => user._id == friend._id);
      if (!found) this.selectedFriends.push(friend);
      document.querySelector(".search_friends_input").value = "";
      this.searchFriendsList = [];
    },
    closeModal (e) {
      this.$store.commit('closeModal');
    },
    removeFromSelected (e) {
      var ID;

      if (e.target.tagName == 'I') ID = e.target.parentElement.id;
      else var ID = e.target.id;
      
      const idx = this.selectedFriends.findIndex(friend => friend._id == ID)
      if (idx > -1) this.selectedFriends.splice(idx, 1);
    },
    async create () {
      // Grap Group Info & Users
      const { groupName, selectedFriends, $store, $axios, $socket, currentUser } = this
      // Grap Group Avatar From Input
      var photo = document.querySelector('.group-photo').files[0] || '/un.gif';

      if (groupName == '' || selectedFriends.length == 0) return Swal.fire({
        toast: true,
        icon: 'error',
        title: 'You have to provide a group name and select some contacts to add'
      })

      // Init Loader
      this.isUploading = true;

      // Create Group Users Array
      const users = selectedFriends.map(friend => friend._id);
      // Add Me To Group Users Array
      users.push(currentUser._id);

      // Create Request Form Data
      var formdata = new FormData()
      formdata.append('groupPhoto', photo);
      formdata.set('groupName', groupName);
      formdata.set('users', users);

      // Send The Request To API Endpoint
      const res = await $axios.$post(`/api/chats/group/${currentUser._id}`, formdata)

      if (res.err) {
        // Hide Loader
        this.isUploading = false;
        // Show Error Message
        return Swal.fire({
          toast: true,
          icon: 'error',
          title: res.err
        });
      }

      Swal.fire({
          toast: true,
          icon: 'success',
          title: `${groupName} created`
      });

      // Hide Loader
      this.isUploading = false;

      var chatObj = res.result[0];

      chatObj.lastOneNotSeen = false;

      var openedChat = Object.assign({}, chatObj);

      const usersList = { me: {} };

      chatObj.usersList.forEach((user, i) => {
        if (user._id === currentUser._id) usersList.me = user
        else usersList[`userNum${i}`] = user;
      })

      openedChat.usersList = usersList;

      $store.commit('addNewChat', chatObj);

      $store.commit('openChat', openedChat);

      $socket.emit('createChat', chatObj);
    
      $store.commit('changeMenu', "Groups");

      $store.commit('closeModal');

    }
  }
}
</script>
