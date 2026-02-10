const express = require('express');
const router = express.Router();
const {
    createContact,
    getContacts,
    getMyMessages,
    replyToContact,
    updateContactStatus,
    getUnreadReplyCount,
    markMessagesAsRead,
    deleteContact
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createContact);
router.get('/', protect, admin, getContacts);
router.get('/my', protect, getMyMessages);
router.get('/unread-count', protect, getUnreadReplyCount);
router.put('/mark-read', protect, markMessagesAsRead);
router.post('/:id/reply', protect, admin, replyToContact);
router.patch('/:id', protect, admin, updateContactStatus);
router.delete('/:id', protect, admin, deleteContact);

module.exports = router;
