const mongoose = require('mongoose');

const MicroprojectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    students: [
        {
            name: { type: String, required: true },
            rollNo: { type: String, required: true, unique: true }, // No `unique: true`
            class: { type: String, required: true },
            enrollment: { type: String, required: true },
        },
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
}, { timestamps: true });


module.exports = mongoose.model('Microproject', MicroprojectSchema);
