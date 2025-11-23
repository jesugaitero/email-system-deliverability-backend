const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const emailsSendedSchema = new Schema({
  to: {
    type: [],
    trim: true,
  },
  from: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
  },
  error: {
    type: Boolean,

  },
  accepted: {
    type: Boolean,

  },
  server: {
    type: String,
    trim: true,
    // type: mongoose.Schema.ObjectId,
    // ref: 'LinodeServers',
    // required: [true, 'Email must belong to a server!']
  },
},
{timestamps: true}
);


const EmailSended =  mongoose.model("EmailSended", emailsSendedSchema);
module.exports = EmailSended;