const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const vultrServersSchema = new Schema({
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
    default: 'https://media-exp1.licdn.com/dms/image/C4E0BAQHElSUlXpVFOA/company-logo_200_200/0/1563467049944?e=2159024400&v=beta&t=649BYz_dWelPLlDiV___KUPJvWYO0N_CpQ1a07wkHXM'
  }
},
{timestamps: true}
);

const VultrServers =  mongoose.model("VultrServers", vultrServersSchema);
module.exports = VultrServers;