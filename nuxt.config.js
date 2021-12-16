
module.exports = {
  mode: 'universal',
  head: {
    title: 'ChatUp App - Free chat app',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'ChatUp, The Modern Chat App' }
    ],
    link: [
      { rel: 'icon', href: '/imgs/chatLogoDark.png' },
      { rel: 'stylesheet', href: '/fontawesome/css/all.min.css' },
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css' },
      { href: 'https://fonts.googleapis.com/css?family=Open+Sans|Roboto+Slab|Tajawal|Rock+Salt&display=swap', rel: 'stylesheet' }
    ],
    script: [
      { src: 'https://code.responsivevoice.org/responsivevoice.js?key=J3mBT7fB', ssr: false },
      { src: '/js/AgoraRTC_N-4.7.3.js', ssr: false },
      { src: '/js/zuck.min.js', ssr: false },
      { src: '/js/recorder.js', ssr: false },
      { src: '/js/plyr.min.js', ssr: false }
    ]
  },
  loading: { color: 'transparent' },
  css: [
    '@/assets/css/zuck.min.css',
    '@/assets/css/facesnap.min.css',
    '@/assets/css/plyr.css',
    '@/assets/css/css-file-icons.css'
  ],
  styleResources: {
    scss: [
      '@/assets/scss/mixins.scss',
      '@/assets/scss/variables.scss'
    ]
  },
  plugins: [
    { src: '~/plugins/socket.js', ssr: false },
    { src: '~/plugins/moment.js', ssr: false },
    { src: '~/plugins/sweetalert2.js', ssr: false },
    { src: '~/plugins/vTooltip.js', ssr: false },
    { src: '~/plugins/audioVisual.js', ssr: false },
    { src: '~/plugins/googleOAuth.js', ssr: false }
  ],
  buildModules: ['@nuxtjs/eslint-module'],
  modules: [
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
    '@nuxtjs/style-resources'
  ],
  env: {
    BASE_URL: process.env.BASE_URL,
    AgoraAppID: process.env.AgoraAppID,
    GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
    PUBLIC_VAPID_KEY: process.env.PUBLIC_VAPID_KEY
  },
  axios: {
    baseURL: process.env.BASE_URL
  },
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  build: {
    extend (config, ctx) {}
  }
}
