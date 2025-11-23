const mongoose = require('mongoose')
const { Schema } = require("mongoose");

const emailsSendedSchema = new Schema({
    //
    data: {
        type: Object,
        trim: true,
    },
    emailAmount: { type: Number}
},
    { timestamps: true }
);


const EmailSended = mongoose.model("EmailQueue", emailsSendedSchema);
module.exports = EmailSended;