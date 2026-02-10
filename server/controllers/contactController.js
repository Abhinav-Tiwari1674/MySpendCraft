const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const createContact = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Please add a message');
    }

    const contact = await Contact.create({
        name: req.user.name,
        email: req.user.email,
        userId: req.user._id,
        message
    });

    res.status(201).json(contact);
});

// @desc    Get all contact messages (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
});

// @desc    Get my contact messages
// @route   GET /api/contact/my
// @access  Private
const getMyMessages = asyncHandler(async (req, res) => {
    const messages = await Contact.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(messages);
});

// @desc    Reply to a contact message (Admin only)
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
const replyToContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error('Message not found');
    }

    const { reply } = req.body;
    if (!reply) {
        res.status(400);
        throw new Error('Please add a reply message');
    }

    contact.adminReply = reply;
    contact.status = 'replied';

    await contact.save();

    // Log the reply action
    await ActivityLog.create({
        action: 'BROADCAST_SENT', // Using BROADCAST_SENT or adding new enum if needed
        message: `Admin ${req.user.name} replied to message from ${contact.name}`,
        performedBy: req.user._id,
        metadata: { contactId: contact._id.toString(), targetUserName: contact.name }
    });

    res.status(200).json(contact);
});

// @desc    Update contact status
// @route   PATCH /api/contact/:id
// @access  Private/Admin
const updateContactStatus = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error('Message not found');
    }

    const { status } = req.body;
    contact.status = status || contact.status;

    await contact.save();
    res.status(200).json(contact);
});

// @desc    Get unread admin replies count
// @route   GET /api/contact/unread-count
// @access  Private
const getUnreadReplyCount = asyncHandler(async (req, res) => {
    const count = await Contact.countDocuments({
        userId: req.user._id,
        status: 'replied',
        userRead: false
    });
    res.status(200).json({ count });
});

// @desc    Mark all messages as read by user
// @route   PUT /api/contact/mark-read
// @access  Private
const markMessagesAsRead = asyncHandler(async (req, res) => {
    await Contact.updateMany(
        { userId: req.user._id, status: 'replied' },
        { userRead: true }
    );
    res.status(200).json({ message: 'Messages marked as read' });
});

// @desc    Delete a contact message (Admin only)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error('Message not found');
    }

    await contact.deleteOne();

    // Log the deletion
    await ActivityLog.create({
        action: 'USER_DELETE', // Reusing OR add MESSAGE_DELETE
        message: `Admin ${req.user.name} deleted message from ${contact.name}`,
        performedBy: req.user._id,
        metadata: { contactId: contact._id.toString() }
    });

    res.status(200).json({ message: 'Message removed' });
});

module.exports = {
    createContact,
    getContacts,
    getMyMessages,
    replyToContact,
    updateContactStatus,
    getUnreadReplyCount,
    markMessagesAsRead,
    deleteContact
};
