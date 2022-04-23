/* eslint-disable */
import Vue from 'vue'
import GAuth from 'vue-google-oauth2'

const gauthOption = {
  clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
  scope: 'profile email',
  prompt: 'consent'
}

Vue.use(GAuth, gauthOption)