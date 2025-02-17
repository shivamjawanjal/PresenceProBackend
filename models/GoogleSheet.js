const mongoose = require('mongoose');

const GoogleSheetSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    url: {
        type:String,
        required:true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('GoogleSheet', GoogleSheetSchema);
