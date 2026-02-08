const express = require('express');
const router = express.Router();
const {
    getHousehold,
    createHousehold,
    joinHousehold,
    leaveHousehold
} = require('../controllers/householdController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getHousehold)
    .post(protect, createHousehold);

router.post('/join', protect, joinHousehold);
router.post('/leave', protect, leaveHousehold);

module.exports = router;
