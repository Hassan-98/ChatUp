<template>
  <div class="open-setting">
    <h4>Group Admins</h4>
    <div class="friendsList">
      <div v-for="friend in adminsList" :key="friend._id" class="friend">
        <img :src="friend.photo" alt="">
        <h4>{{ friend.username }}</h4>
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
      adminsList: [],
      searchTxt: ''
    }
  },
  computed: {
    currentChat () {
      return this.$store.state.openedChat || false
    }
  },
  mounted () {
    const admins = []
    this.currentChat.groupAdmins.forEach((admin) => {
      Object.values(this.currentChat.usersList).forEach((user) => {
        if (user._id == admin) {
          admins.push(user)
        }
      })
    })
    this.adminsList = admins
  }
}
</script>
