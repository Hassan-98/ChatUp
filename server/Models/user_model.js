/* eslint-disable */
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");

const Schema = mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      validate(val) {
        if (validator.isEmpty(val)) throw new Error(`Username Can't Be Empty`)
      }
    },
    email: {
      type: String,
      required: [true, 'Email Address is Missing'],
      unique: true,
      trim: true,
      validate(val) {
        if (!validator.isEmail(val))
          throw new Error('Not Vaild Email Address')
        else if (validator.isEmpty(val))
          throw new Error('Not Vaild Email Address')
      }
    },
    password: {
      type: String,
      required: [true, 'Password Is Requiered'],
      minlength: [6, `Password Shouldn't Be Less Than 6 Chars`],
      validate(val) {
        if (validator.isEmpty(val)) throw new Error('Password Is Requiered')
      }
    },
    phone: {
      type: String,
      trim: true,
      default: "+20"
    },
    address: {
      type: String,
      trim: true,
      default: 'Not Provided'
    },
    photo: {
      type: String,
      default: "/imgs/default-user.jpg"
    },
    aboutMe: {
      type: String,
      default: 'Not Provided'
    },
    website: {
      type: String,
      default: 'Not Provided'
    },
    facebookLink: {
      type: String,
      default: 'https://www.facebook.com'
    },
    twitterLink: {
      type: String,
      default: 'https://twitter.com'
    },
    linkedInLink: {
      type: String,
      default: 'https://linkedin.com'
    },
    friendsList: {
      type: [mongoose.Schema.ObjectId],
      default: [],
      ref: 'User'
    },
    blockList: {
      type: [mongoose.Schema.ObjectId],
      default: [],
      ref: 'User'
    },
    requestsList: {
      type: [mongoose.Schema.ObjectId],
      default: [],
      ref: 'User'
    },
    lastActive: {
      type: Date,
      default: Date.now()
    },
    activeNow: {
      type: Boolean,
      default: false
    },
    defaultLanguage: {
      type: String,
      default: 'en'
    },
    stories: {
      type: [Object]
    },
    google_user_id: {
      type: Number,
      unique: true
    },
    notifications_subscriptions: [String]
  },
  {
    timestamps: true
  }
)

// Login A User
Schema.statics.login = async ({email, password}, res) => {
  const user = await User.findOne({ email }).lean();

  if (!user) throw Error('Email address or password is incorrect');
  
  if (user.google_user_id) throw Error('This email address is registered via google login only');

  const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.CRYPTO_SECRET).toString(CryptoJS.enc.Utf8);

  if (decryptedPassword !== password) throw Error('Email address or password is incorrect');

  var token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '365d' });

  res.cookie("currentUser", token, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    expires: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
  });

  return { user }
}

// Login A User With Google
Schema.statics.loginWithGoogle = async (userProfile, res) => {
  var user = await User.findOne({ google_user_id: userProfile.id });

  if (!user) {
    user = await User.create({
      google_user_id: userProfile.id,
      email: userProfile.email,
      password: "google-user"
    });
  }
  
  for (var prop in userProfile) {
    user[prop] = userProfile[prop];
  }

  await user.save();

  var token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '365d' });

  res.cookie("currentUser", token, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    expires: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
  });

  return { user }
}


// Check Match Passwords & Hash New Password
Schema.statics.checkPass = async (Id, newPass, oldPass) => {
  const user = await User.findById(Id).select({ password: 1 }).lean();

  if (!user) throw Error('Your entered email address or password is incorrect');

  const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.CRYPTO_SECRET).toString(CryptoJS.enc.Utf8);

  if (decryptedPassword !== oldPass) throw Error('Your entered email address or password is incorrect');

  const password = CryptoJS.AES.encrypt(newPass, process.env.CRYPTO_SECRET).toString();

  return password
}

// Relationships
Schema.virtual("User", {
  ref: "User",
  localField: "_id",
  foreignField: "requestsList"
})

Schema.virtual("User", {
  ref: "User",
  localField: "_id",
  foreignField: "friendsList"
})

Schema.virtual("User", {
  ref: "User",
  localField: "_id",
  foreignField: "blockList"
})

Schema.virtual('chats', {
  ref: 'chat',
  localField: '_id',
  foreignField: 'usersList'
})

Schema.virtual('chats', {
  ref: 'chat',
  localField: '_id',
  foreignField: 'messages.user'
})

Schema.pre('findOne', function() {
  this.populate('requestsList', ["username", "photo", "_id", "email"]);
  this.populate('friendsList', ["username", "photo", "_id", "stories", "email"]);
  this.populate('blockList', ["username", "photo", "_id", "email"]);
});

// The Model
const User = mongoose.model('User', Schema)

module.exports = User
