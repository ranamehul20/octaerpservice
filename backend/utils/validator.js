import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { SUPER_ADMIN, NOTICE_BLOCK_WISE, NOTICE_DEFAULT } from "./constants.js";
import { HouseMst } from "../models/HouseMst.js";
import { BlockMst } from "../models/BlockMst.js";
import { SocietyMst } from "../models/SocietyMst.js";
import { User } from "../models/UserModel.js";
import { Cities } from "../models/Cities.js";
import { Countries } from "../models/Countries.js";
import { States } from "../models/States.js";
import Schema from "mongoose";
import { errors } from "./common.js";
import { ApiLogs } from "../models/ApiLogs.js";

dotenv.config();
export const verifyToken = async (req, res, next) => {
  console.log("verifyToken called");
  const cookies = req.headers.cookie;
  console.log("cookies", cookies);
  const cookieObj = {};
  cookies && cookies.split(';').forEach(cookie => {
    const [name, value] = cookie.split('=').map(c => c.trim());
    cookieObj[name] = decodeURIComponent(value);
  });
  const accessToken = cookieObj.accessToken ? cookieObj.accessToken.split("=")[1].split(";")[0] : "";
  const refreshToken = cookieObj.refreshToken ? cookieObj.refreshToken.split("=")[1].split(";")[0] : "";
  if (!accessToken && !refreshToken) {
    return res
      .status(401)
      .json(errors("You are not authenticated!", res.statusCode));
  }
  try {
    const decode = await jwt.verify(accessToken, process.env.JWT_SECRET);
    console.log("decode",decode);
    if (!decode) {
      if (!refreshToken) {
        return res
          .status(403)
          .json(errors("Token is not valid!", res.statusCode));
      }
      try {
        const decoded = await jwt.verify(refreshToken, process.env.JWT_SECRET);
        if (!decoded) {
          return res
            .status(403)
            .json(errors("Token is not valid!", res.statusCode));
        }
        const userDetails = await User.findOne({
          _id: Schema.Types.ObjectId.createFromHexString(decoded.id),
        });
        if (!userDetails)
          return res.status(404).json(errors("User not found!", res.statusCode));
        req.user = userDetails;
        if (userDetails.role == SUPER_ADMIN){
          req.user["isAdmin"] = true;
        }
        const accessToken = await jwt.sign(
          { id: decoded.id},
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        const authSerialized = serialize("accessToken", accessToken, {
          httpOnly: true,
          withCredentials: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        });
        res.cookie("accessToken", authSerialized);
        next();
      } catch (error) {
        return res.status(400).send("Invalid Token.");
      }
    }
    const userDetails = await User.findOne({
      _id: Schema.Types.ObjectId.createFromHexString(decode.id),
    });
    if (!userDetails)
      return res
        .status(404)
        .json(errors("User not found!", res.statusCode));
    req.user = userDetails;
    if (userDetails.role == SUPER_ADMIN){
      req.user["isAdmin"] = true;
    }
    next();
  } catch (e) {
    console.log("Error while verifying token", e);
    return res
      .status(401)
      .json(errors("You are not authenticated!", res.statusCode));
  }

  // , async (err, user) => {
  //   if (err) return res.status(403).json(errors("Token is not valid!",res.statusCode));
  //   console.log("Token is valid ",user);
  //   const userDetails = await User.findOne({ _id: Schema.Types.ObjectId.createFromHexString(user.id)});
  //   if (!userDetails) return res.status(404).json(errors("User not found!",res.statusCode));
  //   req.user = userDetails;
  //   if(userDetails.role==SUPER_ADMIN &&!userDetails.societyId) req.user["isAdmin"]=true;
  //   next();
  // });
};

export const emailValidator = (email) => {
  console.log(email);
  const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return re.test(email);
};

export const userValidator = async (user,method='create') => {
  const errors = {};
  console.log(user);
  if (!emailValidator(user.email)) errors.email = "Invalid Email";
  if (!user.password && method!='update') errors.password = "Password is required";
  if (!user.role) errors.role = "Role is required";
  if (!user.firstname) errors.firstname = "Firstname is required";
  if (!user.lastname) errors.lastname = "Lastname is required";
  if (!user.totalMembers) errors.totalMembers = "Total members is required";
  // if (!user.street) errors.street = "Street is required";
  // if (!user.locality) errors.locality = "Locality is required";
  // if (!user.state) errors.state = "State is required";
  // if (!user.country) errors.country = "Country is required";
  // if (!user.zipCode) errors.zipCode = "Zip code is required";
  if (user.role != SUPER_ADMIN && !user.userType)
    errors.userType = "User type is required";
  if (user.role != SUPER_ADMIN && !user.houseNumber) {
    errors.houseNumber = "House number is required";
  }
  if (user.role != SUPER_ADMIN && user.houseNumber) {
    const house = await HouseMst.findOne({
      _id: Schema.Types.ObjectId.createFromHexString(user.houseNumber),
    });
    if (!house) errors.houseNumber = "House number is not found";
  }
  if (user.role != SUPER_ADMIN && !user.societyId) {
    errors.societyId = "Society ID is required";
  }
  if (user.role != SUPER_ADMIN && user.societyId) {
    const society = await SocietyMst.findOne({
      _id: Schema.Types.ObjectId.createFromHexString(user.societyId),
    });
    if (!society) errors.societyId = "Society number is not found";
  }
  if (user.role != SUPER_ADMIN && !user.blockNumber) {
    errors.blockNumber = "Block number is required";
  }
  if (user.role != SUPER_ADMIN && user.blockNumber) {
    const block = await BlockMst.findOne({
      _id: Schema.Types.ObjectId.createFromHexString(user.blockNumber),
    });
    if (!block) errors.blockNumber = "Block number is not found";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

export const houseValidator = async (house) => {
  const error = {};
  if (!house.name) error.name = "House name is required";
  // if(!house.totalMembers) error.totalMembers = "Total members is required";
  // if(!house.totalChildren) error.totalChildren = "Total children is required";
  // if(!house.totalAdults) error.totalAdults = "Total adults is required";
  if (!house.blockId) error.blockId = "Block ID is required";
  if (!house.societyId) error.societyId = "Society ID is required";
  if (!house.type) error.type = "House type is required";
  if (house.blockId) {
    const block = await BlockMst.findOne({
      _id: Schema.Types.ObjectId.createFromHexString(house.blockId),
    });
    if (!block) error.blockId = "Block ID is not found";
  }
  if (house.societyId) {
    const society = await SocietyMst.findOne({
      _id: Schema.Types.ObjectId.createFromHexString(house.societyId),
    });
    if (!society) error.societyId = "Society ID is not found";
  }
  return {
    error,
    isValid: Object.keys(error).length === 0,
  };
};

export const blockValidator = async (block) => {
  const error = {};
  if (!block.name) error.name = "Block name is required";
  if (!block.societyId) error.societyId = "Society ID is required";
  if (block.societyId) {
    const society = await SocietyMst.findOne({
      _id: Schema.Types.ObjectId.createFromHexString(block.societyId),
    });
    if (!society) error.societyId = "Society ID is not found";
  }
  return {
    error,
    isValid: Object.keys(error).length === 0,
  };
};

export const societyValidator = async (society) => {
  const error = {};
  if (!society.name) error.name = "Society name is required";
  if (!society.street) error.street = "Address Line 1 is required";
  if (!society.locality) error.locality = "Locality is required";
  if (!society.city) error.city = "City is required";
  if (!society.state) error.state = "State is required";
  if (!society.country) error.country = "Country is required";
  if (!society.type) error.type = "Society type is required";
  if (!society.maintenanceAmount) error.maintenanceAmount = "Maintenance Amount is required";
  if (!society.maintenanceFrequency) error.maintenanceFrequency = "Maintenance Frequency is required";
  if (!society.dueDay) error.dueDay = "Due Day is required";
  if (society.city) {
    const cityId = await Cities.findOne({ id: society.city });
    if (!cityId) error.city = "City is not found";
  }
  if (society.state) {
    const stateId = await States.findOne({ id: society.state });
    if (!stateId) error.state = "State is not found";
  }
  if (society.country) {
    const countryId = await Countries.findOne({ id: society.country });
    if (!countryId) error.country = "Country is not found";
  }
  return {
    error,
    isValid: Object.keys(error).length === 0,
  };
};

export const noticeValidator = async (notice) => {
  const error = {};
  if (!notice.title) error.title = "Title is required";
  if (!notice.description) error.description = "Description is required";
  if (!notice.category) error.category = "Category is required";
  if (!notice.societyId) error.societyId ="Society is required";
  if (notice.blockId  && notice.blockId.length > 0) {
    notice.blockId.forEach( async (block) => {
      const blocks = await BlockMst.findOne({
        _id: Schema.Types.ObjectId.createFromHexString(block),
      });
      if (!blocks) error.blocks = "Block is not found";
    });
  }
  return {
    error,
    isValid: Object.keys(error).length === 0,
  }
};

export const createLogger = async (req, res, next) => {
  const logger = new ApiLogs({
    method: req.method,
    url: req.url,
    headers: JSON.stringify(req.headers),
    body: JSON.stringify(req.body),
    query: JSON.stringify(req.query),
  });
  await logger.save();
  next();
};
