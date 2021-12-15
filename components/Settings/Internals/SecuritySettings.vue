<template>
  <div class="open-setting">
    <h4>Security Settings</h4>
    <div v-if="isGoogleUser">
      <p>
        No security settings for users who logged in via Google
      </p>
    </div>
    <div v-else>
      <label>Current Password</label>
      <span class="input">
        <i class="fas fa-unlock-alt" />
        <input v-model="oldPass" type="password" placeholder="Current Account Password">
      </span>
      <label>New Password</label>
      <span class="input">
        <i class="fas fa-unlock-alt" />
        <input v-model="newPass" type="password" placeholder="New Password">
      </span>
      <button @click="edit">
        Edit
      </button>
    </div>
    <hr>
    <button class="del">
      Stop Account Temporary!
    </button>
  </div>
</template>

<style lang="scss" scoped>
  .open-setting {
    padding: 0 5px;
    h4 {
      margin: 0 0 8px 0;
      padding: 0 0 8px 0;
      border-bottom: 1px solid #ccc;
      font-weight: bold;
      color: var(--mc);
    }
    p {
      text-align: center;
      padding: 50px 0;
      background: var(--bg);
      color: var(--mc);
      border-radius: 10px;
      font-size: 20px;
    }
    label {
      font-weight: bold;
      color: #aaa;
      padding: 0 7rem;
      margin-top: 20px;
      @include md {
        padding: 0 3rem;
      }
      @include sm {
        padding: 0rem;
      }
    }
    span.input {
      display: flex;
      padding: 0 7rem;
      @include md {
        padding: 0 3rem;
      }
      @include sm {
        padding: 0rem;
      }
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
      input {
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
    button {
      display: block;
      margin: 20px auto;
      border-radius: 10px;
      background: var(--borders);
      font-weight: bold;
      border: none;
      box-shadow: none;
      padding: 10px 30px;
      font-size: 18px;
      color: var(--mc);
      &.del {
        background: rgb(186, 3, 3);
        border-color: rgb(186, 3, 3);
        color: #fff;
      }
    }
  }
</style>

<script>
/* eslint-disable */
export default {
  data () {
    return {
      newPass: '',
      oldPass: ''
    }
  },
  computed: {
    currentUser () {
      return this.$store.state.user || {}
    },
    isGoogleUser () {
      return this.$store.state.user.google_user_id || false
    }
  },
  methods: {
    async edit (e) {
      e.target.innerHTML = this.$store.state.loadingElement
      const { newPass, oldPass, currentUser, $store, $axios } = this

      const res = await $axios.$patch(`/api/users/pass/${currentUser._id}`, { newPass, oldPass })

      if(res.err) {
        e.target.innerHTML = 'Edit'
        return Swal.fire({
          toast: true,
          icon: 'error',
          title: res.err
        })
      } else {
        e.target.innerHTML = 'Edit';
        $store.commit('setUser', res.success);

        Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Password changed successfully'
        })
      }
    }
  }
}
</script>
