const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ClinicBotSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    botToken: {
        type: String,
        required: true
    },
    clinicId: {
        type: String,
        required: true
    },
    clinicImageUrl: {
        type: String,
        required: true
    },
    workStartTime: {
        type: String,
        required: true
    },
    workEndTime: {
        type: String,
        required: true
    },
    weeks: {
        type: [String],
        enum: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
        required: true
    },
}, {
    timestamps: true,
});

const ClinicBot = model('ClinicBot', ClinicBotSchema);
module.exports = ClinicBot;