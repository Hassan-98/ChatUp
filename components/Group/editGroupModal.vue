<template>
  <div class="chat-modal" @click.stop="closeModal">
    <div class="chat-modal-body">
      <div class="settings">
        <span>Group Settings</span>
        <i v-tooltip="'close'" class="fas fa-times-circle close" @click="closeModal" />
        <hr style="margin-bottom: 0">
        <div class="settings-nav">
          <button v-if="currentUser.isAdmin" class="active" @click="open($event, 'General')">
            General
          </button>
          <button :style="!currentUser.isAdmin && `flex: 0 0 100%`" @click="open($event, 'Members')">
            Members
          </button>
          <button v-if="currentUser.isAdmin" @click="open($event, 'Admins')">
            Admins
          </button>
          <button v-if="currentUser.isAdmin" @click="open($event, 'NewMembers')">
            Add Members
          </button>
        </div>
        <hr style="margin-top: 0">
        <generalGroupSettings v-if="setting == 'General'" />
        <MembersGroupSettings v-else-if="setting == 'Members'" />
        <AdminsGroupSettings v-else-if="setting == 'Admins'" />
        <AddNewMembers v-else-if="setting == 'NewMembers'" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .chat-modal {
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
    .chat-modal-body {
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
      .settings {
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        background: var(--white);
        text-align: left;
        padding: 15px;
        position: relative;
        .settings-nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: start;
          width: 100%;
          button {
            padding: 10px 0;
            font-size: 17px;
            font-weight: bold;
            border-radius: 0;
            margin: 0;
            flex: 0 0 25%;
            color: var(--mc);
            border: none;
            background: #fff;
            box-shadow: none;
            border: 1px solid #f6f6f6;
            @include sm {
              flex: 0 0 50%;
              &:nth-of-type(4), &:nth-of-type(5) {
                flex: 0 0 50%;
              }
            }
            &:hover, &.active {
              border: 1px solid #f6f6f6;
              transform: none;
              background: var(--bg);
              color: var(--mc);
            }
            i {
              position: relative;
              top: 2px;
            }
          }
        }
        span {
          font-size: 24px;
          color: var(--mc);
        }
        & > i{
          float: right;
          color: var(--wit);
          font-size: 22px;
          cursor: pointer;
          text-shadow: none;
          &:hover{
            color: var(--mc);
          }
          &::after {
            content: '';
            clear: both;
          }
        }
      }
    }
  }
</style>

<script>
/* eslint-disable */
import generalGroupSettings from './Internals/generalGroupSettings.vue'
import MembersGroupSettings from './Internals/MembersGroupSettings.vue'
import AdminsGroupSettings from './Internals/AdminsGroupSettings.vue'
import AddNewMembers from './Internals/AddNewMembersGroup.vue'
export default {
  components: {
    generalGroupSettings,
    MembersGroupSettings,
    AdminsGroupSettings,
    AddNewMembers
  },
  data () {
    return {
      setting: 'General'
    }
  },
  computed: {
    currentChat () {
      return this.$store.state.openedChat
    },
    currentUser () {
      var currentUser = this.$store.state.user;
      this.$store.state.openedChat.groupAdmins.forEach(admin => {
          if (currentUser._id == admin) {
            currentUser.isAdmin = true
          }
      })
      return currentUser || false
    }
  },
  mounted () {
    var found = false
    this.currentChat.groupAdmins.forEach(admin => {
        if (this.currentUser._id == admin) {
          found = true
        }
    })
    if (!found) this.setting = 'Members'
  },
  methods: {
    open (e, type) {
      Object.values(e.target.parentElement.children).forEach((child) => {
        child.classList.remove('active')
      })
      e.target.classList.add('active')
      this.setting = type
    },
    closeModal (e) {
      if (e.target.classList.contains('chat-modal') || (e.target.tagName === 'I' && e.target.classList.contains('close'))) { this.$store.commit('closeModal') }
    }
  }
}
</script>
