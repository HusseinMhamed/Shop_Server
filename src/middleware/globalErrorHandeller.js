import { AppError } from "../utils/AppError.js"

export const globalErrorHandeller =(err,req,res,next)=>{
    let message , status;
    if(err instanceof AppError){
        message = err.message;
        status = err.status
    }else{
        message = err.message || "internal server error";
        status = err.status || 500;
    }

    res.status(status).json({success: false, message})
}