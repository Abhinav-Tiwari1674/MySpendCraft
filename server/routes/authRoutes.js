const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    updatePreferences,
    updateProfile,
    forgotPasswordFetchQuestion,
    resetPasswordWithAnswer,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPasswordFetchQuestion);
router.post('/reset-password-answer', resetPasswordWithAnswer);

module.exports = router;
