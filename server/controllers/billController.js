const asyncHandler = require('express-async-handler');
const Bill = require('../models/Bill');
const Expense = require('../models/Expense');

// @desc    Get all bills for user
// @route   GET /api/bills
// @access  Private
const getBills = asyncHandler(async (req, res) => {
    const bills = await Bill.find({ user: req.user.id }).sort({ dueDate: 1 });
    res.status(200).json(bills);
});

// @desc    Create a bill
// @route   POST /api/bills
// @access  Private
const createBill = asyncHandler(async (req, res) => {
    const { title, amount, dueDate, category, isRecurring, frequency } = req.body;

    if (!title || !amount || !dueDate) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const bill = await Bill.create({
        user: req.user.id,
        title,
        amount,
        dueDate,
        category,
        isRecurring,
        frequency
    });

    res.status(201).json(bill);
});

// @desc    Update a bill
// @route   PUT /api/bills/:id
// @access  Private
const updateBill = asyncHandler(async (req, res) => {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
        res.status(404);
        throw new Error('Bill not found');
    }

    // Check for user
    if (bill.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedBill = await Bill.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    });

    res.status(200).json(updatedBill);
});

// @desc    Delete a bill
// @route   DELETE /api/bills/:id
// @access  Private
const deleteBill = asyncHandler(async (req, res) => {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
        res.status(404);
        throw new Error('Bill not found');
    }

    // Check for user
    if (bill.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await bill.deleteOne();
    res.status(200).json({ id: req.params.id });
});

// @desc    Mark bill as paid and create expense
// @route   PUT /api/bills/:id/pay
// @access  Private
const markAsPaid = asyncHandler(async (req, res) => {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
        res.status(404);
        throw new Error('Bill not found');
    }

    if (bill.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Update bill status
    bill.status = 'paid';
    await bill.save();

    // Create a corresponding expense
    await Expense.create({
        user: req.user.id,
        title: `Bill Paid: ${bill.title}`,
        amount: bill.amount,
        type: 'expense',
        category: bill.category,
        date: new Date(),
        description: `Automated payment record for bill: ${bill.title}`
    });

    res.status(200).json(bill);
});

module.exports = {
    getBills,
    createBill,
    updateBill,
    deleteBill,
    markAsPaid
};
