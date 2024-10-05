import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import {SUPER_ADMIN} from "../utils/constants.js";
import  {HouseMst} from "../models/HouseMst.js";
import  {BlockMst} from "../models/BlockMst.js";
import  {SocietyMst} from "../models/SocietyMst.js";
import  {User} from "../models/UserModel.js";
import Schema from "mongoose";
import { errors } from "./common.js";

dotenv.config();
export const verifyToken = (req, res, next) => {
  console.log("verifyToken called");
  const authHeader = req.headers.cookie;
  if (authHeader) {
    const token = authHeader.split("=")[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) return res.status(403).json(errors("Token is not valid!",res.statusCode));
      console.log("Token is valid ",user);
      const userDetails = await User.findOne({ _id: Schema.Types.ObjectId.createFromHexString(user.id)});
      if (!userDetails) return res.status(404).json(errors("User not found!",res.statusCode));
      req.user = userDetails;
      if(userDetails.role==SUPER_ADMIN &&!userDetails.societyId) req.user["isAdmin"]=true;
      next();
    });
  } else {
    return res.status(401).json(errors("You are not authenticated!",res.statusCode));
  }
};

export const emailValidator = (email) => {
    console.log(email);
  const re =/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return re.test(email);
};

export const userValidator = async (user) => {
  const errors = {};

  if (!emailValidator(user.email)) errors.email = "Invalid Email";
  if (!user.password) errors.password = "Password is required";
  if (!user.role) errors.role = "Role is required";
  if(!user.firstname) errors.firstname = "Firstname is required";
  if(!user.lastname) errors.lastname = "Lastname is required";
  if(!user.totalMembers) errors.totalMembers = "Total members is required";
  if(!user.street) errors.street = "Street is required";
  if(!user.locality) errors.locality = "Locality is required";
  if(!user.state) errors.state = "State is required";
  if(!user.country) errors.country = "Country is required";
  if(!user.zipCode) errors.zipCode = "Zip code is required";
  if(user.role!=SUPER_ADMIN && !user.userType) errors.userType = "User type is required";
  if(user.role!=SUPER_ADMIN && !user.houseNumber){
    errors.houseNumber = "House number is required";
  } 
  if(user.role!=SUPER_ADMIN && user.houseNumber){
    const house = await HouseMst.findOne({_id:Schema.Types.ObjectId.createFromHexString(user.houseNumber)});
    if(!house) errors.houseNumber = "House number is not found";
  }
  if(user.role!=SUPER_ADMIN &&  !user.societyId){
    errors.societyId = "Society ID is required";
  } 
  if(user.role!=SUPER_ADMIN && user.societyId){
    const society = await SocietyMst.findOne({_id:Schema.Types.ObjectId.createFromHexString(user.societyId)});
    if(!society) errors.societyId = "Society number is not found";
  }
  if(user.role!=SUPER_ADMIN &&  !user.blockNumber){
    errors.blockNumber = "Block number is required";
  }
  if(user.role!=SUPER_ADMIN && user.blockNumber) {
    const block = await BlockMst.findOne({_id:Schema.Types.ObjectId.createFromHexString(user.blockNumber)});
    if(!block) errors.blockNumber = "Block number is not found";
  }


  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };

};

export const houseValidator = async (house) => {
  const error = {};
  if(!house.name) error.name = "House name is required";
  // if(!house.totalMembers) error.totalMembers = "Total members is required";
  // if(!house.totalChildren) error.totalChildren = "Total children is required";
  // if(!house.totalAdults) error.totalAdults = "Total adults is required";
  if(!house.blockId) error.blockId = "Block ID is required";
  if(!house.societyId) error.societyId = "Society ID is required";
  if(!house.type) error.type = "House type is required";
  if(house.blockId){
    const block = await BlockMst.findOne({_id:Schema.Types.ObjectId.createFromHexString(house.blockId)});
    if(!block) error.blockId = "Block ID is not found";
  }
  if(house.societyId){
    const society = await SocietyMst.findOne({_id:Schema.Types.ObjectId.createFromHexString(house.societyId)});
    if(!society) error.societyId = "Society ID is not found";
  }
  return {
    error,
    isValid: Object.keys(error).length === 0,
  };
};

export const blockValidator = async (block) => {
  const error={};
  if(!block.name) error.name = "Block name is required";  
  if(!block.societyId) error.societyId = "Society ID is required";
  if(block.societyId){
    const society = await SocietyMst.findOne({_id:Schema.Types.ObjectId.createFromHexString(block.societyId)});
    if(!society) error.societyId = "Society ID is not found";
  }
  return {
    error,
    isValid: Object.keys(error).length === 0,
  };
};