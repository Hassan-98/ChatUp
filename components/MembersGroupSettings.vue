<template>
  <div class="open-setting">
    <h4>Group Members</h4>
    <input v-model="searchTxt" type="text" placeholder="Search Members" @keyup="search">
    <div class="friendsList">
      <div v-for="friend in usersList" :key="friend._id" class="friend">
        <img :src="friend.photo" @click="openProfile(friend)">
        <h4 @click="openProfile(friend)">
          {{ friend.username }}
        </h4>
        <i
          v-if="(isMeAdmin && friend._id != currentUser._id) && !friend.isAdmin"
          v-tooltip="'Remove Memeber'"
          class="fal fa-user-times"
          @click="deleteFromGroup($event, friend._id, friend.username)"
        />
        <i v-if="(isMeAdmin && friend._id != currentUser._id) && !friend.isAdmin" v-tooltip="'Set as admin'" class="fal fa-crown" @click="makeAdmin($event, friend._id, friend.username)" />
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
          &:last-of-type {
            right: 15px;
          }
          &:first-of-type {
            right: 55px;
          }
          &:only-of-type {
            right: 15px;
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
      return this.$store.state.user|| false
    },
    currentChat () {
      return this.$store.state.openedChat || false
    },
    isMeAdmin () {
      var isMeAdmin = false
      this.$store.state.openedChat.groupAdmins.forEach(admin => {
        if (this.$store.state.user._id == admin) isMeAdmin = true;
      });
      return isMeAdmin
    },
    usersList() {
      const usersList = Object.assign({}, this.$store.state.openedChat.usersList);
      const usersListValues = Object.values(usersList);

      usersListValues.map(friend => {
        var isAdmin = this.$store.state.openedChat.groupAdmins.find(adminID => adminID == friend._id)
        if (isAdmin) {
          friend.isAdmin = true;
          return friend;
        }
        return friend;
      });

      var namespaces = Object.keys(usersList);

      namespaces.forEach((key, idx) => {
        usersList[key] = usersListValues[idx]
      })

      return usersList || []
    }
  },
  methods: {
    async openProfile (userObj) {
      var {user} = await this.$axios.$get(`/api/users/user?userId=${userObj._id}`)
      this.$store.commit('openOpMenu', user);
      this.$store.commit('closeModal');
    },
    async deleteFromGroup (e, id, username) {
      const { currentChat, $store, $socket } = this
      Swal.fire({
        title: `Remove ${username} From Group?`,
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.value) {
          const usersList = Object.assign({}, currentChat.usersList);
          const usersListValues = Object.values(currentChat.usersList);
          var i = usersListValues.findIndex(user => user._id == id)
          var userNamespace = Object.keys(currentChat.usersList)[i];
          delete usersList[userNamespace];

          $store.commit("editGroup", {groupId: currentChat._id, usersList});
          $socket.emit('editGroup', {
            groupId: currentChat._id,
            edits: {
              removedUserId: id
            }
          });
          this.$forceUpdate();
        }
      })
    },
    search() {
      var username = new RegExp(this.searchTxt, 'i')
      this.usersList = Object.values(this.currentChat.usersList).filter(friend => friend.username.search(username) > -1)
    },
    makeAdmin (e, id, username) {
      const { currentChat, $socket, $store } = this
      Swal.fire({
        title: `Set ${username} as an admin?`,
        text: `${username} will be an admin to this chat group`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.value) {
          const groupAdmins = [...currentChat.groupAdmins]
          groupAdmins.push(id);
          $store.commit("editGroup", {groupId: currentChat._id, groupAdmins});
          $socket.emit('editGroup', {
            groupId: currentChat._id,
            edits: {
              groupAdmins: groupAdmins
            }
          })
        }
      })
    }
  },
  sockets: {
    setGroupEdits ({edits}) {
      if (edits.groupAdmins) {
        Object.values(this.currentChat.usersList).forEach(user => {
          edits.groupAdmins.forEach((a) => {
            if (a == user._id) { user.isAdmin = true }
          })
        })
      }
    }
  }
}
</script>
