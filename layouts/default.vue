<template>
  <div @click="hideMsgsMenus">
    <voiceCall v-if="inCall" />
    <Loading v-if="loading" />
    <nuxt v-else />
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-214402470-1" />
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'UA-214402470-1');
    </script>
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
    document.body.click();
    // Stop ResponsiveVoice Auto Speak
    window.getSelection = () => ''
  },
  methods: {
    hideMsgsMenus (e) {
      document.querySelectorAll('.options-menu').forEach((element) => {
        element.style.display = 'none'
      })
      if (e.target.className === 'fas fa-ellipsis-v') {
        e.target.children[0].style.display = 'inline-block'
      }
    }
  }
}
</script>
