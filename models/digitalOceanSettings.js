const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const digitalOceanServerSettingsSchema = new Schema({
  key: {
    type: String,
    trim: true,
  },
  user: {
    type: String,
    trim: true,
    required: true,
  },
},
{timestamps: true}
);


const DigitalOceanSettings =  mongoose.model("DigitalOceanSettings", digitalOceanServerSettingsSchema);
module.exports = DigitalOceanSettings;