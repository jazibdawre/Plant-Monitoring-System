const mongoose = require('mongoose');
const schema = mongoose.Schema;

const latestSchema = new schema({
    data:[{}]
},{
    timestamps: true
});

var Latest = mongoose.model('Latest', latestSchema);

module.exports = Latest;