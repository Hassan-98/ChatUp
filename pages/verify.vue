<template>
  <div class="verify-page">
    <div class="verify-box">
      <Icon />
      <form v-if="verifyData.token">
        <h4>Set New Password</h4>
        <span class="input">
          <i class="fad fa-unlock-alt" />
          <input v-model="password" type="password" placeholder="New Password">
        </span>
        <span class="input">
          <i class="fad fa-unlock-alt" />
          <input v-model="confirmPassword" type="password" placeholder="Confirm New Password">
        </span>
        <button @click.prevent="setNewPassword">
          Change Password
        </button>
      </form>
      <div v-else class="notValid">
        <i class="fas fa-times-circle" />
        <h3>Invalid Operation</h3>
        <hr>
        <p>Login instead ?</p>
        <nuxt-link to="login">
          Sign In!
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/reset.scss";
  .verify-page {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
    .verify-box {
      width: 35%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      background: #fff;
      box-shadow: 1px 1px 10px rgba($color: #000000, $alpha: 0.1);
      border-radius: 10px;
      padding: 1.5rem 1rem 2.5rem;
      margin: 0 auto;
      position: relative;
      @include xl {
        width: 50%;
      }
      @include md {
        width: 60%;
      }
      @include sm {
        padding: 3.5rem 1rem 1.5rem;
        width: 95%;
      }
      @include xs {
        padding: 2rem 1rem 1.5rem;
      }
    }

    form {
      width: 100%;
      background: #fff;
      h4 {
        padding-top: 10px;
        margin-bottom: 25px;
        text-transform: uppercase;
        position: relative;
        z-index: 1;
        font-family: 'Rock Salt', cursive;
        color: #aaa;
        @include sm {
          margin-bottom: 20px;
        }
      }
      span.input {
        display: flex;
        padding: 0 2.5rem;
        @include sm {
          padding: 0;
        }
        i {
          padding: 7px 10px;
          margin: 5px 0;
          background: #f2f2f2;
          border-radius: 0;
          border: 2px solid #f2f2f2;
          border-right: 0;
          font-size: 25px;
          color: #aaa;
          border-radius: 10px 0 0 10px;
        }
        input:not([type="checkbox"]) {
          padding: 7px 12px;
          font-size: 15px;
          display: block;
          margin: 5px 0;
          width: 100%;
          border-left: 0;
          border-radius: 0 10px 10px 0;
          border: 1px solid #f2f2f2;
          &:focus {
            border-color: #f2f2f2;
            & i {
              border-color: var(--mc2);
            }
          }
        }
      }
      span + a {
        float: right;
        margin: 15px 50px;
        padding: 5px 15px;
        @include sm {
          display: block;
          margin: 15px auto;
          width: 50%;
        }
      }
      button {
        margin: 20px 0 5px;
        padding: 10px 50px;
        border-radius: 5px;
        border: transparent;
        box-shadow: none;
        background: #aaa;
        font-size: 20px;
        &:hover {
          transform: none;
          background: var(--wit);
        }
        @include md {
          width: 80%;
          margin: 5px auto;
        }
        @include sm {
          width: 100%;
          margin: 5px 0;
        }
      }
    }
    .notValid {
      width: 100%;
      background: #fff;

      i {
        position: relative;
        z-index: 1;
        font-size: 70px;
        color: #7e0505;
        @include sm {
          margin-top: 15px;
          font-size: 50px;
        }
      }

      h3 {
        padding-top: 10px;
        margin-bottom: 35px;
        position: relative;
        z-index: 1;
        font-family: 'Rock Salt', cursive;
        color: #7e0505;
        @include sm {
          margin-bottom: 20px;
        }
      }

      a {
        font-size: 14px;
        text-decoration: none;
        padding: 7px 15px;
        color: #262626;
        border: 1px solid #ccc;
        margin: 5px;
        &:hover {
          background: #ccc;
        }
      }
    }
  }
</style>

<script>
/* eslint-disable */
import Icon from '~/components/Icon.vue'
export default {
  data(){
    return {
      password: "",
      confirmPassword: "",
      Toast: Swal.mixin({
              toast: true,
              position: 'bottom-center',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            }),
    }
  },
  computed: {
    verifyData(){
      return this.$store.state.verifyData
    }
  },
  components: {
    Icon
  },
  methods: {
    async setNewPassword(e){
      e.target.disabled = true;
      const { password, confirmPassword } = this;

      if (!password || !confirmPassword) {
        e.target.disabled = false;
        return this.Toast.fire({
          toast: true,
          icon: 'error',
          title: 'Did you missed some fields ?'
        })
      }

      if (password != confirmPassword) {
        e.target.disabled = false;
        return this.Toast.fire({
          toast: true,
          icon: 'error',
          title: `Passwords doesn't match`
        })
      }

      const res = await this.$axios.$post('/api/auth/verify-change', { token: this.verifyData.token, newPassword: password });

      if (res.err) {
        e.target.disabled = false;
        return this.Toast.fire({
          toast: true,
          icon: 'error',
          title: res.err
        })
      }
      
      this.Toast.fire({
        toast: true,
        icon: 'success',
        title: 'Password changed successfully!'
      });

      this.$router.push("/login");
    }
  }
}
</script>
