const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const bitlaunchServersSchema = new Schema({
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
    default: 'https://pbs.twimg.com/profile_images/944667097736630272/LJYyE9W__400x400.jpg'
  }
},
{timestamps: true}
);

const BitlaunchServers =  mongoose.model("BitlaunchServers", bitlaunchServersSchema);
module.exports = BitlaunchServers;