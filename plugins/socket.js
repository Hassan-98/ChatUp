import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'

export default function () {
  Vue.use(new VueSocketIO({
    debug: process.env.NODE_ENV !== 'production',
    connection: process.env.BASE_URL
  }))
}
