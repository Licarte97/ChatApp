const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  username: { type: String, required: true },
  room: { type: String, required: true },
  chat: { type: String, required: true },
}, {
  timestamps: true,
});

const User = mongoose.model('Chat', chatSchema);

module.exports = User;