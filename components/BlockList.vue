<template>
  <div class="open-setting">
    <h4>Block List</h4>
    <div v-if="currentUser.blockList.length == 0" class="no-blocks">
      <h4>No Body Blocked</h4>
    </div>
    <div v-else class="blockList">
      <div v-for="blocked in currentUser.blockList" :key="blocked._id" class="block">
        <img :src="blocked.photo" alt="">
        <h4 @click="openProfile(blocked)">
          {{ blocked.username }}
        </h4>
        <i v-tooltip="'Unblock friend'" class="fal fa-user-slash" @click="unBlock($event, blocked._id, blocked.username)" />
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
      font-weight: bold;
    }
    .no-blocks {
      width: 100%;
      margin: 15px auto;
      padding: 100px 0;
      color: var(--mc);
      text-align: center;
      background: rgba($color: #000000, $alpha: 0.05);
      border-radius: 10px;
    }
    .blockList {
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
      .block {
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
          right: 15px;
          &:hover {
            color: var(--text);
          }
        }
      }
    }
  }
</style>

<script>
/* eslint-disable */
export default {
  computed: {
    currentUser () {
      return this.$store.state.user || false
    }
  },
  methods: {
    async openProfile (userObj) {
      var {user} = await this.$axios.$get(`/api/users/user?userId=${userObj._id}`)
      this.$store.commit('openOpMenu', user);
      this.$store.commit('closeModal');
    },
    async unBlock (e, id, username) {
      const { currentUser, $axios, $store } = this
      const res = await $axios.$post(`/api/users/unblock/${currentUser._id}?id=${id}`)
      if (res.err) {
        Swal.fire({
          toast: true,
          icon: 'error',
          title: res.err
        })
      } else {
        $store.commit('setUser', res.user);

        Swal.fire({
            toast: true,
            icon: 'success',
            title: `${username} has been removed from blocklist`
        });
      }
    },
  }
}
</script>
