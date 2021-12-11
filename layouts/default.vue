<template>
  <div @click="openAndHideMsgsMenus">
    <voiceCall v-if="inCall" />
    <Loading v-if="loading" />
    <nuxt v-else />
  </div>
</template>

<style lang="scss">
body,
html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    overflow: hidden;
    min-height: 100vh;
    background: #f6f6f6;
}
body {
  padding-right: 0!important;
}
.tooltip {
  z-index: 999999999!important;
  opacity: 1!important;
  top: -5px!important;
  transition: 0s;
  &[x-placement="bottom"] {
    top: 5px!important;
  }
}
</style>

<script>
/* eslint-disable */
import voiceCall from '~/components/voiceCall.vue'
import Loading from '~/components/Loading.vue'
export default {
  components: {
    Loading, voiceCall
  },
  computed: {
    loading () {
      return this.$store.state.loading
    },
    inCall () {
      return this.$store.state.inCall
    }
  },
  mounted () {
    this.$store.commit("stopLoading");
    // Stop ResponsiveVoice Auto Speak
    window.getSelection = () => ''
  },
  methods: {
    openAndHideMsgsMenus (e) {
      document.querySelectorAll('.options-menu').forEach((element) => {
        element.classList.remove("show")
      })
      if (e.target.classList.contains('fa-ellipsis-v')) {
        const menu = e.target.querySelector('.options-menu')
        if (menu.classList.contains("show")) return;
        menu.classList.add("show");
      };
    }
  }
}
</script>
