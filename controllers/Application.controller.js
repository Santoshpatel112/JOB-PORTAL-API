// import {Application} from '../models/application.model.js';
// import JOB from '../models/job.model.js';
import mongoose from 'mongoose';
import { Application } from '../models/application.model.js';
import JOB from '../models/job.model.js';
import { User } from '../models/user.model.js';

export const applyjob=async (req,res)=>{
    try {
        const userId=req.id;
        const jobId=req.params.id;
        if(!jobId){
            return res.status(400).json({
                success:false,
                message:"Job not found job id is requirded"
            }) 
        };
        // check if the user has alredy apply for the job
        const existApplication=await Application.findOne({job:jobId,applicant:userId});
        if(existApplication){
            return res.status(400).json({
                success:false,
                message:"You have already applied for this job"
            })
        }
        // check the job exits
       const job=await JOB.findById(jobId);
       if(!job){
        return res.status(400).json({
            success:false,
            message:"Job not found"
        })
       }

       // create application
       const newappliction =await Application.create({
        job:jobId,
        applicant:userId
       })
       job.application.push(newappliction._id);
       await job.save();
       return res.status(200).json({
        success:true,
        message:"Application created successfully"
       })

    } catch (error) {
        console.log(error);
        
    }
};
export const getappliedjob = async (req, res) => {
    try {
        const userId = req.id;
        
        // Validate user ID
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const applications = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'job',
                model: 'JOB',  // Use exact model name from job.model.js
                populate: {
                    path: 'company',
                    model: 'Company',
                    select: 'name description location'
                }
            })
            .populate({
                path: 'applicant',
                model: 'User',
                select: 'fullname email'
            });

        if (!applications || applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No applications found",
                count: 0,
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            count: applications.length,
            data: applications,
            message: "Applications found successfully"
        });

    } catch (error) {
        console.error("Get Applied Jobs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
export const getApplicant = async (req, res) => {
    try {
        const jobId = req.params.id;
        
        // Validate job ID
        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "Invalid job ID"
            });
        }

        // First, check if the job exists
        const jobExists = await JOB.findById(jobId);
        if (!jobExists) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Find all applications for this job
        const applications = await Application.find({ job: jobId })
            .populate({
                path: 'applicant',
                model: 'User',
                select: 'fullname email profile'
            });

        // Check if there are any applications
        if (!applications || applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No applicants found for this job",
                applicants: []
            });
        }

        // Detailed logging for debugging
        console.log(`Job ID: ${jobId}`);
        console.log(`Total Applications: ${applications.length}`);
        applications.forEach((app, index) => {
            console.log(`Application ${index + 1}:`, {
                applicantId: app.applicant?._id,
                applicantName: app.applicant?.fullname,
                status: app.status
            });
        });

        return res.status(200).json({
            success: true,
            total: applications.length,
            applicants: applications,
            message: "Applicants retrieved successfully"
        });

    } catch (error) {
        console.error("Get Applicants Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;
        const userId = req.id;

        // Validate input
        if (!status || !applicationId) {
            return res.status(400).json({
                success: false,
                message: "Status and Application ID are required"
            });
        }

        // Find the application first
        const application = await Application.findById(applicationId);
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        // Find the associated job with full details
        const job = await JOB.findById(application.job)
            .populate({
                path: 'createdby',
                model: 'User', // Explicitly specify the model name
                select: 'fullname email'
            });
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Associated job not found"
            });
        }

        // Normalize user IDs to strings for comparison
        const jobCreatorId = job.createdby ? 
            (job.createdby._id instanceof mongoose.Types.ObjectId 
                ? job.createdby._id.toString() 
                : String(job.createdby._id)) 
            : null;
        
        const requestUserId = userId ? 
            (typeof userId === 'object' && userId instanceof mongoose.Types.ObjectId 
                ? userId.toString() 
                : String(userId)) 
            : null;

        // Detailed logging for debugging
        console.log('Update Status Request Details:', {
            applicationId,
            requestUserId,
            jobCreatorId,
            jobTitle: job.title,
            jobCreatorDetails: job.createdby ? {
                _id: job.createdby._id,
                fullname: job.createdby.fullname,
                email: job.createdby.email
            } : null,
            status,
            userIdType: typeof userId,
            jobCreatorType: typeof job.createdby
        });

        // Check if the user is authorized to update the status (job creator)
        if (!jobCreatorId || !requestUserId) {
            console.warn('Authorization Validation Failed:', {
                jobCreatorId: !!jobCreatorId,
                requestUserId: !!requestUserId
            });

            return res.status(403).json({
                success: false,
                message: "Invalid user or job creator information",
                details: {
                    hasJobCreatorId: !!jobCreatorId,
                    hasRequestUserId: !!requestUserId
                }
            });
        }

        // Strict comparison of user IDs
        if (requestUserId !== jobCreatorId) {
            console.warn('Authorization Failed:', {
                requestUserId,
                jobCreatorId,
                mismatch: requestUserId !== jobCreatorId
            });

            return res.status(403).json({
                success: false,
                message: "Not authorized to update application status",
                details: {
                    requestUserId,
                    jobCreatorId,
                    jobCreatorName: job.createdby?.fullname || 'Unknown'
                }
            });
        }

        // Validate status
        const validStatuses = ["pending", "accepted", "rejected"];
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                validStatuses
            });
        }

        // Update application status
        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            success: true,
            message: "Application status updated successfully",
            application: {
                _id: application._id,
                status: application.status,
                jobTitle: job.title
            }
        });

    } catch (error) {
        console.error("Update Application Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};