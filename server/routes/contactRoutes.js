const express = require('express');
const router = express.Router();
const { createContact, getContacts, updateContactStatus } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', createContact);
router.get('/', protect, admin, getContacts);
router.patch('/:id', protect, admin, updateContactStatus);

module.exports = router;
