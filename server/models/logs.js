const mongoose = require('mongoose');
const schema = mongoose.Schema;

const limitsSchema = new schema({
    data : [[]]
},{
    timestamps: true
});

var Logs = mongoose.model('Log', limitsSchema);

module.exports = Logs;