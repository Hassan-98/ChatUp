<template>
  <div class="reset-page">
    <Icon />
    <form>
      <h4>Reset Password</h4>
      <span class="input">
        <i class="fas fa-at" />
        <input ref="email" type="text" placeholder="Email Address or Phone Number">
      </span>
      <button @click="reset">
        Recover Password
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
</template>

<style lang="scss" scoped>
  .reset-page {
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
      box-shadow: 1px 1px 10px rgba($color: #000000, $alpha: 0.2);
      border-radius: 5px;
      padding: 3rem 2rem 2.5rem;
      margin: 0 auto 1rem;
      font-family: 'Roboto', sans-serif;
      @include sm {
        margin-top: -35px;
      }
      h4 {
        padding-top: 10px;
        margin-bottom: 25px;
        position: relative;
        z-index: 1;
        font-family: 'Rock Salt', cursive;
        color: #aaa;
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
          background: #f2f2f2;
          border-radius: 0;
          border: 2px solid #f2f2f2;
          border-right: 0;
          font-size: 25px;
          color: #aaa;
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
          border: 1px solid #f2f2f2;
          &:focus {
            border-color: #f2f2f2;
            & i {
              border-color: var(--mc2);
            }
          }
        }
      }
      button {
        display: block;
        margin: 10px auto 15px;
        padding: 10px 50px;
        border-radius: 5px;
        border: transparent;
        box-shadow: none;
        background: #aaa;
        font-size: 18px;
        &:hover {
          transform: none;
          background: var(--wit);
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
  components: {
    Icon
  },
  methods: {
    async reset(e) {
      e.preventDefault();
      var email = this.$refs.email.value;

      if (!email) return Swal.fire({
        toast: true,
        icon: 'error',
        title: 'You have to type your email address'
      });

      if (!email.match(/^\S+@\S+\.\S+$/)) return Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Enter a valid email address'
      });

      const res = await this.$axios.$post("/api/auth/reset", {email});

      if (res.err) return Swal.fire({
        toast: true,
        icon: 'error',
        title: res.err
      });

      Swal.fire({
          toast: true,
          icon: 'success',
          title: 'Password reset mail sent to your email address'
      });

    }
  }
}
</script>
