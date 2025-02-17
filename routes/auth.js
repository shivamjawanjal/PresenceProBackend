const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const InviteCode = require('../models/InviteCode');

const JWT_SECRET = 'shivam@jawanajl'; // Secret key for JWT

// ROUTE 1: Create a new user (student)
router.post(
    '/createuser',
    [
        // Validate user inputs
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('email').isEmail().withMessage('Enter a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('inviteCode').notEmpty().withMessage('Invite code is required'),
    ],
    async (req, res) => {
        const { username, email, password, inviteCode } = req.body;

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Check if email already exists in the database
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            // Verify the invite code exists
            let invite = await InviteCode.findOne({ code: inviteCode });
            if (!invite) {
                return res.status(400).json({ error: 'Invalid invite code' });
            }

            // Extract the role and the userId from the invite code
            const role = invite.role;

            // Hash the password for security
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create and save the new user (student)
            const user = new User({
                username,
                email,
                password: hashedPassword,
                role,
                invite: inviteCode,  // Correctly store the invite code value
            });

            await user.save();

            // Generate JWT token for the new student
            const data = {
                user: {
                    id: user.id,
                },
            };
            const authtoken = jwt.sign(data, JWT_SECRET);

            // Return success response with role and token
            res.json({ authtoken,user });
        } catch (error) {
            console.error('Error during user registration:', error.message);
            res.status(500).send('Internal Server Error');
        }
    }
);


// ROUTE 2: Authenticate a user (teacher)
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Enter a valid email address'),
        body('password').exists().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Verify if the user exists (teacher)
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Compare the entered password with the stored hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token for the teacher
            const data = {
                user: {
                    id: user.id,
                },
            };
            const authtoken = jwt.sign(data, JWT_SECRET);

            res.json({ authtoken,user });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Internal Server Error');
        }
    }
);

// ROUTE 3: Get user details (teacher)
// ROUTE 5: Get students who joined using an invite code (Admin Only)
router.post('/studentsJoined', fetchuser, async (req, res) => {
    try {
        // Ensure only admin can access this route
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || adminUser.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Teachers only.' });
        }

        // Find all students who used an invite code
        const students = await User.find({ role: 'student', inviteCodeUsed: { $ne: null } }).select('-password');

        res.json({ totalStudents: students.length, students });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


// ROUTE 4: Generate invite codes
router.post('/generateInviteCode', fetchuser, async (req, res) => {
    try {
        // Generate unique invite codes for students and teachers
        const studentInviteCode = `STU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const teacherInviteCode = `TCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Store the user ID of the creator along with the invite code
        const userId = req.user.id;

        // Create and save invite codes with the associated userId
        await InviteCode.create({ code: studentInviteCode, role: 'student', userId });
        await InviteCode.create({ code: teacherInviteCode, role: 'teacher', userId });

        res.json({ studentInviteCode, teacherInviteCode });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
