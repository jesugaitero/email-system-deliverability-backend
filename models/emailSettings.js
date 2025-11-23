const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const emailSettingsSchema = new Schema({
  host: {
    type: String,
    trim: true,
    required: true,
  },
  port: {
    type: String,
    trim: true,
    required: true,
  },
  email_user: {
    type: String,
    trim: true,
    required: true,
  },
  email_password: {
    type: String,
    trim: true,
    required: true,
  },
  user: {
    type: String,
    trim: true,
    required: true,
  },
  useTLS: {
    type: Boolean,
  },
  useSSL: {
    type: Boolean,
  },

},
{timestamps: true}
);

const EmailSettings =  mongoose.model("EmailSettings", emailSettingsSchema);

module.exports = EmailSettings;
