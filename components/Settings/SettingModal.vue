<template>
  <div class="chat-modal" @click.stop="closeModal">
    <div class="chat-modal-body">
      <div class="settings">
        <section class="TOP">
          <div class="settings-nav">
            <button @click="closeMenu">
              <i v-tooltip="'Go Back'" class="fa-thin fa-arrow-left-long mr-2" style="cursor: pointer" /> Back
            </button>
            <button class="active" @click="open($event, 'GeneralSettings')">
              <i class="fal fa-user-circle" />
              Account
            </button>
            <button @click="open($event, 'SecuritySettings')">
              <i class="fal fa-shield-check" />
              Security
            </button>
            <button class="friendsListBtn" @click="open($event, 'FriendsList')">
              <i class="fal fa-user-friends" />
              Friends
            </button>
            <button class="requestsListBtn" @click="open($event, 'FriendsRequests')">
              <i class="fal fa-bells" />
              <span>Friend</span> Requests
            </button>
            <button @click="open($event, 'BlockList')">
              <i class="fal fa-ban" />
              Block List
            </button>
          </div>
        </section>
        <GeneralSettings v-if="setting == 'GeneralSettings'" />
        <SecuritySettings v-else-if="setting == 'SecuritySettings'" />
        <FriendsRequests v-else-if="setting == 'FriendsRequests'" />
        <FriendsList v-else-if="setting == 'FriendsList'" />
        <BlockList v-else-if="setting == 'BlockList'" />
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
    z-index: 9999;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    .chat-modal-body {
      background: rgba($color: #000, $alpha: 0.5);
      width: 100%;
      height: 100%;
      overflow: hidden;
      box-shadow: 1px 1px 10px rgba($color: #000, $alpha: 0.2);
      display: flex;
      .settings {
        width: 90%;
        height: 90%;
        overflow-y: scroll;
        background: var(--white);
        text-align: left;
        padding: 15px 25px 15px;
        margin: auto;
        position: relative;
        border-radius: 8px;
        @include sm {
          padding: 15px 10px 15px;
          width: 100%;
          height: 100%;
          border-radius: 0px;
        }
        .TOP {
            position: fixed;
            height: 90%;
            width: 250px;
            background-color: #fff;
            left: 2.5%;
            top: 5%;
            padding: 0;
            box-shadow: 0 3px 5px rgba(0, 0, 0, 0.05);
            z-index: -1;
            border-radius: 8px 8px 0 0;
            overflow: hidden;
            opacity: 0;
            transition: all 0.2s ease-in;
            @include sm {
              width: 100%;
              height: 100%;
              top: 0;
              border-radius: 0;
              padding: 5px 25px;
            }
            &.open {
              left: 5%;
              opacity: 1;
              z-index: 1;
              @include sm {
                left: 0;
              }
            }
            .settings-nav {
              display: flex;
              flex-wrap: wrap;
              justify-content: start;
              width: 100%;
              button {
                padding: 15px 25px;
                text-align: left;
                font-size: 17px;
                border-radius: 0;
                margin: 0;
                flex: 0 0 100%;
                color: var(--mc);
                border: none;
                background: #fff;
                box-shadow: none;
                border: 1px solid transparent;
                border-left: 1px solid #f6f6f6;
                border-right: 0!important;
                border-top: 0!important;
                &:first-of-type {
                  border-left: 0!important;
                }
                &:last-of-type {
                  border-right: 0!important;
                }
                @include sm {
                  border-left: 0!important;
                  border-radius: 10px;
                  span {
                    display: none;
                  }
                }
                &:hover, &.active {
                  &:not(:first-of-type) {
                    border: 1px solid #f6f6f6;
                    transform: none;
                    background: var(--bg);
                    color: var(--mc);
                    box-shadow: inset 0 0 5px rgba($color: #000, $alpha: 0.05);
                  }
                  &:first-of-type {
                    transform: none;
                    i {
                      position: relative;
                      right: 5px;
                    }
                  }
                }
                i {
                  margin-right: 5px;
                  transition: all 0.3s ease;
                }
              }
            }
            & > i{
              position: absolute;
              right: 10px;
              top: 10px;
              font-size: 28px;
              cursor: pointer;
              text-shadow: none;
              color: var(--mc);
              @include sm {
                right: 5px;
                top: 5px;
                font-size: 20px;
              }
            }
        }
      }
    }
  }
</style>

<script>
/* eslint-disable */
import GeneralSettings from './Internals/GeneralSettings.vue'
import SecuritySettings from './Internals/SecuritySettings.vue'
import FriendsRequests from './Internals/FriendsRequests.vue'
import FriendsList from './Internals/FriendsList.vue'
import BlockList from './Internals/BlockList.vue'
export default {
  components: {
    GeneralSettings,
    SecuritySettings,
    FriendsRequests,
    FriendsList,
    BlockList
  },
  computed: {
    setting () {
      return this.$store.state.openSetting
    }
  },
  methods: {
    open (e, type) {
      Object.values(e.target.parentElement.children).forEach((child) => {
        child.classList.remove('active')
      })
      e.target.classList.add('active')
      this.$store.state.openSetting = type;
      document.querySelector(".TOP").classList.remove("open")
    },
    closeModal (e) {
      if (e.target.classList.contains('chat-modal') || (e.target.tagName === 'I' && e.target.classList.contains('close'))) { this.$store.commit('closeModal') }
    },
    closeMenu () {
      document.querySelector(".TOP").classList.remove("open")
    }
  }
}
</script>
