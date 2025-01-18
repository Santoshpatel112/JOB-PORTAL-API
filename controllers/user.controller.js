import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
dotenv.config();


// Register
export const register=async(req,res)=>{
    try {
        const {fullname,email,password,phoneNumber,role}=req.body;
        if(!fullname || !email || !password || !phoneNumber || !role){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const user= await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"User already exists 😊"
            })
        }
        const hashpassword=await bcrypt.hash(password,10); // bcrypt the password

            await User.create({
                fullname,
                email,
                password:hashpassword,
                phoneNumber,
                role
            })
            res.status(200).json({
                success:true,
                message:"User created successfully , please login 😀"
            })
        }
     catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}

//Login
export const Login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validation
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        // Validate password
        const ispasswordMatch = await bcrypt.compare(password, user.password);
        if (!ispasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password",
            });
        }

        // Validate role
        if (user.role !== role) {
            return res.status(400).json({
                success: false,
                message: "Account does not exist with the current role",
            });
        }

        // Create token
        const tokedata = { userId: user._id };
        const token = jwt.sign(tokedata, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

        // Prepare user data for response
        user = {
            userId: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            profile: user.profile,
        };

        // Set cookie before sending response
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        // Send response
        res.status(200).json({
            success: true,
            message: "Login successfully",
            user,
        });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Logout 

export const Logout=async(req,res)=>{
    try {
        res.clearCookie("token"); // clear cookie
        return res.status(200).json({
            success:true,
            message:"Logout successfully 😊"
        })
        
    } catch (error) {
        console.log("error",error);
        

       return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
export const Updateprofile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role, bio, skills } = req.body;
        const file = req.file;

        // Validate required fields
        const missingFields = [];
        if (!fullname) missingFields.push('fullname');
        if (!email) missingFields.push('email');
        if (!phoneNumber) missingFields.push('phoneNumber');
        if (!password) missingFields.push('password');
        if (!role) missingFields.push('role');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Required fields missing: ${missingFields.join(', ')}`
            });
        }

        const userID = req.id; // user id from authentication middleware
        const user = await User.findById(userID);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if(fullname)user.fullname=fullname
        if(email)user.email=email
        if(phoneNumber)user.phoneNumber=phoneNumber
        if(password)user.password=password
        if(role)user.role=role
        
        // Update user fields
        user.fullname = fullname;
        user.email = email;
        user.phoneNumber = phoneNumber;
        user.role = role;

        // Optional fields with null checks
        if (bio) {
            user.profile = user.profile || {}; // Ensure profile object exists
            user.profile.bio = bio;
        }

        // Handle skills with null check and type validation
        if (skills && typeof skills === 'string') {
            const skillsArray = skills.split(",").map(skill => skill.trim());
            user.profile = user.profile || {}; // Ensure profile object exists
            user.profile.skills = skillsArray;
        }

        // Optional password update with hashing
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Handle file upload (placeholder for cloudinary)
        // if (file) {
        //     // Cloudinary upload logic will go here
        // }

        await user.save(); // Save updated user

        // Prepare response object
        const updatedUser = {
            userId: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully 😊",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};