import mongoose from "mongoose";
const jobSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    requariments:[{
        type:String,
        required:true
    }],
    salary:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    jobtype:{
        type:String,
        required:true
    },
    position:{
        type:Number,
        required:true
    },
    company:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
        required:true
    },
    createdby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"USER",
        required:true
    },
    application:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"application",
    },
    
},{timestamps:true});
 const JOB=mongoose.model("JOB",jobSchema);
 export default JOB;