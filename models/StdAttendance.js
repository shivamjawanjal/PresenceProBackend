const mongoose = require('mongoose');
const { Schema } = mongoose;

const StdAttendanceSchema = new Schema({
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
    attendacneCode: {  // Fixed typo
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    attendanceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
}, { timestamps: true }); // Optional: Adds createdAt & updatedAt

module.exports = mongoose.model('stdattendance', StdAttendanceSchema);
