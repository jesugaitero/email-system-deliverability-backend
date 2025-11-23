const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const emailTemplateSchema = new Schema({
  senderEmail: {
    type: String,
    trim: true,
    required: true,
  },
  senderName: {
    type: String,
    trim: true,
    required: true,
  },
  subject: {
    type: String,
    trim: true,
    required: true,
  },
  message: {
    type: String,
    trim: true,
    required: true,
  },

},
{timestamps: true}
);


const EmailTemplate =  mongoose.model("EmailTemplate", emailTemplateSchema);

module.exports = EmailTemplate;