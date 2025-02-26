const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  canPurchase: {
    type: String,
    enum: ['ALLOWED', 'DENIED', 'PENDING'], // Define your enum values
    default: 'PENDING', // Set a default value if needed
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
