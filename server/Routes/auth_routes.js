/* eslint-disable */
const router = require('express').Router();
const CryptoJS = require("crypto-js");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const UserModel = require('../Models/user_model');
const RESET_TOKEN = require('../Models/ResetTokens');
const { authenticated, notAuthenticated } = require('../Middlewares/auth_middleware')
const createResetPasswordTemplate = require("../Mails/reset_password")

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_PASSWORD
  }
});

// Login a User
router.post('/login', notAuthenticated, async (req, res) => {
  try {
    const {email, password} = req.body;

    const { user } = await UserModel.login({email, password}, res);
    
    res.json({ success: user });

  } catch (e) {
    res.json({err: e.message})
  }
})

// Login a User
router.post('/loginWithGoogle', notAuthenticated, async (req, res) => {
  try {
    const {userProfile} = req.body;

    const { user } = await UserModel.loginWithGoogle(userProfile, res);
    
    res.json({ success: user });

  } catch (e) {
    res.json({err: e.message})
  }
})

// Create a User
router.post('/signup', notAuthenticated, async (req, res) => {
  try {
    const newUser = new UserModel(req.body);

    newUser.password = await bcrypt.hash(newUser.password, 8);
    
    const user = await newUser.save();
    
    res.json({ success: user });
  } catch (e) {
    res.json({err: e.message});
  }
})

// Reset Password
router.post('/reset', notAuthenticated, async (req, res) => {
  try {
    const {email} = req.body;

    const user = await UserModel.findOne({email}).select({ google_user_id: 1, username: 1 }).lean();

    if (!user) return res.json({err: "This email address is not related to any account"});

    if (user.google_user_id) return res.json({err: "You can't reset password for account registered via Google"});

    const Token = await RESET_TOKEN.findOne({userID: mongoose.Types.ObjectId(user._id)});

    if (Token && new Date().getTime() < Token.expiration) return res.json({err: "Reset password email already sent to this email address"});

    if (Token && new Date().getTime() > Token.expiration) await RESET_TOKEN.findByIdAndDelete(Token._id);

    const token = jwt.sign({ userID: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await RESET_TOKEN.create({
      token,
      userID: mongoose.Types.ObjectId(user._id),
      expiration: new Date().getTime() + (60 * 60 * 1000)
    });

    const resetPasswordTemplate = createResetPasswordTemplate({ username: user.username, verifyLink: `${process.env.BASE_URL}/verify?t=${token}` })

    const mail_content = {
      from: "no-reply@chatupapp.tk",
      to: email,
      subject: "Reset Account Password - ChatUp",
      html: resetPasswordTemplate
    }

    transporter.sendMail(mail_content, (err, info) => {
      if (err) res.json({err});
      else res.json({ success: info.response });
    });

  } catch (e) {
    res.json({err: e.message});
  }
});

// change Password
router.post('/verify-change', notAuthenticated, async (req, res) => {
  try {
    const {token, newPassword} = req.body;
    
    const Token = await RESET_TOKEN.findOne({token});

    if (!Token || new Date().getTime() > Token.expiration) return res.json({err: "Reset password session expired"});

    const { userID } = jwt.verify(token, process.env.JWT_SECRET);

    if (!userID) {
      await RESET_TOKEN.findByIdAndDelete(Token._id);
      return res.json({err: "Reset password session expired"});
    }

    const user = await UserModel.findById(userID).select({ password: 1 });

    user.password = CryptoJS.AES.encrypt(newPassword, process.env.CRYPTO_SECRET).toString();

    await user.save();

    await RESET_TOKEN.findByIdAndDelete(Token._id);
    
    res.json({ success: true });

  } catch (e) {
    res.json({err: e.message});
  }
});

// Logout a User
router.post('/logout', authenticated, async (req, res) => {
  try {
    // Clear User Session
    res.clearCookie("currentUser");
    
    // Redirect To Login Page
    res.redirect("/login");
  } catch (e) {
    res.json(e)
  }
})

module.exports = router
