const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const dns = require('dns').promises;

const validateEmailDomain = async (email) => {
    try {
        const domain = email.split('@')[1];
        if (!domain) return false;
        const mxRecords = await dns.resolveMx(domain);
        return mxRecords && mxRecords.length > 0;
    } catch (error) {
        return false;
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, securityQuestion, securityAnswer } = req.body;

    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
        res.status(400);
        throw new Error('Please add all fields including security question and answer');
    }

    // validate email domain existence
    const isValidDomain = await validateEmailDomain(email);
    if (!isValidDomain) {
        res.status(400);
        throw new Error('Email provider does not exist. Please use a valid email address from a registered provider.');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Please provide a valid and authentic email address');
    }

    const user = await User.create({
        name,
        email,
        password,
        securityQuestion,
        securityAnswer
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

const updatePreferences = asyncHandler(async (req, res) => {
    const { currency, country, categoryBudgets } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
        if (currency !== undefined || country !== undefined) {
            user.preferences = {
                currency: currency !== undefined ? currency : user.preferences.currency,
                country: country !== undefined ? country : user.preferences.country
            };
        }

        if (categoryBudgets) {
            user.categoryBudgets = categoryBudgets;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateProfile = asyncHandler(async (req, res) => {
    const { name } = req.body;
    console.log('Profile update request for user:', req.user._id, 'New name:', name);

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name: name },
            { new: true, runValidators: true }
        ).select('-password');

        if (updatedUser) {
            console.log('Profile updated successfully for:', updatedUser.email);
            res.json(updatedUser);
        } else {
            console.log('User not found during update profile');
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Save profile error:', error.message);
        res.status(400);
        throw new Error(error.message);
    }
});

const forgotPasswordFetchQuestion = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User with this email does not exist');
    }

    res.status(200).json({
        success: true,
        question: user.securityQuestion
    });
});

const resetPasswordWithAnswer = asyncHandler(async (req, res) => {
    const { email, securityAnswer, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const isMatched = await user.matchSecurityAnswer(securityAnswer);

    if (!isMatched) {
        res.status(400);
        throw new Error('Incorrect security answer');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successful. You can now login.'
    });
});

const dismissAnnouncement = asyncHandler(async (req, res) => {
    const { announcementId } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
        if (!user.dismissedAnnouncements.includes(announcementId)) {
            user.dismissedAnnouncements.push(announcementId);
            await user.save();
        }
        res.status(200).json({ message: 'Announcement dismissed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updatePreferences,
    updateProfile,
    forgotPasswordFetchQuestion,
    resetPasswordWithAnswer,
    dismissAnnouncement,
};
