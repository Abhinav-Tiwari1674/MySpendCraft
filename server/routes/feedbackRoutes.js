const express = require('express');
const router = express.Router();
const { createFeedback, getFeedbacks, updateFeedbackStatus } = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createFeedback)
    .get(protect, admin, getFeedbacks);

router.patch('/:id', protect, admin, updateFeedbackStatus);

module.exports = router;
