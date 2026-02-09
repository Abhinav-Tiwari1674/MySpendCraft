const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Expense = require('../models/Expense');
const Announcement = require('../models/Announcement');
const mongoose = require('mongoose');

const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Contact.countDocuments();
    const newMessages = await Contact.countDocuments({ status: 'new' });

    let totalExpenses = 0;
    try {
        if (mongoose.models.Expense) {
            totalExpenses = await Expense.countDocuments();
        }
    } catch (err) {
        console.log('Expense model count failed:', err.message);
    }

    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

    res.status(200).json({
        totalUsers,
        totalMessages,
        newMessages,
        totalExpenses,
        dbStatus,
        serverTime: new Date()
    });
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
});

const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

    const updatedUser = await user.save();
    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isAdmin) {
        res.status(400);
        throw new Error('Cannot delete admin user');
    }

    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'User removed' });
});

const sendBroadcast = asyncHandler(async (req, res) => {
    const { message, type } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required for broadcast');
    }

    // Deactivate previous announcements
    await Announcement.updateMany({ isActive: true }, { isActive: false });

    const announcement = await Announcement.create({
        message,
        type: type || 'info',
        createdBy: req.user._id
    });

    res.status(201).json(announcement);
});

const getLatestAnnouncement = asyncHandler(async (req, res) => {
    // Check if current user has dismissed any
    const user = await User.findById(req.user._id);
    const dismissedIds = user ? user.dismissedAnnouncements : [];

    const announcement = await Announcement.findOne({
        isActive: true,
        _id: { $nin: dismissedIds }
    }).sort({ createdAt: -1 });

    res.status(200).json(announcement);
});

module.exports = {
    getAdminStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    sendBroadcast,
    getLatestAnnouncement
};
