const express = require("express");
const router = express.Router();
const multer = require("multer");
const fetchuser = require("../middleware/fetchuser");
const cloudinary = require("../config/cloudinaryConfig");
const Upload = require("../models/Upload");

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

const uploadToCloudinary = async (buffer, mimetype, originalname) => {
    return new Promise((resolve, reject) => {
        const resourceType = mimetype.startsWith("image/") ? "image" : "raw";

        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType, public_id: originalname },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );

        uploadStream.end(buffer);
    });
};

// 📌 **UPLOAD FILE WITH CLASS ID & DESCRIPTION**
router.post("/uploadfile", fetchuser, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const { description, classId } = req.body;
        if (!classId) return res.status(400).json({ error: "Class ID is required" });

        const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype, req.file.originalname);

        const newUpload = new Upload({
            user: req.user.id,
            fileName: req.file.originalname,
            fileUrl: result.secure_url,
            fileType: req.file.mimetype,
            publicId: result.public_id,
            description: description || "",
            classId, // Store classId in MongoDB
        });

        const savedUpload = await newUpload.save();
        res.json({ cloudinaryResponse: result, savedUpload });
    } catch (error) {
        console.error("Upload error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📌 **FETCH FILES BY CLASS ID**
router.get("/fetchalluploads/:classId",  async (req, res) => {
    try {
        const { classId } = req.params;
        const uploads = await Upload.find({ classId });
        res.json(uploads);
    } catch (error) {
        console.error("Fetch error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📌 **DELETE FILE**
router.delete("/deleteupload/:id", fetchuser, async (req, res) => {
    try {
        const upload = await Upload.findById(req.params.id);
        if (!upload) return res.status(404).json({ error: "File not found" });

        await cloudinary.uploader.destroy(upload.publicId, { resource_type: upload.fileType.startsWith("image/") ? "image" : "raw" });

        await upload.deleteOne();
        res.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
