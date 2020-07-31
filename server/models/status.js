const mongoose = require('mongoose');
const schema = mongoose.Schema;

const statusSchema = new schema({
    data : {
        timestamp: String,
        status: String,
        station: String,
        motor: String,
        settings: {
            temperature: Boolean,
            humidity: Boolean,
            moisture: Boolean,
            email: Boolean,
            sms: Boolean
        }
    }
},{
    timestamps: true
});

var Status = mongoose.model('Status', statusSchema);

module.exports = Status;