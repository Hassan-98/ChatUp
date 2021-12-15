<template>
  <div class="sginup-page">
    <div class="signup-box">
      <Icon />
      <form>
        <h4>Join Us!</h4>
        <label>Full Name</label>
        <span class="input">
          <i class="fad fa-user-alt" />
          <input v-model="username" type="text" placeholder="Full Name">
        </span>
        <label>Email Address</label>
        <span class="input">
          <i class="fad fa-at" />
          <input v-model="email" type="text" placeholder="Email Address">
        </span>
        <label>Password</label>
        <span class="input">
          <i class="fad fa-unlock-alt" />
          <input v-model="password" type="password" placeholder="Password">
        </span>
        <label>Confirm Password</label>
        <span class="input">
          <i class="fad fa-unlock-alt" />
          <input v-model="confirmPassword" type="password" placeholder="Confirm Password">
        </span>
        <button @click.prevent="signup">
          Join Us!
        </button>
        <hr>
        <p>Already a member?</p>
        <nuxt-link to="login">
          Sign In!
        </nuxt-link>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .sginup-page {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
    background: url('/imgs/chatLogoWhite.png') 50% 30% no-repeat;
    background-size: 850px;
    @include sm {
      background-size: 800px;
    }
    .signup-box {
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
        padding: 2rem 1rem 1.5rem;
        width: 95%;
        .icon {
          top: -35px;
          left: 65px;
        }
      }
      @include xs {
        .icon {
          top: -25px;
          left: 60px;
        }
      }
    }
    form {
      width: 100%;
      background: #fff;
      h4 {
        padding-top: 0px;
        margin-top: 10px;
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
          padding: 0rem;
        }
        i {
          width: 50px;
          padding: 7px 10px;
          margin: 5px 0;
          background: var(--mc);
          border-radius: 0;
          border: 2px solid var(--mc);
          border-right: 0;
          font-size: 24px;
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
      label {
        font-weight: bold;
        color: var(--mc);
        margin: 15px 0 0 0;
        display: block;
        text-align: left;
        padding: 0 2.8rem;
        @include sm {
          margin: 5px 0 0 0;
          padding: 0 0.5rem;
        }
      }
      button {
        margin: 20px 0 5px;
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
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      Toast: Swal.mixin({
              toast: true,
              showConfirmButton: false,
              timer: 5000
            }),
    }
  },
  methods: {
    async signup (e) {
      e.target.disabled = true;
      e.target.innerHTML = this.$store.state.loadingElement;

      const { username, email, password, confirmPassword } = this;

      // Empty Fields Validation
      if (username === '' || email === '' || password === '') {
        e.target.innerHTML = `Join Us!`;
        e.target.disabled = false;
        return this.Toast.fire({ icon: 'error', title: 'Oops! did you missed some fields ?' });
      }

      // Invalid Email Validation
      if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
        e.target.innerHTML = `Join Us!`;
        e.target.disabled = false;
        return this.Toast.fire({ icon: 'error', title: "Invalid email address" });
      }

      // Password Validation
      if (password !== confirmPassword) {
        e.target.innerHTML = `Join Us!`;
        e.target.disabled = false;
        return this.Toast.fire({ icon: 'error', title: "Password doesn't match" });
      }

      const {err} = await this.$axios.$post('/api/auth/signup', {username, email, password});

      if(err){
        e.target.innerHTML = `Join Us!`;
        e.target.disabled = false;
        return this.Toast.fire({ icon: 'error', title: err })
      }
      
      this.$router.push("/login");

      this.Toast.fire({
        icon: 'success',
        title: 'You are now one of us!'
      });
        
      
    }
  }
}
</script>
