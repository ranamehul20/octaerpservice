import { User } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { userValidator } from "../utils/validator.js";
import { success, errors, validation,dateConverter } from "../utils/common.js";
import { UserDetails } from "../models/UserDetailsModel.js";
import { serialize } from "cookie";
import { sendWelcomeEmail } from "../utils/mailConfig.js";
import { BlockMst } from "../models/BlockMst.js";
import { SUPER_ADMIN,CHAIRMEN } from "../utils/constants.js";
import Schema from "mongoose";
import {sendEmail} from "../utils/mailConfig.js";
import { DeviceMst } from "../models/DeviceMst.js";

// register method
export const Register = async (req, res, next) => {
  const data = req.body;
  let password_txt = "";
  console.log(data);
  // const session = await mongoose.startSession();
  // session.startTransaction();
  try {
    if (data.isDefaultPassword) {
      data.password = data.email.split("@")[0];
      password_txt = data.password;
      data.isDefaultPassword = true;
      console.log(data.password);
    }
    if (data.role) {
      data.userType = data.role;
    }
    const validator = await userValidator(data);
    console.log(validator);
    if (!validator.isValid) {
      res
        .status(422)
        .json(validation(Object.values(validator.errors).join(",")));
      return next();
    }
    const user = await User.findOne({ email: data.email });
    if (user) {
      res.status(422).json(validation("This user already exist"));
      return next();
    }

    const userModel = new User({
      email: data.email,
      password: data.password,
      role: data.role,
      createdBy: req.user && req.user._id ? req.user._id : null,
    });
    const userResponse = await userModel.save();
    if (userResponse) {
      const userDetailsData = new UserDetails({
        firstName: data.firstname ?? '',
        lastName: data.lastname ?? '',
        phoneNumber: data.phoneNumber ?? '',
        dateOfBirth: data.dateOfBirth ?? '',
        totalMembers: data.totalMembers ?? '',
        street: data.street ?? '',
        locality: data.locality ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        country: data.country ?? '',
        zipCode: data.zipCode ?? '',
        userType: data.userType ?? '',
        photo: data.photo ?? null,
        userId: userResponse._id ?? '',
        houseNumber: data.houseNumber ?? '',
        blockNumber: data.blockNumber ?? '',
        societyId: data.societyId ?? '',
        createdBy: req.user && req.user._id ? req.user._id : null,
      });
      const userDetails = await userDetailsData.save();
      if (userDetails) {
        // await session.commitTransaction();
        const emailResult = await sendWelcomeEmail(data.email, password_txt);
        console.log("Email result", emailResult);
        res
          .status(200)
          .json(success("User created and details added", {}, res.statusCode));
        return next();
      }
    }
    // await session.abortTransaction();
    res
      .status(500)
      .json(
        errors("Some error occurred while adding user details", res.statusCode)
      );
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

//login method
export const Login = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password)
      return res
        .status(400)
        .json(errors("please input values", res.statusCode));
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(400)
        .json(errors("This user doesn’t exist", res.statusCode));
    const isMatch = await user.matchPassword(req.body.password);
    if (!isMatch)
      return res.status(400).json(errors("wrong password", res.statusCode));
    const details = await UserDetails.findOne({ userId: user._id });
    if(req.body.deviceId){
      const device = await DeviceMst.findOne({ deviceId:req.body.deviceId });
      if(!device){
        const deviceModel = new DeviceMst({
          deviceId: req.body.deviceId,
          userId: user._id,
          blockNumber: details.blockNumber,
          societyId: details.societyId,
          houseNumber: details.houseNumber
        });
        await deviceModel.save();
      } 
    }
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    const serialized = serialize("refreshToken", refreshToken, {
      httpOnly: true,
      withCredentials: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    const authSerialized = serialize("accessToken", accessToken, {
      httpOnly: true,
      withCredentials: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    res.cookie("refreshToken", serialized);
    res.cookie("accessToken", authSerialized);
    const response={
      _id:user._id,
      email: user.email,
      role: user.role,
      isDefaultPassword: user.isDefaultPassword,
      firstName: details.firstName,
      lastName: details.lastName,
      societyId: details.societyId,
      blockNumber: details.blockNumber,
      houseNumber: details.houseNumber,
      createdAt: details.createdAt
    };
    console.log("success");
    res
      .status(200)
      .json(
        success(
          "Logged in Successfull",
          response,
          res.statusCode
        )
      );
  } catch (error) {
    next(error);
  }
};

//login method
export const AdminLogin = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password)
      return res
        .status(400)
        .json(errors("please input values", res.statusCode));
    const user = await User.findOne({ email: req.body.email, role: 1 });
    if (!user)
      return res
        .status(400)
        .json(errors("This user doesn’t exist", res.statusCode));
    const isMatch = await user.matchPassword(req.body.password);
    if (!isMatch)
      return res.status(400).json(errors("wrong password", res.statusCode));
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    const serialized = serialize("refreshToken", refreshToken, {
      httpOnly: true,
      withCredentials: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    const authSerialized = serialize("accessToken", accessToken, {
      httpOnly: true,
      withCredentials: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    res.cookie("refreshToken", serialized);
    res.cookie("accessToken", authSerialized);
    const { password, ...otherDetails } = user._doc;
    console.log("success");
    res
      .status(200)
      .json(
        success(
          "Logged in Successfull",
          { user: { ...otherDetails } },
          res.statusCode
        )
      );
  } catch (error) {
    next(error);
  }
};

// check method
export const Check = async (req, res, next) => {
  try {
    const cookies = req.headers.cookie;
    const cookieObj = {};

    cookies &&
      cookies.split(";").forEach((cookie) => {
        const [name, value] = cookie.split("=").map((c) => c.trim());
        cookieObj[name] = decodeURIComponent(value);
      });
    const accessToken = cookieObj.accessToken ? cookieObj.accessToken.split("=")[1].split(";")[0] : "";
    const refreshToken = cookieObj.refreshToken ? cookieObj.refreshToken.split("=")[1].split(";")[0] : "";
    if (!accessToken && !refreshToken) {
      res.status(401).json(errors("Unauthorized", res.statusCode));
      return next();
    }
    const decode = await jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decode) {
      if (!refreshToken) {
        return res
          .status(403)
          .json(errors("Token is not valid!", res.statusCode));
      }
      const decoded = await jwt.verify(refreshToken, process.env.JWT_SECRET);
      if (!decoded) {
        return res
          .status(403)
          .json(errors("Token is not valid!", res.statusCode));
      }
      const accessToken = await jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      const authSerialized = serialize("accessToken", accessToken, {
        httpOnly: true,
        withCredentials: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      res.cookie("accessToken", authSerialized);
      res
        .status(200)
        .json(success("User is authenticated", {}, res.statusCode));
      next();
    }
    res
        .status(200)
        .json(success("User is authenticated", {}, res.statusCode));
      next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    return next(error);
  }
};

// logout method
export const Logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.cookie;

    const jwt = authHeader.split("=")[1];

    if (!jwt) {
      return res.status(401).json(errors("Unauthorized", res.statusCode));
    }
    res.clearCookie('accessToken',{
      httpOnly: true,
      withCredentials: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      withCredentials: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    res.status(200).json(success("Logged out successfull", {}, res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// List of Member
export const ListMembers = async (req, res, next) => {
  try {
    const users = await UserDetails.find({
      "userId.role": { $ne: SUPER_ADMIN },
    })
      .populate("userId")
      .populate("blockNumber")
      .populate("houseNumber")
      .populate("societyId");
    if (users.length) {
      const user = [];
      users.forEach((item) => {
        user.push({
          _id: item.userId._id,
          name: item.firstName + " " + item.lastName,
          email: item.userId.email,
          role: item.userId.role,
          phone: item.phoneNumber,
          dateOfBirth: item.dateOfBirth,
          // address: item.street + ','+ item.locality + ','+ item.city + ','+ item.state + ','+ item.country + ','+ item.zipCode,
        });
      });
      res.status(200).json(success("List of Members", user, res.statusCode));
    }
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

//Test email
export const TestEmails = async (req, res, next) => {
  try {
    const result = await sendWelcomeEmail(
      "ranamehul19@gmail.com",
      "Test Password"
    );
    console.log(result);
    res
      .status(200)
      .json(success("Test email sent successfully", {}, res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// change password
export const ChangePassword = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json(errors("User not found", res.statusCode));
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json(errors("Wrong password", res.statusCode));
    }
    user.password = newPassword;
    user.isDefaultPassword = false;
    await user.save();
    res.status(200).json(success("Password changed successfully", {}, res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

//Update Details
export const UpdateDetails = async (req, res, next) => {
  try {
    const data = req.body;
    if (data.role) {
      data.userType = data.role;
    }
    const validator = await userValidator(data,'update');
    console.log(validator);
    if (!validator.isValid) {
      res
        .status(422)
        .json(validation(Object.values(validator.errors).join(",")));
      return next();
    }
    const user = await User.findOne({ email: data.email,_id:{$ne:req.params.id} });
    if (user) {
      res.status(422).json(validation("This user already exist"));
      return next();
    }
    const currentUser = await User.findOne({ _id: req.params.id});
    if(currentUser.role != data.role && currentUser.role == CHAIRMEN) {
     const checkRole = await User.findOne({ role: CHAIRMEN,_id:{$ne:req.params.id} });
     if(!checkRole){
      res.status(422).json(validation("This user role cannot be changed. Please create another user first for this role"));
      return next();
     }
    }
    let updateData={
      email: data.email ?? user.email,
      role: data.role ?? user.role
    }
    let updateDetails={
      firstName: data.firstname ?? user.firstName,
      lastName: data.lastname?? user.lastName,
      phoneNumber: data.phoneNumber?? user.phoneNumber,
      dateOfBirth: data.dateOfBirth?? user.dateOfBirth,
      street: data.street ?? user.street,
      locality: data.locality?? user.locality,
      city: data.city?? user.city,
      state: data.state?? user.state,
      country: data.country?? user.country,
      zipCode: data.zipCode?? user.zipCode,
      userType: updateData.role,
      totalMembers: data.totalMembers ?? user.totalMembers,
      societyId: data.societyId?? user.societyId,
      blockNumber: data.blockNumber?? user.blockNumber,
      houseNumber: data.houseNumber?? user.houseNumber,
    }
    const originalData = await User.findOne({ _id:req.params.id});
    // Save the original and updated values in the change log
    const log = new ChangeLog({
     method: req.method,
     collectionName: 'User',
     url: req.url,
     originalData: originalData.toObject(),
     updatedData: updateData
   });

   await log.save();
   console.log("Change log saved successfully");
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData);
    if (!updatedUser) {
      return res
        .status(404)
        .json(errors("User not found", res.statusCode));
    }
    console.log(updatedUser);
    const originalData1 = await UserDetails.findOne({"userId":updatedUser._id});
    // Save the original and updated values in the change log
    const log1 = new ChangeLog({
     method: req.method,
     collectionName: 'UserDetails',
     url: req.url,
     originalData: originalData1.toObject(),
     updatedData: updateDetails
   });

   await log1.save();
   console.log("Change log saved successfully");
    const updatedUserDetails = await UserDetails.findOneAndUpdate({"userId":updatedUser._id}, updateDetails);
    if (!updatedUserDetails) {
      return res
       .status(404)
       .json(errors("User details not found", res.statusCode));
    }
    let userDetails= {
        _id: updatedUser._id,
        firstname: updatedUserDetails.firstName,
        lastname: updatedUserDetails.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        phoneNumber: updatedUserDetails.phoneNumber,
        dateOfBirth: dateConverter(updatedUserDetails.dateOfBirth),
        street: updatedUserDetails.street,
        locality: updatedUserDetails.locality,
        city: updatedUserDetails.city,
        state: updatedUserDetails.state,
        country: updatedUserDetails.country,
        zipCode: updatedUserDetails.zipCode,
        societyId:updatedUserDetails.societyId,
        blockNumber:updatedUserDetails.blockNumber,
        houseNumber:updatedUserDetails.houseNumber,
        totalMembers:updatedUserDetails.totalMembers,
      };
    res.status(200).json(success("User details updated successfully", userDetails, res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// get user details
export const GetUserDetails = async (req, res, next) => {
  try {
    console.log("GetUserDetails");
    const user = await UserDetails.find({userId:req.params.id}).populate('userId').populate('blockNumber').populate('houseNumber').populate('societyId');
    if (!user) {
      return res
        .status(404)
        .json(errors("User not found", res.statusCode));
    }
    let userDetails= null;
    user.forEach((item) => {
      userDetails={
        _id: item.userId._id,
        firstname: item.firstName,
        lastname: item.lastName,
        email: item.userId.email,
        role: item.userId.role,
        roleName: item.userId.role == process.env.SUPER_ADMIN ? 'Super Admin' : item.userId.role == process.env.CHAIRMEN ? 'Chairman' : item.userId.role == process.env.MEMBERS ? 'House Owner' : 'TENANT',
        phoneNumber: item.phoneNumber,
        dateOfBirth: dateConverter(item.dateOfBirth),
        street: item.street,
        locality: item.locality,
        city: item.city,
        state: item.state,
        country: item.country,
        zipCode: item.zipCode,
        societyId:item.societyId._id,
        societyName: item.societyId.name,
        blockNumber:item.blockNumber._id,
        blockName:item.blockNumber.name,
        houseNumber:item.houseNumber._id,
        houseName:item.houseNumber.name,
        totalMembers:item.totalMembers,
      };
    });
    res.status(200).json(success("User details fetched successfully", userDetails, res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json(errors("User not found", res.statusCode));
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h"  });
    const url = `${process.env.FRONT_URL}/reset-password/${token}`;
    const response = await sendEmail(user.email, "Reset Password", `Click on the following link to reset your password: ${url}`);
    res.status(200).json(success("Reset password email sent successfully", {}, res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message));
    // await session.abortTransaction();
    next(error);
  }
};

// reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json(errors("Invalid token", res.statusCode));
    }
    const user = await User.findBy_id(decoded.id);
    if (!user) {
      return res
        .status(404)
        .json(errors("User not found", res.statusCode));
    }
    user.password = password;
    user.isDefaultPassword=false;
    await user.save();
    res.status(200).json(success("Password reset successfully", {}, res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message));
    // await session.abortTransaction();
    next();
  }
};

