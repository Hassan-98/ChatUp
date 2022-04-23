<template>
  <div class="reset-page">
    <div class="reset-box">
      <Icon />
      <form>
        <h4>Reset Password</h4>
        <span class="input">
          <i class="fad fa-at" />
          <input ref="email" type="text" placeholder="Email Address">
        </span>
        <button @click="reset">
          Reset
        </button>
        <hr>
        <p>Take a different action.</p>
        <nuxt-link to="signup">
          Join Us!
        </nuxt-link>
        <nuxt-link to="login">
          Sign In!
        </nuxt-link>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .reset-page {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
    background: url('/imgs/chatLogoWhite.png') 50% 30% no-repeat;
    background-size: 750px;
    @include sm {
      background-size: 700px;
    }
    .reset-box {
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
      background: #fff;
      h4 {
        padding-top: 10px;
        margin-bottom: 25px;
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
        padding: 0 5rem;
        @include sm {
          padding: 0rem;
        }
        i {
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
      button {
        margin: 20px 0 5px;
        padding: 10px 50px;
        border-radius: 10px;
        border: transparent;
        box-shadow: none;
        background: var(--mc);
        font-size: 20px;
        font-family: "Rock Salt";
        letter-spacing: 2px;
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
  data() {
    return {
      Toast: Swal.mixin({
              toast: true,
              showConfirmButton: false,
              timer: 5000
            })
    }
  },
  components: {
    Icon
  },
  methods: {
    async reset(e) {
      e.preventDefault();
      e.target.innerHTML = this.$store.state.loadingElement;
      e.target.disabled = true;

      var email = this.$refs.email.value;

      if (!email) {
        e.target.innerHTML = "Reset";
        e.target.disabled = false;
        return this.Toast.fire({ icon: 'error', title: 'Type your email address to reset password' });
      }

      if (!email.match(/^\S+@\S+\.\S+$/)) {
        e.target.innerHTML = "Reset";
        e.target.disabled = false;
        return this.Toast.fire({ icon: 'error', title: 'Enter a valid email address' });
      }

      const { err } = await this.$axios.$post("/api/auth/reset", {email});

      console.log(err);

      if (err) {
        e.target.innerHTML = "Reset";
        e.target.disabled = false;
        return this.Toast.fire({ icon: 'error', title: err.message });
      }

      e.target.innerHTML = "Reset";
      e.target.disabled = false;
      this.Toast.fire({ icon: 'success', title: 'Password reset email sent to your email address' });

    }
  }
}
</script>
