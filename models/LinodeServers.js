const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const linodeServersSchema = new Schema({
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
    default: 'https://i.imgur.com/vC0dFCG.png'
  }
},
{timestamps: true}
);

const LinodeServers =  mongoose.model("LinodeServers", linodeServersSchema);
module.exports = LinodeServers;