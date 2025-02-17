const mongoose = require("mongoose");

const UploadSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ""
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Upload", UploadSchema);
