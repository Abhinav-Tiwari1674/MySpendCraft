const mongoose = require('mongoose');

const householdSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a household name']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    inviteCode: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Household', householdSchema);
