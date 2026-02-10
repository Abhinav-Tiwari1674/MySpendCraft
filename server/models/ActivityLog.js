const mongoose = require('mongoose');

const activityLogSchema = mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['USER_REGISTER', 'USER_DELETE', 'ROLE_CHANGE', 'BROADCAST_SENT', 'DATABASE_BACKUP', 'SYSTEM_CLEANUP', 'SECURITY_ALERT']
    },
    message: {
        type: String,
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    metadata: {
        type: mongoose.Schema.Types.Map,
        of: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
