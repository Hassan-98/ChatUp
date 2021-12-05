/* eslint-disable */
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
      unique: [true, 'A User Already Registered With This Email Address'],
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
      type: Number,
      trim: true,
      default: 0
    },
    address: {
      type: String,
      trim: true,
      default: 'Not Provided'
    },
    photo: {
      type: String
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
    }
  },
  {
    timestamps: true
  }
)

// Login A User
Schema.statics.login = async ({email, password}, res) => {
  const user = await User.findOne({ email })
  if (!user) throw Error('Your entered email address or password is incorrect');
  
  if (user.google_user_id) throw Error('This email address is registered via google login only');

  const passwordMacthed = await bcrypt.compare(password, user.password)
  if (!passwordMacthed) throw Error('Your entered email address or password is incorrect');

  var token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

  res.cookie("currentUser", token, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    expires: new Date(new Date().getTime() + 12 * 60 * 60 * 1000),
  });

  return { user }
}

// Login A User With Google
Schema.statics.loginWithGoogle = async (userProfile, res) => {
  var user = await User.findOne({ google_user_id: userProfile.id })

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

  var token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

  res.cookie("currentUser", token, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    expires: new Date(new Date().getTime() + 12 * 60 * 60 * 1000),
  });

  return { user }
}


// Check Match Passwords & Hash New Password
Schema.statics.checkPass = async (Id, newPass, oldPass) => {
  const user = await User.findById(Id)
  if (!user) throw Error('Your entered email address or password is incorrect')
  const passwordMacthed = await bcrypt.compare(oldPass, user.password)
  if (!passwordMacthed) throw Error('Your entered email address or password is incorrect')
  const password = await bcrypt.hash(newPass, 8)

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
