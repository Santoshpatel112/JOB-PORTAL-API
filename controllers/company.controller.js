import Company from "../models/company.model.js";

export const Registercompany=async (req,res)=>{
    try {
        const {companyName}=req.body;
        if(!companyName){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const existcompany=await Company.findOne({name:companyName});
        if(existcompany){
            return res.status(400).json({
                success:false,
                message:"Company already exists"
            })
        }
        existcompany=await Company.create({
            name:companyName,
            userId:req.id

        })
        return res.status(200).json({
            success:true,
            message:"Company created successfully"
        })
        
        
    } catch (error) {
        console.error(error);
        console.log(error);
        
    }
}

// get Company

export const getCompany=async(req,res)=>{
    try {
        const userID=req.id;
        const companies=await Company.find({userId:userID});   
        if(!companies){
            return res.status(400).json({
                success:false,
                message:"Company not found"
            })
        }
        return res.status(200).json({
            success:true,
            count:companies.length,
            data:companies,

            message:"Company found successfully",
            companies
        })
    } catch (error) {
        console.log(error);
        
    }
}

// getCompanyById

export const getCompanybyId=async (req,res)=>{
try {
    const companyid=req.params.id; //company name find by id
    const company=await Company.findById(companyid);
    if(!company){
        return res.status(400).json({
            success:false,
            message:"Company not found"
        })
    }
    return res.status(200).json({
        success:true,
        company
    })
    
} catch (error) {
    console.log(error);
    
}
}

// upadte company

export const Updatecompany=async (req,res)=>{
    try {
        const {name,description,website,location}=req.body;
        const file=req.file;
        // cloudnery idhar aayega
        const updatData={
            name,
            description,
            website,
            location,}
            const company=await Company.findByIdAndUpdate(req.params.id,updatData,{new:true});
            if(!company){
                return res.status(400).json({
                    success:false,
                    message:"Company not found"
                })
            }
            return res.status(200).json({
                message:"Company updated successfully",
                success:true,
                company
            })
    } catch (error) {
        console.log(error);
        
    }
}