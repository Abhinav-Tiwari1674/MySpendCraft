const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    preferences: {
        currency: { type: String, default: 'INR' },
        country: { type: String, default: 'India' }
    },
    securityQuestion: {
        type: String,
        required: [true, 'Please add a security question']
    },
    securityAnswer: {
        type: String,
        required: [true, 'Please add a security answer']
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    categoryBudgets: {
        type: Map,
        of: Number,
        default: {}
    },
    householdId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Household'
    },
    role: {
        type: String,
        enum: ['owner', 'member'],
        default: 'owner'
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified('securityAnswer')) {
        const salt = await bcrypt.genSalt(10);
        // Clean white spaces and convert to lowercase for better matching
        const cleanAnswer = this.securityAnswer.toLowerCase().trim();
        this.securityAnswer = await bcrypt.hash(cleanAnswer, salt);
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.matchSecurityAnswer = async function (enteredAnswer) {
    const cleanAnswer = enteredAnswer.toLowerCase().trim();
    return await bcrypt.compare(cleanAnswer, this.securityAnswer);
};

module.exports = mongoose.model('User', userSchema);
