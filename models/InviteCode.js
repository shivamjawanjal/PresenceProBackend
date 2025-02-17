const mongoose = require('mongoose');

const InviteCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'teacher'], // Valid roles
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model (the one who created the invite code)
        required: true, // Ensure a user ID is always associated with the invite code
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('InviteCode', InviteCodeSchema);
