<template>
  <div class="login-page">
    <div class="login-box">
      <Icon />
      <form>
        <h3>Login</h3>
        <span class="input">
          <i class="fad fa-at" />
          <input v-model="email" type="text" placeholder="Email Address">
        </span>
        <span class="input">
          <i class="fad fa-unlock-alt" />
          <input v-model="password" type="password" placeholder="Password">
        </span>
        <button @click.prevent="login">
          Take Me In
        </button>
        <hr>
        <p>Login with your social media account.</p>
        <div class="social-login">
          <button @click.prevent="loginWithGoogle">
            <img src="/imgs/google-logo.svg" alt="google logo">
            Login with Google
          </button>
        </div>
        <hr>
        <p>Not a member yet?</p>
        <nuxt-link to="signup">
          Join Us Now!
        </nuxt-link>
        <nuxt-link to="/reset">
          Reset Password
        </nuxt-link>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .login-page {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
    background: url('/imgs/chatLogoWhite.png') 50% 30% no-repeat;
    background-size: 850px;
    @include sm {
      background-size: 750px;
    }
    .login-box {
      width: 35%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      background: #fff;
      box-shadow: 1px 1px 10px rgba($color: #000000, $alpha: 0.1);
      border-radius: 10px;
      padding: 1.5rem 1rem 2.5rem;
      margin: 0 auto 1rem;
      position: relative;
      @include xl {
        width: 50%;
      }
      @include md {
        width: 60%;
      }
      @include sm {
        padding: 2.6rem 1rem 1.5rem;
        width: 95%;
      }
      @include xs {
        padding: 2rem 1rem 1.5rem;
      }
    }
    form {
      width: 100%;
      h3 {
        padding-top: 10px;
        margin-bottom: 25px;
        text-transform: uppercase;
        position: relative;
        z-index: 1;
        font-family: 'Rock Salt', cursive;
        font-weight: bold;
        color: var(--mc);
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
          width: 50px;
          padding: 7px 10px;
          margin: 5px 0;
          background: var(--mc);
          border-radius: 0;
          border: 2px solid var(--mc);
          border-right: 0;
          font-size: 25px;
          color: #fff;
          border-radius: 10px 0 0 10px;
        }
        input {
          padding: 7px 12px;
          font-size: 15px;
          display: block;
          margin: 5px 0;
          width: 100%;
          border-left: 0;
          border-radius: 0 10px 10px 0;
          border: 1px solid var(--mc);
          &:focus {
            border-color: #f2f2f2;
            & i {
              border-color: var(--mc2);
            }
          }
        }
      }
      button {
        margin: 25px 0 5px;
        padding: 10px 50px;
        border-radius: 10px;
        border: transparent;
        box-shadow: none;
        background: var(--mc);
        font-size: 20px;
        font-family: "Rock Salt";
        font-weight: bold;
        &:hover {
          transform: none;
          background: #365472;
        }
        @include md {
          width: 80%;
          margin: 15px auto 5px;
          font-size: 18px;
        }
      }
      a {
        font-size: 14px;
        text-decoration: none;
        padding: 5px 15px;
        color: #262626;
        border: 1px solid #ccc;
        margin: 5px;
        border-radius: 5px;
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
          font-family: "Walsheim", serif;
          font-weight: normal;

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
import Icon from '../Icon.vue'
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
              showConfirmButton: false,
              timer: 5000
            }),
    }
  },
  methods: {
    async login (e) {
      e.target.innerHTML = this.$store.state.loadingElement;
      e.target.disabled = true;
      const { email, password } = this;

      if (email === '' || password === '') {
        e.target.innerHTML = `Take Me In`;
        e.target.disabled = false;
        return this.Toast.fire({
          icon: 'error',
          title: 'Did you entered a correct email and password ?'
        })
      }
      
      // Invalid Email Validation
      if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
        e.target.innerHTML = `Take Me In`;
        e.target.disabled = false;
        return this.Toast.fire({ icon: 'error', title: "Invalid email address" });
      }

      const {success: user, err} = await this.$axios.$post('/api/auth/login', { email, password });

      if (err) {
        e.target.innerHTML = `Take Me In`;
        e.target.disabled = false;
        return this.Toast.fire({ icon: 'error', title: err })
      }

      const {chats} = await this.$axios.$get(`/api/chats/${user._id}`);

      await this.$axios.$patch(`/api/users/${user._id}`, { activeNow: true });

      this.$store.commit('setChats', chats);
      this.$store.commit('setUser', user);

      this.Toast.fire({
        toast: true,
        icon: 'success',
        title: 'You are now in!'
      });

      this.$router.push("/");
    },
    async loginWithGoogle (e) {
      e.target.disabled = true;

      try {
        const googleUser = await this.$gAuth.signIn();
        console.log(googleUser);

        const profile = googleUser.getBasicProfile()


        const userProfile = {
          id: profile.getId(),
          email: profile.getEmail(),
          photo: profile.getImageUrl(),
          username: profile.getName()
        }

        const {success: user, err} = await this.$axios.$post('/api/auth/loginWithGoogle', { userProfile });

        if (err) {
          e.target.disabled = false;
          return this.Toast.fire({ icon: 'error', title: err })
        }

        const {chats} = await this.$axios.$get(`/api/chats/${user._id}`);

        await this.$axios.$patch(`/api/users/${user._id}`, { activeNow: true });

        this.$store.commit('setChats', chats);
        this.$store.commit('setUser', user);

        this.Toast.fire({
            toast: true,
            icon: 'success',
            title: 'You are now in!'
        });

        this.$router.push("/");
      } catch (err) {
        console.log(err);
          e.target.disabled = false;
      }
    }
  }
}
</script>
