import User from "../models/User.mjs"
import { AppError } from "./AppError.js";
export const makeUserAdmin = async(req,res)=>{
    const {id} = req.body
    const user = await User.findByIdAndUpdate(id,{role:'admin'},
        {new: true , runValidators:true}
    );

    if(!user){
        throw new AppError("user not found", 403);
    }
    res.status(200).json({message:`the user ${user.first_name} is admin now`})
    // or
    // user.role = 'admin'
    // user.save()
     
}