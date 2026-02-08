const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');

// @desc    Get expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
    let query = { user: req.user.id };

    if (req.user.householdId) {
        query = { householdId: req.user.householdId };
    }

    const expenses = await Expense.find(query).populate('user', 'name').sort({ date: -1 });
    res.status(200).json(expenses);
});

// @desc    Set expense
// @route   POST /api/expenses
// @access  Private
const setExpense = asyncHandler(async (req, res) => {
    console.log(`Received request to set expense: ${req.body.title}, Payload size: ${JSON.stringify(req.body).length / 1024} KB`);
    if (!req.body.title || !req.body.amount || !req.body.category || !req.body.type) {
        res.status(400);
        throw new Error('Please include all fields: title, amount, category, type');
    }

    const expense = await Expense.create({
        title: req.body.title,
        amount: req.body.amount,
        category: req.body.category,
        type: req.body.type,
        user: req.user.id,
        householdId: req.user.householdId,
        date: req.body.date,
        note: req.body.note || '',
        billUrl: req.body.billUrl || '',
        quantity: req.body.quantity || 0,
        wallet: req.body.wallet || 'Cash'
    });

    console.log('Expense created successfully:', expense._id);
    res.status(200).json(expense);
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(400);
        throw new Error('Expense not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the expense user OR same household
    const isSameUser = expense.user.toString() === req.user.id;
    const isSameHousehold = req.user.householdId && expense.householdId && expense.householdId.toString() === req.user.householdId.toString();

    if (!isSameUser && !isSameHousehold) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
        }
    );

    res.status(200).json(updatedExpense);
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(400);
        throw new Error('Expense not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the expense user OR same household
    const isSameUser = expense.user.toString() === req.user.id;
    const isSameHousehold = req.user.householdId && expense.householdId && expense.householdId.toString() === req.user.householdId.toString();

    if (!isSameUser && !isSameHousehold) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await expense.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getExpenses,
    setExpense,
    updateExpense,
    deleteExpense,
};
