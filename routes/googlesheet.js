const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const GoogleSheet = require("../models/GoogleSheet");

router.get('/fetchurl', fetchuser, async (req, res) => {
    try {
        const urls = await GoogleSheet.find({ user: req.user.id });
        res.json(urls);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


// ROUTE 1: Upload URL to GoogleSheet collection
router.post("/uploadurlofsheet", fetchuser, async (req, res) => {
    const { url } = req.body;

    try {

        // Using GoogleSheet model instead of undefined Upload
        const newUpload = new GoogleSheet({
            user: req.user.id,
            url,
        });

        const savedUploadUrl = await newUpload.save();
        res.json({ savedUploadUrl, message: "URL uploaded successfully" });
    } catch (error) {
        console.error("Upload error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
