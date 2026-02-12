const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const removeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = process.argv[2];

        if (!email) {
            console.log('Please provide an email address as an argument.');
            console.log('Usage: node remove_admin.js <email>');
            process.exit(1);
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.isAdmin = false;
        await user.save();

        console.log(`User ${user.username} (${user.email}) is NO LONGER an Admin.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

removeAdmin();
