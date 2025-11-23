const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const linodeSettingsSchema = new Schema({
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


const LinodeSettings =  mongoose.model("LinodeSettings", linodeSettingsSchema);
module.exports = LinodeSettings;