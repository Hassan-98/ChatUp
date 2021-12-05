<template>
  <div class="sginup-page">
    <Icon />
    <form>
      <h4>Join Us!</h4>
      <label>Full Name</label>
      <span class="input">
        <i class="fas fa-user-alt" />
        <input v-model="username" type="text" placeholder="Full Name">
      </span>
      <label>Email Address</label>
      <span class="input">
        <i class="fas fa-at" />
        <input v-model="email" type="text" placeholder="Email Address">
      </span>
      <label>Password</label>
      <span class="input">
        <i class="fas fa-unlock-alt" />
        <input v-model="password" type="password" placeholder="Password">
      </span>
      <label>Avatar</label>
      <span class="input input-file">
        <input type="file" class="avatarImg">
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
</template>

<style lang="scss" scoped>
  .sginup-page {
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
      position: relative;
      top: -50px;
    }
    form {
      width: 100%;
      background: #fff;
      box-shadow: 1px 1px 10px rgba($color: #000000, $alpha: 0.1);
      border-radius: 10px;
      padding: 3rem 2rem 2.5rem;
      margin: 0 auto 1rem;
      @include sm {
        margin-top: -35px;
      }
      h4 {
        padding-top: 10px;
        margin-bottom: 25px;
        text-transform: uppercase;
        position: relative;
        z-index: 1;
        font-family: 'Rock Salt', cursive;
        color: #aaa;
      }
      span.input {
        display: flex;
        padding: 0 2.5rem;
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
        &.input-file {
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          input {
            border-radius: 10px;
          }
        }
      }
      label {
        font-weight: bold;
        color: var(--wit);
        margin: 15px 0 0 0;
        display: block;
        text-align: left;
        padding: 0 2.5rem;
        @include sm {
          padding: 0 0.5rem;
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
        @include sm {
          width: 100%;
          margin: 20px 0;
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
  data () {
    return {
      username: '',
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
    async signup (e) {
      e.target.disabled = true;
      e.target.innerHTML = this.$store.state.loadingElement
      const { username, email, password } = this
      const img = document.querySelector('.avatarImg').files[0]
      if (username === '' || email === '' || password === '' || img == false) {
        e.target.innerHTML = `Join Us!`;
        e.target.disabled = false;
        return this.Toast.fire({
          toast: true,
          icon: 'error',
          title: 'Oops! did you missed some fields ?'
        })
      } else {
        var formdata = new FormData()
        formdata.append('avatar', img)
        formdata.set('username', username)
        formdata.set('email', email)
        formdata.set('password', password)
        const res = await this.$axios.$post('/api/auth/signup', formdata)
        if(res.err){
          e.target.innerHTML = `Join Us!`;
          e.target.disabled = false;
          this.Toast.fire({
            toast: true,
            icon: 'error',
            title: res.err
          })
        } else {
          this.Toast.fire({
            toast: true,
            icon: 'success',
            title: 'You are now one of us!'
          }).then(() => {
            this.$router.push("/login")
          })
        }
      }
    }
  }
}
</script>
