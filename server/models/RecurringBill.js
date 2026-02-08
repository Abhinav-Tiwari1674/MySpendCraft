const mongoose = require('mongoose');

const recurringBillSchema = mongoose.Schema({
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
        required: [true, 'Please add an amount']
    },
    category: {
        type: String,
        required: [true, 'Please select a category']
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        default: 'expense'
    },
    wallet: {
        type: String,
        enum: ['Cash', 'Bank', 'Credit Card'],
        default: 'Cash'
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: [true, 'Please select frequency']
    },
    startDate: {
        type: Date,
        required: [true, 'Please select start date']
    },
    nextDate: {
        type: Date
    },
    lastGenerated: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RecurringBill', recurringBillSchema);
