const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Attendance = require("../models/Attendance");
const StdAttendance = require("../models/StdAttendance");
const GoogleSheet = require("../models/GoogleSheet");

// Temporary cache to store active attendance codes
const activeAttendanceCodes = {};

// ROUTE 1: Get all attendance using: GET "/api/attendance/fetchallattendance". Login required
router.get("/fetchallattendance", fetchuser, async (req, res) => {
    try {
        const attendance = await Attendance.find({ user: req.user.id }).exec();
        res.json(attendance);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/stdfetchallattendance", fetchuser, async (req, res) => {
    try {
        const attendance = await StdAttendance.find({ user: req.user.id }).exec();
        res.json(attendance);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 1.1: Check if the attendance code is valid and add to StdAttendance if valid
router.post("/checkcode", fetchuser, async (req, res) => {
    const { className, subject, attendacneCode, date } = req.body;

    try {
        // Check if the code exists in the active codes
        if (!activeAttendanceCodes[attendacneCode]) {
            return res.status(408).json({ error: "Attendance code is invalid or has expired." });
        }

        // Find the attendance record using all provided details
        const attendance = await Attendance.findOne({ className, subject, attendacneCode, date }).exec();
        if (!attendance) {
            return res.status(404).json({ error: "Attendance record not found. Please check the provided details." });
        }

        // Add the student's attendance to StdAttendance
        const stdAttendance = new StdAttendance({
            className,
            subject,
            attendacneCode,
            date,
            attendanceId: attendance._id,
            user: req.user.id,
        });

        await stdAttendance.save();

        res.json({
            message: "Attendance code validated, and student attendance recorded.",
            attendance,
            stdAttendance,
            url: attendance.url || null
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Add attendance using: POST "/api/attendance/addattendance". Login required
router.post(
    "/addattendance",
    fetchuser,
    [
        body("className").isLength({ min: 3 }).withMessage("Class name must be at least 3 characters long"),
        body("subject").isLength({ min: 3 }).withMessage("Subject must be at least 3 characters long"),
        body("attendacneCode").isLength({ min: 8 }).withMessage("Attendance code must be at least 8 characters long"),
        body("date").isISO8601().withMessage("Invalid date format. Use YYYY-MM-DD format."),
    ],
    async (req, res) => {
        const { className, subject, attendacneCode, date } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Ensure the attendance record does not already exist
            const existingAttendance = await Attendance.findOne({ className, subject, attendacneCode, date }).exec();
            if (existingAttendance) {
                return res.status(400).json({ error: "Attendance with this code and details already exists." });
            }

            // Fetch the URL from GoogleSheet collection
            const googleSheet = await GoogleSheet.findOne({ user: req.user.id }).exec();
            const url = googleSheet ? googleSheet.url : null;

            // Create new attendance with the fetched URL
            const newAttendance = new Attendance({
                className,
                subject,
                attendacneCode,
                date,
                user: req.user.id,
                url, // Attach the fetched URL
            });

            const saveAttendance = await newAttendance.save();

            // Add the code to the active codes list with a timeout of 2 minutes
            activeAttendanceCodes[attendacneCode] = true;
            setTimeout(() => {
                delete activeAttendanceCodes[attendacneCode];
            }, 12000000); // 2 minutes in milliseconds

            res.json(saveAttendance);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    }
);

// ROUTE 4: Delete attendance using: DELETE "/api/attendance/deleteattendance/:id". Login required
router.delete("/deleteattendance/:id", fetchuser, async (req, res) => {
    try {
        const existingAttendance = await Attendance.findById(req.params.id).exec();
        if (!existingAttendance) {
            return res.status(404).json({ error: "Attendance not found" });
        }

        if (existingAttendance.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "Not Allowed" });
        }

        await Attendance.findByIdAndDelete(req.params.id).exec();
        res.json({ success: "Attendance has been deleted" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
