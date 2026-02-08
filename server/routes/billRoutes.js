const express = require('express');
const router = express.Router();
const {
    getBills,
    createBill,
    updateBill,
    deleteBill,
    markAsPaid
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBills).post(protect, createBill);
router.route('/:id').put(protect, updateBill).delete(protect, deleteBill);
router.put('/:id/pay', protect, markAsPaid);

module.exports = router;
