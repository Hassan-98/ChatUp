<template>
  <div class="open-setting">
    <h4>
      <i v-tooltip="'Go Back'" class="fa-thin fa-arrow-left-long mr-2" style="cursor: pointer" @click="closeModal" />
      Block List
      <i v-tooltip="'Menu'" class="fa-thin fa-bars" @click="openMenu" style="font-size: 24px;float: right;cursor: pointer;"></i>
    </h4>
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
          margin: 0px 10px 8px 0;
          padding: 8px 0 8px 10px;
        }
        img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-right: 7px;
          @include sm {
            width: 40px;
            height: 40px;
          }
        }
        h4 {
          font-weight: bold;
          color: var(--mc);
          cursor: pointer;
          @include sm {
            font-size: 15px;
          }
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
  data() {
    return {
      Toast: Swal.mixin({
        toast: true,
        showConfirmButton: false,
        timer: 5000
      }),
    }
  },
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
    closeModal (e) {
      this.$store.commit('closeModal')
    },
    openMenu() {
      document.querySelector(".TOP").classList.add("open")
    },
    async unBlock (e, id, username) {
      e.target.innerHTML = this.$store.state.loadingElement;
      e.target.classList.remove("fal");
      e.target.classList.remove("fa-user-slash");

      const { currentUser, $axios, $store } = this;

      const {err, user} = await $axios.$post(`/api/users/unblock/${currentUser._id}?id=${id}`);

      if (err) return this.Toast.fire({ icon: 'error', title: err });

      $store.commit('setUser', user);

      this.Toast.fire({ icon: 'success', title: `${username} has been removed from blocklist` });
      
      e.target.innerHTML = "";
      e.target.classList.add("fal");
      e.target.classList.add("fa-user-slash");
    }
  }
}
</script>
