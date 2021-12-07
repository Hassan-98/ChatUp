<template>
  <div class="OptionalMenu" :class="$store.state.OptionalMenu ? 'opend':'closed'">
    <i v-tooltip="'close'" class="fas fa-times-circle" @click="close" />
    <div class="menu-head">
      <img :src="openUser.photo" alt="chat-img">
      <h4>{{ openUser.username }}</h4>
      <br>
      <button v-if="!friend && cUser._id != openUser._id && !blocked" @click.stop="sendFriendRequest($event, openUser._id)">
        <i class="fad fa-user-plus" /> Add
      </button>
      <button v-if="friend && cUser._id != openUser._id" @click="startChat($event, openUser._id)">
        <i class="fad fa-comment-alt-lines mr-1" /> Message
      </button>
      <button v-if="cUser._id != openUser._id && !blocked" @click.stop="block($event, openUser._id)">
        <i class="fad fa-user-lock" /> Block
      </button>
      <button v-if="cUser._id == openUser._id" @click.stop="openSettings">
        <i class="fad fa-user-cog" /> Edit Profile
      </button>
    </div>
    <div class="menu-body">
      <p>{{ openUser.aboutMe }}</p>
      <h5>
        <i class="fal fa-mobile-android" />
        <span>{{ openUser.phone }}</span>
      </h5>
      <h5>
        <i class="fal fa-map-marker-alt" />
        <span>{{ openUser.address }}</span>
      </h5>
      <h5>
        <i class="fal fa-clock" />
        <span>{{ openUser.createdAt | formatJoinedAt }}</span>
      </h5>
      <h5>
        <i class="fal fa-globe" />
        <span>
          {{ openUser.website }}
        </span>
      </h5>
      <h4>Social Media</h4>
      <p class="socials">
        <i class="fab fa-facebook-square" title="Facebook Profile" @click="openLink(openUser.facebookLink)" />
        <i class="fab fa-twitter-square" title="Twitter Profile" @click="openLink(openUser.twitterLink)" />
        <i class="fab fa-linkedin" title="LinkedIn Profile" @click="openLink(openUser.linkedInLink)" />
      </p>
    </div>
  </div>
</template>

<style lang="scss">
  .OptionalMenu {
    height: 100vh;
    background: var(--bg);
    padding: 5px 0;
    box-shadow: -1px 0 1px rgba($color: #000000, $alpha: 0.1);
    overflow-y: hidden;
    position: relative;
    transition: 0s;
    z-index: 5;
    &.opend {
      flex: 0 0 20%;
      @include lg {
        flex: 0 0 67.5%;
      }
      @include md {
        flex: 0 0 61.5%;
      }
      @include sm {
        flex: 0 0 100%;
      }
    }
    &.closed {
      flex: 0;
      padding: 0;
    }
    & > i{
      position: absolute;
      top: 10px;
      right: 20px;
      color: var(--wit);
      font-size: 22px;
      cursor: pointer;
      text-shadow: none;
      &:hover{
        color: var(--bg);
      }
    }
    .menu-head {
      padding: 40px 0 20px;
      text-align: center;
      color: var(--wit);
      @include sm {
        padding: 20px 0 0;
      }
      h4 {
        margin: 0;
        font-weight: bold;
        color: var(--mc);
      }
      span {
        font-size: 13px;
      }
      img {
        width: 100px;
        height: 100px;
        margin-right: 10px;
        margin-bottom: 10px;
        border-radius: 50%;
        border: 2px solid #ccc;
      }
      button {
        padding: 7px 15px;
        border-radius: 5px;
        border: none;
        font-weight: bold;
        box-shadow: none;
        color: var(--mc);
        background: var(--bg);
        @include sm {
          padding: 5px 15px;
        }
        i {
          color: var(--mc);
          position: relative;
          top: 1px;
          font-size: 16px;
        }
        &:hover {
          transform: none;
          background: #e7e7e7;
          color: var(--mc);
          i {
            color: var(--mc);
          }
        }
      }
    }
    .menu-body {
      padding: 10px 15px;
      color: var(--wit);
      h5 {
        padding: 0px;
        margin: 25px 0;
        color: var(--mc);
        font-weight: bold;
        padding: 10px 20px;
        border-radius: 5px;
        background: rgba(0,0,0,0.07);
        font-size: 24px;
        display: flex;
        align-items: center;
        i {
          margin-right: 15px;
        }
        span {
          font-size: 16px;
        }
        @include sm {
          margin: 15px 0;
        }
      }
      p {
        margin: 0;
        padding: 8px 10px;
        border-radius: 5px;
        background: rgba(0,0,0,0.07);
        font-family: 'Open Sans', sans-serif;
        color: var(--mc);
        font-size: 14px;
        margin: 0 0 20px 0;
        &.socials {
          padding: 5px;
        }
        i {
          margin: 0 5px 0 0;
          font-size: 30px;
          cursor: pointer;
          border-radius: 50%;
          padding: 6px 8px;
          &:first-of-type {
            color: $facebook;
          }
          &:nth-of-type(2) {
            color: $twitter;
          }
          &:nth-of-type(3) {
            color: $linkedin;
          }
          &:hover {
            color: var(--wit);
          }
        }
        a {
          color: inherit;
        }
      }
    }
  }
</style>

<script>
import moment from 'moment'
/* eslint-disable */
export default {
  computed: {
    openUser () {
      return this.$store.state.OptionalMenuUser
    },
    cUser () {
      return this.$store.state.user
    },
    friend () {
      var returnValue = false
      this.openUser.friendsList.forEach(friend => {
        if(friend._id == this.cUser._id) returnValue = true
      })
      return returnValue
    },
    blocked () {
      var returnValue = false
      this.cUser.blockList.forEach(friend => {
        if(friend._id == this.openUser._id) returnValue = true
      })
      return returnValue
    }
  },
  methods: {
    close () {
      this.$store.commit('closeOpMenu')
    },
    async sendFriendRequest (e, id) {
      var element
      if (e.target.tagName == 'I') element = e.target.parentElement
      else element = e.target
      element.innerHTML = this.$store.state.loadingElement
      const res = await this.$axios.$post(`/api/users/friendRequest/${this.cUser._id}?id=${id}`)
      if (res.err) {
        Swal.fire({
          toast: true,
          icon: 'error',
          title: res.err,
        })
      } else {

        const senderContact = {
          _id: this.cUser._id,
          username: this.cUser.username,
          photo: this.cUser.photo,
        }

        this.$socket.emit('sendFriendRequest', { targetedContactID: this.openUser._id, senderContact })

        Swal.fire({
            toast: true,
            icon: 'success',
            title: `Friend Request Sent To ${this.openUser.username}`
        });
      }
      element.innerHTML = `<i class="fad fa-user-plus"></i> Add`
    },
    async block (e, id) {
      const { cUser, openUser, $store, $axios } = this;

      var element;
      if (e.target.tagName == 'I') element = e.target.parentElement
      else element = e.target

      element.innerHTML = this.$store.state.loadingElement;
      const res = await $axios.$post(`/api/users/block/${cUser._id}?id=${id}`);

      if (res.err) {
        Swal.fire({
          toast: true,
          icon: 'error',
          title: res.err,
        })
      } else {
        
        $store.commit('setUser', res.user);

        Swal.fire({
            toast: true,
            icon: 'success',
            title: `${openUser.username} has been added to your blocklist`
        });
      }
      element.innerHTML = '<i class="fad fa-user-lock"></i> Block'
    },
    async startChat (e, id) {
      var element
      if (e.target.tagName == 'I') element = e.target.parentElement
      else element = e.target

      element.innerHTML = this.$store.state.loadingElement
      const { cUser, openUser, $axios, $store, $socket } = this
      const res = await $axios.$post(`/api/chats/${cUser._id}?userTo=${id}`)

      if (res.err) {
        Swal.fire({
          toast: true,
          icon: 'error',
          title: res.err,
        })
      } else if (!res.found) {
        var chatObj = res.chat;

        chatObj.lastOneNotSeen = false;

        var openedChat = Object.assign({}, chatObj);

        const usersList = { me: {}, other: {} };

        chatObj.usersList.forEach((user) => {
          if (user._id === cUser._id) usersList.me = user
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

        if (document.querySelector(".main-sidebar-btns[title='Groups']")) {
          document.querySelectorAll('.main-sidebar-btns').forEach((btn) => btn.classList.remove('active'));
          document.querySelector(".main-sidebar-btns[title='Chats']").classList.add('active');
        }

        this.$forceUpdate();

        Swal.fire({
            toast: true,
            icon: 'success',
            title: `A new chat with ${openUser.username} has been created`
        });
      } else {
        var chat = $store.state.chats.find(Chat => Chat._id == res.chat._id);

        chat.lastOneNotSeen = false;

        $store.commit('openChat', chat);

        $store.commit('changeMenu', "Chats");

        document.querySelectorAll('.main-sidebar-btns').forEach((btn) => btn.classList.remove('active'));
        document.querySelector(".main-sidebar-btns[title='Chats']")?.classList.add('active');
      }
      element.innerHTML = '<i class="fad fa-comment-alt-lines mr-1"></i> Message';
    },
    openSettings () {
      this.$store.commit('openSettingModal')
    },
    openLink (link){
      window.open(link, '_blank')
    }
  },
  filters: {
    isURL (v) {
      var reg = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm
      return reg.test(v)
    },
    formatJoinedAt (v) {
      return moment(v).format("YYYY-MM-DD")
    }
  }
}
</script>
