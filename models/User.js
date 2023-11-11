const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  nickname: {type: String, required: true},
  profileImgUrl: {type: String},
  profileImgId: {type: String}
});

module.exports = mongoose.model('User', userSchema );