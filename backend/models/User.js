const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: false,
  }
});

// Match password (raw for now as requested)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return enteredPassword === this.password;
};

module.exports = mongoose.model('User', UserSchema);
