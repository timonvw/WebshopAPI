const mongoose = require('mongoose');

//==========CREATE THE SCHEMA WITH THE PROPERTIES AND SETTINGS==========
const CodeSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

module.exports = mongoose.model('Codes', CodeSchema);