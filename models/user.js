const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 64,
  },
  picture: {
    type: String,
    default: "/avatar.png",
  },
  role:{
    type: [String],
    default: ["User"],
    enum: ["User", "Admin"]
  },
  host: {
    type: String,
    trim: true,
    default: "0.0.0",
  },
  port: {
    type: String,
    trim: true,
    default: "543",
  },
  email_user: {
    type: String,
    trim: true,
  },
  email_password: {
    type: String,
    trim: true,
  },
},
{timestamps: true}
);

const User =  mongoose.model("User", userSchema);
module.exports = User;
