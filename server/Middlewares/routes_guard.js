/* eslint-disable */
const express = require('express')
const router = express.Router()
const { authenticated, notAuthenticated } = require('./auth_middleware')

// Prevent Authenticated Users From Visiting /login & /register & /reset
router.get('/login', notAuthenticated)
router.get('/signup', notAuthenticated)
router.get('/reset', notAuthenticated)
router.get('/verify', notAuthenticated)

// Prevent UnAuthenticated Users From Visiting
router.get('/', authenticated)

module.exports = router
