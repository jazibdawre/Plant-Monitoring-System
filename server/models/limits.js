const mongoose = require('mongoose');
const schema = mongoose.Schema;

const limitsSchema = new schema({
    data : [[Number]]
},{
    timestamps: true
});

var Limits = mongoose.model('Limit', limitsSchema);

module.exports = Limits;