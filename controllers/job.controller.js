import Job from "../models/job.model.js";
import { User } from "../models/user.model.js";
import Company from "../models/company.model.js";

// Post a new job
export const PostJob = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            requariments, 
            salary, 
            location, 
            jobtype, 
            position, 
            companyId 
        } = req.body;
        
        const userId = req.id; // Authenticated user's ID

        // Validate required fields
        const missingFields = [];
        if (!title) missingFields.push('title');
        if (!description) missingFields.push('description');
        if (!requariments || requariments.length === 0) missingFields.push('requariments');
        if (!salary) missingFields.push('salary');
        if (!location) missingFields.push('location');
        if (!jobtype) missingFields.push('jobtype');
        if (!position) missingFields.push('position');
        if (!companyId) missingFields.push('companyId');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        // Create job
        const newJob = await Job.create({
            title,
            description,
            requariments,
            salary,
            location,
            jobtype,
            position,
            company: companyId,
            createdby: userId
        });

        return res.status(201).json({
            success: true,
            message: "Job created successfully",
            job: newJob
        });

    } catch (error) {
        console.error("Job Creation Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get all jobs with optional search
export const getalljob = async (req, res) => {
    try {
        const keyboard = req.query.keyboard || " ";
        const query = {
            $or: [
                { title: { $regex: keyboard, $options: "i" } },
                { description: { $regex: keyboard, $options: "i" } }
            ]
        };
        
        const jobs = await Job.find(query)
            .populate({
                path: 'company',
                model: Company,
                select: 'name description location'
            })
            .populate({
                path: 'createdby',
                model: User,
                select: 'fullname email role'
            });

        return res.status(200).json({
            success: true,
            total: jobs.length,
            jobs
        });

    } catch (error) {
        console.error("Get All Jobs Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get job by specific ID
export const getjobbyId = async (req, res) => {
    try {
        const jobId = req.params.id;
        
        // Validate job ID format
        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "Invalid job ID"
            });
        }

        const job = await Job.findById(jobId)
            .populate({
                path: 'company',
                model: Company,
                select: 'name description location website'
            })
            .populate({
                path: 'createdby',
                model: User,
                select: 'fullname email role'
            });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        return res.status(200).json({
            success: true,
            job,
            message: "Job found successfully"
        });

    } catch (error) {
        console.error("Get Job by ID Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get jobs created by admin/user
export const getadminjobs = async (req, res) => {
    try {
        const adminId = req.id;
        
        const jobs = await Job.find({ createdby: adminId })
            .populate({
                path: 'company',
                model: Company,
                select: 'name description location'
            })
            .populate({
                path: 'createdby',
                model: User,
                select: 'fullname email role'
            });

        if (!jobs.length) {
            return res.status(404).json({
                success: false,
                message: "No jobs found for this user"
            });
        }

        return res.status(200).json({
            success: true,
            total: jobs.length,
            jobs
        });

    } catch (error) {
        console.error("Get Admin Jobs Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Update an existing job
export const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;
        const updateData = req.body;

        // Find and validate job
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Ensure only job creator can update
        if (job.createdby.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this job"
            });
        }

        // Update job
        const updatedJob = await Job.findByIdAndUpdate(
            jobId, 
            updateData, 
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Job updated successfully",
            job: updatedJob
        });

    } catch (error) {
        console.error("Job Update Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Delete a job
export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        // Find and validate job
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Ensure only job creator can delete
        if (job.createdby.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this job"
            });
        }

        // Delete job
        await Job.findByIdAndDelete(jobId);

        return res.status(200).json({
            success: true,
            message: "Job deleted successfully"
        });

    } catch (error) {
        console.error("Job Deletion Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};