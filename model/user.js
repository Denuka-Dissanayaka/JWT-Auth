const mongoose = require('mongoose');

const userShema = new mongoose.Schema({
  first_name: { type: String, default: null, required:true },
  last_name: { type: String, default: null, required:true },
  email: { type: String, unique: true, required:true },
  password: { type: String, required:true },
  isAdmin: {type: Boolean , default: false},
  token: { type: String },
  refreshToken: { type: String }
})

const User = mongoose.model('user', userShema);

module.exports = User;