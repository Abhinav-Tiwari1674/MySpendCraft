const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const makeAdmin = async () => {
    try {
        const email = process.argv[2];
        if (!email) {
            console.error('Usage: node scripts/makeAdmin.js <email>');
            process.exit(1);
        }

        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('MONGO_URI not found in env');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected successfully.');

        // Defer requiring model until AFTER connection (sometimes helps with Mongoose quirks)
        const User = require('../server/models/User');

        console.log(`Searching for user: ${email}`);
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (!user) {
            console.log('User not found. Checking all users...');
            const allUsers = await User.find({}, 'email').limit(10);
            console.log('Registered emails:', allUsers.map(u => u.email).join(', ') || 'None');
            process.exit(1);
        }

        user.isAdmin = true;
        await user.save();
        console.log(`SUCCESS: ${user.email} is now an admin!`);
        process.exit(0);

    } catch (err) {
        console.error('FATAL ERROR:', err.message);
        if (err.stack) console.error(err.stack);
        process.exit(1);
    }
};

makeAdmin();
