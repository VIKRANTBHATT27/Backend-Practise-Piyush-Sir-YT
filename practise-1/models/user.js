const mongoose = require('mongoose');

// Schema
const userSchema = new mongoose.Schema({
     first_name: {
          type: String,
          required: true
     },
     last_name: {
          type: String,
     },
     email: {
          type: String,
          required: true,
          unique: true
     },
     gender: {
          type: String,
          enum: ["Male", "Female"],
          required: true
     },
     job_title: {
          type: String,
     }
}, { timestamps: true });

// using schema create a model with model name as 'user'
const User = mongoose.model("user", userSchema);

module.exports = User;