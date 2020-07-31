const mongoose = require('mongoose');
const schema = mongoose.Schema;

const settingsSchema = new schema({
    temperature: Boolean,
    humidity: Boolean,
    moisture: Boolean,
    email: Boolean,
    sms: Boolean
},{
    timestamps: true
});

var Settings = mongoose.model('Setting', settingsSchema);

module.exports = Settings;