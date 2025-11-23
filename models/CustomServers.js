const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const customServerSchema = new Schema({
  key: {
    type: String,
    trim: true,
  },
  softwareVersion: {
    type: String,
    trim: true,
  },
  fakeDomain: {
    type: String,
    trim: true,
  },
  fakeEmail: {
    type: String,
    trim: true,
  },
  serverInfo: {
    type: Object,
    required: true,
  },
  imageCover: {
    type: String,
    default: 'https://www.freepnglogos.com/uploads/server-png/server-icon-download-icons-17.png'
  }
},
{timestamps: true}
);

const CustomServers =  mongoose.model("CustomServers", customServerSchema);
module.exports = CustomServers;