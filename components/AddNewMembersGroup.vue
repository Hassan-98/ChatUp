<template>
  <div class="open-setting">
    <h4>Add New Members</h4>

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
    <button class="add_members_group" @click.prevent="add">
      Add Selected Friends
    </button>
  </div>
</template>

<style lang="scss" scoped>
  .open-setting {
    padding: 0 5px;
    & > h4 {
      margin: 0 0 8px 0;
      padding: 0 0 8px 0;
      border-bottom: 1px solid #ccc;
      color: var(--mc);
    }
    & > input {
      width: 100%;
      border: 1px solid #ccc;
      padding: 8px 12px;
      display: block;
      margin: 0 0 10px 0;
      border-radius: 15px;
      background: var(--white);
      font-family: 'Open Sans', sans-serif;
      font-size: 12px;
      &::placeholder {
        color: var(--mc);
      }
      &:focus {
        border-color: var(--mc);
      }
    }
    span {
      font-size: 24px;
      font-weight: bold;
      color: var(--mc);
    }
    & > i{
      float: right;
      background: #fff;
      font-size: 28px;
      border-radius: 50%;
      cursor: pointer;
      &:hover{
        color: var(--mc);
      }
      &::after {
        content: '';
        clear: both;
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

    button.add_members_group {
      position: absolute;
      bottom: 20px;
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
</style>

<script>
/* eslint-disable */
export default {
  data () {
    return {
      selectedUser: "",
      searchTxt: '',
      searchFriendsList: [],
      selectedFriends: []
    }
  },
  computed: {
    currentChat () {
      return this.$store.state.openedChat || false
    },
    currentUser () {
      return this.$store.state.user
    },
    friendsList () {
      return this.$store.state.user?.friendsList.filter(friend =>  !Object.values(this.currentChat.usersList).find(user => friend._id == user._id));
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
      if (e.target.classList.contains('create-group-modal') || (e.target.tagName === 'I' && e.target.classList.contains('close'))) { this.$store.commit('closeModal') }
    },
    addToSelected (e) {
      const { selectedFriends, friendsList, selectedUser } = this;

      const friend = friendsList.find(friend => friend.username === selectedUser);

      if (!friend) return;

      var found = selectedFriends.find(user => user._id == friend._id);

      if (!found) selectedFriends.push(friend);

      this.selectedUser = "";
    },
    removeFromSelected (e) {
      if (e.target.tagName == 'I') {
        var ID = e.target.parentElement.id
      } else {
        var ID = e.target.id
      }
      var i = this.selectedFriends.findIndex(f => f._id == ID)
      if (i > -1){
        this.selectedFriends.splice(i, 1)
      }
    },
    add () {
      const { currentChat, selectedFriends, $socket } = this
      if (selectedFriends.length == 0) {
        Swal.fire({
          toast: true,
          icon: 'error',
          title: 'You have to select some contacts to add'
        })
      } else {
        const users = selectedFriends.map(f => f._id);
        $socket.emit('editGroup', {
          groupId: currentChat._id,
          edits: {
            addMembers: users
          }
        });

        setTimeout(()=> document.querySelector('.settings-nav button:nth-of-type(2)').click(), 2000);
      }
    }
  }
}
</script>
