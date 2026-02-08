const asyncHandler = require('express-async-handler');
const Household = require('../models/Household');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Get user's household
// @route   GET /api/household
// @access  Private
const getHousehold = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('householdId');

    if (!user.householdId) {
        return res.status(200).json(null);
    }

    const household = await Household.findById(user.householdId)
        .populate('owner', 'name email')
        .populate('members', 'name email');

    res.json(household);
});

// @desc    Create a household
// @route   POST /api/household
// @access  Private
const createHousehold = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a household name');
    }

    // Generate a unique invite code
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const household = await Household.create({
        name,
        owner: req.user._id,
        members: [req.user._id],
        inviteCode
    });

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
        householdId: household._id,
        role: 'owner'
    });

    res.status(201).json(household);
});

// @desc    Join a household
// @route   POST /api/household/join
// @access  Private
const joinHousehold = asyncHandler(async (req, res) => {
    const { inviteCode } = req.body;

    const household = await Household.findOne({ inviteCode });

    if (!household) {
        res.status(404);
        throw new Error('Invalid invite code');
    }

    // Check if user is already in this household
    if (household.members.includes(req.user._id)) {
        res.status(400);
        throw new Error('Already a member of this household');
    }

    // Add member to household
    household.members.push(req.user._id);
    await household.save();

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
        householdId: household._id,
        role: 'member'
    });

    res.status(200).json(household);
});

// @desc    Leave household
// @route   POST /api/household/leave
// @access  Private
const leaveHousehold = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user.householdId) {
        res.status(400);
        throw new Error('Not in a household');
    }

    const household = await Household.findById(user.householdId);

    if (user.role === 'owner') {
        res.status(400);
        throw new Error('Owner cannot leave. Delete the household instead.');
    }

    // Remove member from household
    household.members = household.members.filter(id => id.toString() !== req.user._id.toString());
    await household.save();

    // Update user
    user.householdId = undefined;
    user.role = 'owner'; // Default back to owner of own data
    await user.save();

    res.json({ message: 'Left household' });
});

module.exports = {
    getHousehold,
    createHousehold,
    joinHousehold,
    leaveHousehold
};
