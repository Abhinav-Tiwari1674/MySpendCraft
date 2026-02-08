const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');
const User = require('../models/User');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const createContact = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        res.status(400);
        throw new Error('Please fill all fields');
    }

    const contact = await Contact.create({
        name,
        email,
        message
    });

    res.status(201).json(contact);
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private
const getContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
});

// @desc    Update contact status
// @route   PATCH /api/contact/:id
// @access  Private
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

module.exports = {
    createContact,
    getContacts,
    updateContactStatus
};
