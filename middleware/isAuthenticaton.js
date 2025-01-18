import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthentication = async (req, res, next) => {
    try {
        // Check for token in cookies or Authorization header
        let token = req.cookies?.token;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        // If still no token, return unauthorized
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login."
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("Decoded JWT payload:", decoded);

        // Find user in database, checking multiple possible ID fields
        const user = await User.findById(
            decoded.userId || 
            decoded.id || 
            decoded._id
        );

        if (!user) {
            console.error('User not found for ID:', 
                decoded.userId || 
                decoded.id || 
                decoded._id
            );
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again.",
                details: {
                    userId: decoded.userId,
                    id: decoded.id,
                    _id: decoded._id
                }
            });
        }

        // Attach user to request
        req.user = user;
        req.id = user._id;

        // Continue to next middleware
        next();
    } catch (error) {
        console.error('Authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please login again."
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed. Please try again."
        });
    }
};

export default isAuthentication;