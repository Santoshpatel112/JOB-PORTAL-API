import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URL;
        
        if (!mongoURI) {
            throw new Error("MongoDB connection string is not defined in .env file");
        }

        // Remove deprecated options
        await mongoose.connect(mongoURI, {
            // Removed deprecated options
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
        });
        
        console.log("✅ Successfully connected to MongoDB Atlas");

        // Optional: Add event listeners for connection states
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to database');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from database');
        });

        return mongoose.connection;
    } catch (error) {
        console.error('❌ Failed to connect to database:', error);
        
        // Provide more specific guidance based on error
        if (error.message.includes('IP whitelist')) {
            console.error('🌐 Action Required: Whitelist your current IP address in MongoDB Atlas');
            console.error('Steps:');
            console.error('1. Go to MongoDB Atlas > Network Access');
            console.error('2. Add current IP address or allow access from anywhere (not recommended for production)');
        }

        process.exit(1); // Exit process with failure
    }
};

export default connectDB;