const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    trim: true 
  },
  otp: { 
    type: String, 
    default: null 
  },
  otpExpiry: { 
    type: Date, 
    default: null 
  }
});

module.exports = mongoose.model("User", userSchema);