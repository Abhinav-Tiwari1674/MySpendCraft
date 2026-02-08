const mongoose = require('mongoose');

const billSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a bill title']
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount']
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    dueDate: {
        type: Date,
        required: [true, 'Please add a due date']
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    frequency: {
        type: String, // e.g., 'monthly', 'yearly'
    },
    status: {
        type: String,
        enum: ['unpaid', 'paid', 'overdue'],
        default: 'unpaid'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bill', billSchema);
