const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Microproject = require('../models/Microproject');

// Centralized error handler
const handleError = (res, error) => {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
};

// Validation rules for creating and updating microprojects
const validateMicroproject = [
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
    body('classId').notEmpty().withMessage('Class ID is required'),
    body('students').isArray({ min: 1 }).withMessage('Students must be an array with at least one student'),
    body('students.*.name').trim().isLength({ min: 4 }).withMessage('Student name must be at least 4 characters long'),
    body('students.*.rollNo').trim().isLength({ min: 3 }).withMessage('Roll number must be at least 3 characters long'),
    body('students.*.class').notEmpty().withMessage('Class is required for each student'),
    body('students.*.enrollment').trim().isLength({ min: 3 }).withMessage('Enrollment must be at least 3 characters long'),
];

// ROUTE 1: Get all microprojects by the logged-in user
router.get('/fetchallMicroproject', fetchuser, async (req, res) => {
    try {
        const microprojects = await Microproject.find({ user: req.user.id });
        res.json(microprojects.length ? microprojects : { error: "No microprojects found for this user" });
    } catch (error) {
        handleError(res, error);
    }
});

// ROUTE 2: Get microprojects by class ID
router.post('/microprojectsbyclass', fetchuser, async (req, res) => {
    try {
        const { classId } = req.body;
        if (!classId) return res.status(400).json({ error: "Class ID is required" });

        const microprojects = await Microproject.find({ classId });
        res.json(microprojects.length ? microprojects : { error: "No microprojects found for this class" });
    } catch (error) {
        handleError(res, error);
    }
});

// ROUTE 3: Add a new microproject
// ROUTE 3: Add a new microproject
router.post('/addmicroproject', fetchuser, validateMicroproject, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, classId, students } = req.body;

    // Ensure students is an array and not undefined or null
    if (!Array.isArray(students)) {
        return res.status(400).json({ error: "Students must be an array" });
    }

    try {
        // Check for duplicate roll numbers in the request
        const rollNos = new Set(students.map(student => student.rollNo));
        if (rollNos.size !== students.length) return res.status(400).json({ error: "Duplicate roll numbers are not allowed." });

        // Check for roll number duplication across existing microprojects
        const existingRollNos = new Set(
            (await Microproject.find({ classId })).flatMap(proj => proj.students.map(student => student.rollNo))
        );
        const duplicate = students.find(student => existingRollNos.has(student.rollNo));
        if (duplicate) return res.status(400).json({ error: `Roll number ${duplicate.rollNo} already exists in another microproject.` });

        const newMicroproject = new Microproject({ title, classId, students, user: req.user.id });
        res.json({ message: "Microproject added successfully", microproject: await newMicroproject.save() });
    } catch (error) {
        handleError(res, error);
    }
});


// ROUTE 5: Delete a microproject
router.delete('/deletemicroproject/:id', fetchuser, async (req, res) => {
    try {
        const microproject = await Microproject.findById(req.params.id);
        if (!microproject) return res.status(404).json({ error: "Microproject not found" });
        if (microproject.user.toString() !== req.user.id) return res.status(401).json({ error: "Unauthorized" });

        await Microproject.findByIdAndDelete(req.params.id);
        res.json({ message: "Microproject deleted successfully", microproject });
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
