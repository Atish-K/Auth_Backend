const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://atish0518:NJSjbyYuYmp5oXX0@adminapp.cn4is.mongodb.net/adminapp?retryWrites=true&w=majority");
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;