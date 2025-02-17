const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttendanceSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    className: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true,
    },
    attendacneCode: {
        type: String,
        required: true,
        unique:true,
    },
    url: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('attendnce', AttendanceSchema);