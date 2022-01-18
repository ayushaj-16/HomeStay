const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema ({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  avatar: String,
  bio: String,
  isAdmin: {type: Boolean, default: false},
  notifications: [
    {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Notification'
    }
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);