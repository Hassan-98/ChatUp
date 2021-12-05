<template>
  <div class="chat-modal" @click.stop="closeModal">
    <div class="chat-modal-body">
      <div class="settings">
        <section class="TOP">
          <i v-tooltip="'close'" class="fas fa-times-circle close" @click="closeModal" />
          <div class="settings-nav">
            <button class="active" @click="open($event, 'GeneralSettings')">
              Account
            </button>
            <button @click="open($event, 'SecuritySettings')">
              Security
            </button>
            <button class="friendsListBtn" @click="open($event, 'FriendsList')">
              Friends
            </button>
            <button class="requestsListBtn" @click="open($event, 'FriendsRequests')">
              Friend Requests
            </button>
            <button @click="open($event, 'BlockList')">
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
        padding: 60px 25px 15px;
        margin: auto;
        position: relative;
        border-radius: 8px;
        @include sm {
          padding: 70px 25px 15px;
        }
        .TOP {
            position: fixed;
            width: 90%;
            background-color: #fff;
            left: 5%;
            top: 5%;
            padding: 0;
            box-shadow: 0 3px 5px rgba($color: #000, $alpha: 0.05);
            z-index: 1;
            border-radius: 8px 8px 0 0;
            overflow: hidden;
            .settings-nav {
              display: flex;
              flex-wrap: wrap;
              justify-content: start;
              width: 100%;
              button {
                padding: 15px 0;
                font-size: 17px;
                font-weight: bold;
                border-radius: 0;
                margin: 0;
                flex: 0 0 20%;
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
                  flex: 0 0 33.333%;
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
import GeneralSettings from '~/components/GeneralSettings.vue'
import SecuritySettings from '~/components/SecuritySettings.vue'
import FriendsRequests from '~/components/FriendsRequests.vue'
import FriendsList from '~/components/FriendsList.vue'
import BlockList from '~/components/BlockList.vue'
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
      this.$store.state.openSetting = type
    },
    closeModal (e) {
      if (e.target.classList.contains('chat-modal') || (e.target.tagName === 'I' && e.target.classList.contains('close'))) { this.$store.commit('closeModal') }
    }
  }
}
</script>
