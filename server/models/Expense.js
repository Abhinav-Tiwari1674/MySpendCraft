const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    amount: {
        type: Number,
        required: [true, 'Please add a positive amount']
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Please select type']
    },
    category: {
        type: String,
        required: [true, 'Please select a category']
    },
    date: {
        type: Date,
        default: Date.now
    },
    note: {
        type: String,
        default: ''
    },
    billUrl: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        default: 0
    },
    wallet: {
        type: String,
        enum: ['Cash', 'Bank', 'Credit Card'],
        default: 'Cash'
    },
    householdId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Household'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
