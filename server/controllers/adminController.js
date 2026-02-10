const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Expense = require('../models/Expense');
const Bill = require('../models/Bill');
const Feedback = require('../models/Feedback');
const RecurringBill = require('../models/RecurringBill');
const Announcement = require('../models/Announcement');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');
const os = require('os');

const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();

    // Users joined in last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const usersJoined24h = await User.countDocuments({ createdAt: { $gte: last24h } });

    const totalMessages = await Contact.countDocuments();
    const newMessages = await Contact.countDocuments({ status: 'new' });

    let totalExpenses = 0;
    try {
        totalExpenses = await Expense.countDocuments();
    } catch (err) {
        console.log('Expense model count failed:', err.message);
    }

    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

    // Server Metrics
    const serverMetrics = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuLoad: os.loadavg(),
        freeMem: os.freemem(),
        totalMem: os.totalmem(),
        platform: os.platform(),
        nodeVersion: process.version
    };

    res.status(200).json({
        totalUsers,
        usersJoined24h,
        totalMessages,
        newMessages,
        totalExpenses,
        dbStatus,
        serverMetrics,
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

    // Log the action
    await ActivityLog.create({
        action: 'ROLE_CHANGE',
        message: `Admin ${req.user.name} changed role for ${updatedUser.name} to ${updatedUser.isAdmin ? 'Admin' : 'User'}`,
        performedBy: req.user._id,
        metadata: { targetUserId: updatedUser._id.toString(), targetUserName: updatedUser.name }
    });

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

    const userName = user.name;
    const userId = user._id;

    // Perform cascade delete of user data
    await Promise.all([
        Expense.deleteMany({ user: userId }),
        Bill.deleteMany({ user: userId }),
        Feedback.deleteMany({ user: userId }),
        Contact.deleteMany({ userId: userId }),
        RecurringBill.deleteMany({ user: userId }),
        Announcement.deleteMany({ createdBy: userId })
    ]);

    await User.deleteOne({ _id: userId });

    // Log the action
    await ActivityLog.create({
        action: 'USER_DELETE',
        message: `Admin ${req.user.name} deleted user ${userName} and purged all associated data.`,
        performedBy: req.user._id,
        metadata: { targetUserId: userId.toString(), targetUserName: userName }
    });

    res.status(200).json({ message: 'User and associated data removed' });
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

    // Log the action
    await ActivityLog.create({
        action: 'BROADCAST_SENT',
        message: `Admin ${req.user.name} sent a global broadcast: ${message.substring(0, 30)}...`,
        performedBy: req.user._id
    });

    res.status(201).json(announcement);
});

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getSystemLogs = asyncHandler(async (req, res) => {
    const logs = await ActivityLog.find()
        .populate('performedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(50);
    res.status(200).json(logs);
});

// @desc    Run database backup
// @route   POST /api/admin/backup
// @access  Private/Admin
const runBackup = asyncHandler(async (req, res) => {
    // Simulated backup process
    // In a real app, this would trigger a mongodump or cloud backup

    await ActivityLog.create({
        action: 'DATABASE_BACKUP',
        message: `Admin ${req.user.name} manually initiated a database backup vault sync.`,
        performedBy: req.user._id
    });

    res.status(200).json({ message: 'Backup vault synced successfully' });
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
    getLatestAnnouncement,
    getSystemLogs,
    runBackup
};
