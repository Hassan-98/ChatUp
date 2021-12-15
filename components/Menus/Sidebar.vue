<template>
  <div class="SideBar">
    <img src="/imgs/chatLogoDark.png" alt="Icon">
    <div class="logo">
      ChatUp
    </div>
    <hr>
    <i v-tooltip="'Chats'" class="fal fa-comments-alt main-sidebar-btns active" title="Chats" @click="changeMenu($event,'Chats')" />
    <i v-tooltip="'Groups'" class="fal fa-users main-sidebar-btns" title="Groups" @click="changeMenu($event, 'Groups')" />
    <i v-tooltip="'Archives'" class="fal fa-archive main-sidebar-btns" title="Archives" @click="changeMenu($event,'Archives')" />
    <i v-tooltip="'Friends'" class="fal fa-user-friends main-sidebar-btns" title="Friends" @click="showFriends" />
    <i v-tooltip="'Settings'" class="fal fa-cog main-sidebar-btns" title="Settings" @click="openSettings" />
    <i v-tooltip="'Dark Mode'" class="fal fa-moon darkMode" title="Dark Mode" @click="toggleDarkMode" />
    <i v-tooltip="'Logout'" class="fal fa-sign-out logout" title="Logout" @click="logout" />
  </div>
</template>

<style lang="scss">
  .SideBar {
    height: 100vh;
    text-align: center;
    background: #051E34;
    padding: 5px 0;
    flex: 0 0 6.5%;
    position: relative;
    z-index: 999;
    box-shadow: 2px 0 5px rgba($color: var(--mc), $alpha: 0.4);
    @include sm {
      flex: 0 0 12%;
      max-width: 12%;
    }
    @include xs {
      flex: 0 0 18%;
      max-width: 18%;
    }
    @media (min-width: 769px) and (max-width: 992px) {
      flex: 0 0 8.5%;
    }
    img{
      display: block;
      margin: 5px auto -5px;
      width: 40px;
      height: 40px;
      @include lg {
        width: 35px;
        height: 35px;
      }
      @include xs {
        width: 30px;
        height: 30px;
      }
    }
    .logo {
      padding: 5px 5px 0;
      font-family: 'Rock Salt', cursive;
      font-weight: bold;
      color: #ebebeb;
      margin: 5px 0 0 0;
      font-size: 11px;

      @include xs {
        font-size: 10px;
      }
    }
    hr {
      background: #1C3852;
    }
    i {
      display: flex;
      margin: 25px auto;
      font-size: 26px;
      padding: 3px 0 0;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: var(--wit);
      &:hover, &.active {
        color: var(--mc);
        background: var(--bg);
      }
      &.logout {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
</style>

<script>
/* eslint-disable */
export default {
  mounted () {
    const darkMode = localStorage.getItem('darkMode')
    if (darkMode == 'ON') {
      document.querySelector('.darkMode').click()
    }
  },
  methods: {
    changeMenu (e, type) {
      this.$store.commit('changeMenu', type)
      document.querySelectorAll('.main-sidebar-btns').forEach((btn) => {
        btn.classList.remove('active')
      })
      e.target.classList.add('active')
    },
    openSettings () {
      this.$store.commit('openSettingModal')
    },
    showFriends(){
      this.$store.commit('openSettingModal')
      this.$store.state.openSetting = 'FriendsList'
      setTimeout(() => {
        var btn = document.querySelector('.friendsListBtn')
        Object.values(btn.parentElement.children).forEach((child) => {
          child.classList.remove('active')
        })
        btn.classList.add('active')
       }, 0)
    },
    toggleDarkMode (e) {
      e.target.classList.toggle('active');
      const nothingLogo = document.querySelector(".nothing img");
      if (e.target.classList.contains('active')) {
        localStorage.setItem('darkMode', 'ON')
        document.documentElement.style.setProperty('--mc', '#BAC1C7')
        document.documentElement.style.setProperty('--bg', '#1d354c')
        document.documentElement.style.setProperty('--wit', '#BAC1C7')
        document.documentElement.style.setProperty('--white', '#1d2f41')
        document.documentElement.style.setProperty('--text', '#BAC1C7')
        document.documentElement.style.setProperty('--borders', '#051e345c')
        document.documentElement.style.setProperty('--bg-nothing', '#11254A')
        document.documentElement.style.setProperty('--buttons', '#BAC1C7');
        if (nothingLogo) nothingLogo.src = '/imgs/chatLogoNothing-Dark.png';
      } else {
        localStorage.setItem('darkMode', 'OFF')
        document.documentElement.style.setProperty('--mc', '#1E3750')
        document.documentElement.style.setProperty('--bg', '#F5F7F9')
        document.documentElement.style.setProperty('--wit', '#BAC1C7')
        document.documentElement.style.setProperty('--white', '#fff')
        document.documentElement.style.setProperty('--text', '#676767')
        document.documentElement.style.setProperty('--borders', '#e9e9e9')
        document.documentElement.style.setProperty('--bg-nothing', '#fff')
        document.documentElement.style.setProperty('--buttons', '#dae0e5')
        document.documentElement.style.setProperty('--open-bg', 'url(https://www.toptal.com/designers/subtlepatterns/patterns/so-white.png)')
        if (nothingLogo) nothingLogo.src = '/imgs/chatLogoNothing-Light.png';
      }
    },
    logout () {
      const { $axios } = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You will be logged out!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Logout'
      }).then(async (result) => {
        if (result.value) {
          await $axios.$post('/api/auth/logout');
          
          Swal.fire({
              toast: true,
              icon: 'success',
              title: 'Logged Out!'
          })
          
          location.href = '/login';
        }
      })
    }
  }
}
</script>
