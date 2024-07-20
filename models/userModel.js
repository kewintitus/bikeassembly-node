const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    min: [8, 'Password must have atleast 8 characters'],
  },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
});

const User = mongoose.model('user', userSchema);

module.exports = User;
