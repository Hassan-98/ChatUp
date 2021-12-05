<template>
  <div class="login-page">
    <Icon />
    <form>
      <h3>Login</h3>
      <span class="input">
        <i class="fas fa-at" />
        <input v-model="email" type="text" placeholder="Email Address">
      </span>
      <span class="input">
        <i class="fas fa-unlock-alt" />
        <input v-model="password" type="password" placeholder="Password">
      </span>
      <span class="checkBox">
        <input id="rememberme" type="checkbox">
        <label for="rememberme">Remember Me</label>
      </span>
      <nuxt-link to="/reset">
        Reset Password
      </nuxt-link>
      <button @click.prevent="login">
        Take Me In
      </button>
      <hr>
      <p>Login with your social media account.</p>
      <div class="social-login">
        <button @click="loginWithGoogle">
          <img src="/imgs/google-logo.svg" alt="google logo">
          Login with Google
        </button>
      </div>
      <div class="g-signin2" data-onsuccess="onSignIn" />
      <hr>
      <p>Not a member yet?</p>
      <nuxt-link to="signup">
        Join Us Now!
      </nuxt-link>
    </form>
  </div>
</template>

<style lang="scss" scoped>
  .login-page {
    width: 45%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    @include xl {
      width: 60%;
    }
    @include md {
      width: 80%;
    }
    @include sm {
      width: 95%;
    }
    form {
      width: 100%;
      background: #fff;
      box-shadow: 1px 1px 10px rgba($color: #000000, $alpha: 0.1);
      border-radius: 10px;
      padding: 3rem 2rem 2.5rem;
      margin: 0 auto 1rem;
      @include sm {
        padding: 3rem 1rem 1.5rem;
        margin-top: -35px;
      }
      h3 {
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
      span.checkBox {
        float: left;
        margin: 15px 50px;
        padding: 5px 0px;
        label {
          position: relative;
          top: -2px;
          font-weight: bold;
        }
        input {
          width: 15px;
          height: 15px;
          margin: 5px;
        }
        @include sm {
          display: flex;
          align-items: flex-end;
          margin: 15px 0 15px 0px;
          width: 50%;
          padding-left: 5px;
          label {
            margin: 0;
            font-size: 14px;
          }
          input {
            margin: 0px;
            margin-right: 5px;
          }
        }
        input {
          border-radius: 50%;
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
        margin: 60px 0 5px;
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
      .social-login {
        button {
          padding: 3px 20px 2px 15px;
          color: #000;
          border: 1px solid #ccc;
          border-radius: 25px;
          margin: 0 auto;
          background: #fff;
          font-size: 16px;
          display: flex;
          justify-content: center;
          align-items: center;

          img {
            width: 35px;
            height: 35px;
            margin-right: 5px;
          }

          &:hover {
            background: #f1f1f1;
          }
        }
      }
      .icons {
        i {
          color: var(--mc);
          font-size: 25px;
          margin: 0 5px;
          cursor: pointer;
          border-radius: 50%;
          padding: 4px 5px;
          border: 2px solid transparent;
          &:first-of-type {
            color: $facebook;
            color: #fff;
            background: $facebook;
            border: 2px solid $facebook;
          }
          &:nth-of-type(2) {
            color: $googleplus;
            background: $googleplus;
            border: 2px solid $googleplus;
            color: #fff;
          }
        }
      }
    }
  }
</style>

<script>
/* eslint-disable */
import Icon from '~/components/Icon.vue'
export default {
  components: {
    Icon
  },
  data () {
    return {
      email: '',
      password: '',
      Toast: Swal.mixin({
              toast: true,
              position: 'bottom-center',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            }),
    }
  },
  methods: {
    async login (e) {
      e.target.innerHTML = this.$store.state.loadingElement
      e.target.disabled = true;
      const { email, password } = this
      if (email === '' || password === '') {
        e.target.innerHTML = `Take Me In`
        return this.Toast.fire({
          toast: true,
          icon: 'error',
          title: 'Did you entered a correct email and password ?'
        })
      } else {
        const res = await this.$axios.$post('/api/auth/login', { email, password })
        if (res.err) {
          e.target.innerHTML = `Take Me In`;
          e.target.disabled = false;
          this.Toast.fire({
            toast: true,
            icon: 'error',
            title: res.err
          })
        } else {
          const {chats} = await this.$axios.$get(`/api/chats/${res.success._id}`);

          await this.$axios.$patch(`/api/users/${res.success._id}`, { activeNow: true });

          this.$store.commit('setChats', chats);
          this.$store.commit('setUser', res.success);

          this.Toast.fire({
              toast: true,
              icon: 'success',
              title: 'You are now in!'
          });

          this.$router.push("/");
        }
      }
    },
    async loginWithGoogle (e) {
      e.preventDefault();
      e.target.disabled = true;

      const googleUser = await this.$gAuth.signIn();

      const profile = googleUser.getBasicProfile()

      const userProfile = {
        id: profile.getId(),
        email: profile.getEmail(),
        photo: profile.getImageUrl(),
        username: profile.getName()
      }

      const res = await this.$axios.$post('/api/auth/loginWithGoogle', { userProfile });

      if (res.err) {
        e.target.disabled = false;
        this.Toast.fire({
          toast: true,
          icon: 'error',
          title: res.err
        })
      } else {
        const {chats} = await this.$axios.$get(`/api/chats/${res.success._id}`);

        await this.$axios.$patch(`/api/users/${res.success._id}`, { activeNow: true });

        this.$store.commit('setChats', chats);
        this.$store.commit('setUser', res.success);

        this.Toast.fire({
            toast: true,
            icon: 'success',
            title: 'You are now in!'
        });

        this.$router.push("/");
      }
      
    }
  }
}
</script>
