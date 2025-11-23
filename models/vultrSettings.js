const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const vultrSettingsSchema = new Schema({
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


const VultrSettings =  mongoose.model("VultrSettings", vultrSettingsSchema);
module.exports = VultrSettings;