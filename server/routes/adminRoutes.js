const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers, updateUserRole, deleteUser, sendBroadcast } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getAdminStats);
router.get('/users', protect, admin, getAllUsers);
router.patch('/users/:id', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);
router.post('/broadcast', protect, admin, sendBroadcast);

module.exports = router;
