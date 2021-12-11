/* eslint-disable */
const router = require('express').Router();
const webpush = require('web-push');
const { authenticated } = require('../Middlewares/auth_middleware');
const USER = require('../Models/user_model');

// subscribeToNotifications ENDPOINT
router.post('/subscribeToNotifications', authenticated, async (req, res) => {
    try {
        const { userId, subscription } = req.body;

        const user = await USER.findById(userId);

        if (user.notifications_subscriptions) {
            if (user.notifications_subscriptions.indexOf(subscription) === -1) user.notifications_subscriptions.push(subscription);
        } else {
            user.notifications_subscriptions = [subscription];
        }

        await user.save();

        res.sendStatus(200)
    } catch (e) {
        res.send({ err: e.message })
    }
  }
);

module.exports = router;
