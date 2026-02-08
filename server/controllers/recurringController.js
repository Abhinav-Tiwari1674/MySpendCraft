const asyncHandler = require('express-async-handler');
const RecurringBill = require('../models/RecurringBill');
const Expense = require('../models/Expense');

// @desc    Get all recurring bills for user
// @route   GET /api/recurring
// @access  Private
const getRecurringBills = asyncHandler(async (req, res) => {
    const bills = await RecurringBill.find({ user: req.user._id });
    res.json(bills);
});

// @desc    Create a recurring bill
// @route   POST /api/recurring
// @access  Private
const createRecurringBill = asyncHandler(async (req, res) => {
    const { title, amount, category, frequency, startDate, wallet } = req.body;

    if (!title || !amount || !category || !frequency || !startDate) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const bill = await RecurringBill.create({
        user: req.user._id,
        title,
        amount,
        category,
        frequency,
        startDate,
        wallet: wallet || 'Cash',
        nextDate: startDate,
        isActive: true
    });

    res.status(201).json(bill);
});

// @desc    Update a recurring bill
// @route   PUT /api/recurring/:id
// @access  Private
const updateRecurringBill = asyncHandler(async (req, res) => {
    const bill = await RecurringBill.findById(req.params.id);

    if (bill && bill.user.toString() === req.user._id.toString()) {
        const updatedBill = await RecurringBill.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedBill);
    } else {
        res.status(404);
        throw new Error('Bill not found');
    }
});

// @desc    Delete a recurring bill
// @route   DELETE /api/recurring/:id
// @access  Private
const deleteRecurringBill = asyncHandler(async (req, res) => {
    const bill = await RecurringBill.findById(req.params.id);

    if (bill && bill.user.toString() === req.user._id.toString()) {
        await bill.deleteOne();
        res.json({ message: 'Bill removed' });
    } else {
        res.status(404);
        throw new Error('Bill not found');
    }
});

// @desc    Process recurring bills (check and generate expenses)
// @route   POST /api/recurring/process
// @access  Private
const processRecurringBills = asyncHandler(async (req, res) => {
    const bills = await RecurringBill.find({ user: req.user._id, isActive: true });
    const now = new Date();
    const generatedCount = 0;

    for (let bill of bills) {
        let nextDate = new Date(bill.nextDate);

        while (nextDate <= now) {
            // Generate Expense
            await Expense.create({
                user: bill.user,
                title: `${bill.title} (Recurring)`,
                amount: bill.amount,
                type: 'expense',
                category: bill.category,
                wallet: bill.wallet,
                date: nextDate,
                note: `Automatically generated from recurring bill: ${bill.title}`
            });

            // Update nextDate based on frequency
            if (bill.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
            else if (bill.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
            else if (bill.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
            else if (bill.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

            bill.lastGenerated = new Date();
        }

        bill.nextDate = nextDate;
        await bill.save();
    }

    res.json({ success: true, message: 'Processed recurring bills' });
});

module.exports = {
    getRecurringBills,
    createRecurringBill,
    updateRecurringBill,
    deleteRecurringBill,
    processRecurringBills
};
