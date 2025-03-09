const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Class = require('../models/Class');

// ROUTE 1: Get all the classes using: GET "/api/class/fetchallclass". Login required
router.get('/fetchallclass', fetchuser, async (req, res) => {
    try {
        const classes = await Class.find({ user: req.user.id });
        res.json(classes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Add a class using: POST "/api/class/addclass". Login required
router.post(
    '/addclass',
    fetchuser,
    [
        body('className').isLength({ min: 3 }).withMessage('Class name must be at least 3 characters long'),
        body('subject').isLength({ min: 3 }).withMessage('Subject must be at least 3 characters long'),
        body('inviteCode').isLength({ min: 4 }).withMessage('Invite code must be at least 4 characters long'),
        body('branch').isLength({ min: 3 }).withMessage('Branch must be at least 3 characters long'),
    ],
    async (req, res) => {
        const { className, subject, inviteCode, branch } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newClass = new Class({
                className,
                subject,
                inviteCode,
                branch,
                user: req.user.id,
                students: [],
            });

            const saveClass = await newClass.save();
            res.json(saveClass);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    }
);

// ROUTE 4: Delete a class using: DELETE "/api/class/deleteclass/:id". Login required
router.delete('/deleteclass/:id', fetchuser, async (req, res) => {
    try {
        let existingClass = await Class.findById(req.params.id);
        if (!existingClass) {
            return res.status(404).send("Class not found");
        }

        if (existingClass.user.toString() !== req.user.id) {
            return res.status(401).send("You do not have permission to delete this class");
        }

        await Class.findByIdAndDelete(req.params.id);
        res.json({ success: "Class has been deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 5: Join a class using: POST "/api/class/joinclass". Login required
router.post(
    '/joinclass',
    fetchuser,
    [
        body('inviteCode').isLength({ min: 4 }).withMessage('Invite code must be at least 4 characters long'),
    ],
    async (req, res) => {
        const { inviteCode } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const classToJoin = await Class.findOne({ inviteCode });

            if (!classToJoin) {
                return res.status(404).json({ error: "Class not found" });
            }

            // Check if user is already in the class
            const isAlreadyJoined = classToJoin.students.some(student => student._id.toString() === req.user.id);
            if (isAlreadyJoined) {
                return res.status(400).json({ error: "You have already joined this class" });
            }

            // Push user ID and name into students array
            classToJoin.students.push({ _id: req.user.id, name: req.user.name });
            await classToJoin.save();

            res.json({ message: "You have joined the class", className: classToJoin.className });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    }
);


// ROUTE 6: Get all joined classes using: GET "/api/class/joinedclasses". Login required
router.get('/joinedclasses', fetchuser, async (req, res) => {
    try {
        const joinedClasses = await Class.find({ students: req.user.id });
        res.json(joinedClasses);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
