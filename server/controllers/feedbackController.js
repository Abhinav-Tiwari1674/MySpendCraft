const asyncHandler = require('express-async-handler');
const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = asyncHandler(async (req, res) => {
    const { name, email, message, rating } = req.body;

    if (!message || !rating) {
        res.status(400);
        throw new Error('Please provide message and rating');
    }

    const feedback = await Feedback.create({
        user: req.user._id,
        name: name || req.user.name,
        email: email || req.user.email,
        message,
        rating
    });

    res.status(201).json(feedback);
});

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
const getFeedbacks = asyncHandler(async (req, res) => {
    const feedbacks = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
});

// @desc    Update feedback status
// @route   PATCH /api/feedback/:id
// @access  Private/Admin
const updateFeedbackStatus = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
        res.status(404);
        throw new Error('Feedback not found');
    }

    feedback.status = req.body.status || feedback.status;
    const updatedFeedback = await feedback.save();

    res.status(200).json(updatedFeedback);
});

module.exports = {
    createFeedback,
    getFeedbacks,
    updateFeedbackStatus
};
