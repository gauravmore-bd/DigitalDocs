const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getUserByAadhaar } = require('../models/userModel');

//  Register User Function
const registerUser = async(req, res) => {
    const { aadhaar, name, email, password } = req.body;

    if (!aadhaar || !name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await getUserByAadhaar(aadhaar);
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);

    await createUser({ aadhaar, name, email, password_hash });

    res.status(201).json({ message: 'User registered successfully!' });
};

//  Login User Function
const loginUser = async(req, res) => {
    const { aadhaar, password } = req.body;

    if (!aadhaar || !password) {
        return res.status(400).json({ message: 'Aadhaar and password are required' });
    }

    try {
        const user = await getUserByAadhaar(aadhaar);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, aadhaar: user.aadhaar },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//  Export Both Functions
module.exports = {
    registerUser,
    loginUser
};