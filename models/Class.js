const mongoose = require('mongoose');

const ClassSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    className: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    inviteCode: {
        type: String,
        required: true,
        unique: true,
    },
    branch: {
        type: String,
        required: true,
    },
    students: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            name: {
                type: String,
                required: true,
            },
        },
    ],
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Class', ClassSchema);
