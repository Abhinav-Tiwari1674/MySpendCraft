const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./server/models/User');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const user = await User.findOne({ email: 'abhinav.tiwari1674@gmail.com' });
        if (user) {
            console.log('User found:', user);
        } else {
            console.log('User not found');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
