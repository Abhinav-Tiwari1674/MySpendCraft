const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers, updateUserRole } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getAdminStats);
router.get('/users', protect, admin, getAllUsers);
router.patch('/users/:id', protect, admin, updateUserRole);

module.exports = router;
