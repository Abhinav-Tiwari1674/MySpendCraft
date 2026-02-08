const express = require('express');
const router = express.Router();
const {
    getRecurringBills,
    createRecurringBill,
    updateRecurringBill,
    deleteRecurringBill,
    processRecurringBills
} = require('../controllers/recurringController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getRecurringBills)
    .post(protect, createRecurringBill);

router.route('/:id')
    .put(protect, updateRecurringBill)
    .delete(protect, deleteRecurringBill);

router.post('/process', protect, processRecurringBills);

module.exports = router;
