import { User } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { userValidator } from "../utils/validator.js";
import { success, errors, validation, dateConverter } from "../utils/common.js";
import { UserDetails } from "../models/UserDetailsModel.js";
import { serialize } from "cookie";
import { sendWelcomeEmail } from "../utils/mailConfig.js";
import { BlockMst } from "../models/BlockMst.js";
import { SUPER_ADMIN, CHAIRMEN } from "../utils/constants.js";
import Schema from "mongoose";
import { sendEmail } from "../utils/mailConfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { ChangeLogs } from "../models/ChangeLogs.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        alternativePhoneNumber: data.alternativePhoneNumber ?? '',
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
        const populatedUserDetails = await UserDetails.findById(userDetails._id)
          .populate('societyId')        // Populate the 'userId' field (reference to User)
          .populate('blockNumber')   // Populate the 'blockNumber' field (reference to BlockNumber)
          .populate('houseNumber');
        const photoUrl = populatedUserDetails.photo
          ? `${req.protocol}://${req.get("host")}/api/${populatedUserDetails.photo.replace(/\\/g, '/')}`
          : "";
        const response = {
          _id: userResponse._id,
          email: userResponse.email,
          role: userResponse.role,
          isDefaultPassword: userResponse.isDefaultPassword,
          firstName: populatedUserDetails.firstName,
          lastName: populatedUserDetails.lastName,
          createdAt: populatedUserDetails.createdAt,
          roleName:
            userResponse.role == process.env.SUPER_ADMIN
              ? "Super Admin"
              : userResponse.role == process.env.CHAIRMEN
                ? "Chairman"
                : userResponse.role == process.env.MEMBERS
                  ? "House Owner"
                  : "TENANT",
          phoneNumber: populatedUserDetails.phoneNumber,
          alternativePhoneNumber: populatedUserDetails.alternativePhoneNumber,
          dateOfBirth: populatedUserDetails.dateOfBirth ? dateConverter(populatedUserDetails.dateOfBirth) : "",
          street: populatedUserDetails.street,
          locality: populatedUserDetails.locality,
          city: populatedUserDetails.city,
          state: populatedUserDetails.state,
          country: populatedUserDetails.country,
          zipCode: populatedUserDetails.zipCode,
          societyId: populatedUserDetails.societyId ? populatedUserDetails.societyId._id : "",
          societyName: populatedUserDetails.societyId ? populatedUserDetails.societyId.name : "",
          blockNumber: populatedUserDetails.blockNumber ? populatedUserDetails.blockNumber._id : "",
          blockName: populatedUserDetails.blockNumber ? populatedUserDetails.blockNumber.name : "",
          houseNumber: populatedUserDetails.houseNumber ? populatedUserDetails.houseNumber._id : "",
          houseName: populatedUserDetails.houseNumber ? populatedUserDetails.houseNumber.name : "",
          totalMembers: populatedUserDetails.totalMembers,
          photo: photoUrl, // Include photo URL/path
        };
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
    const user = await User.findOne({ email: req.body.email, isDeleted: false });
    if (!user)
      return res
        .status(400)
        .json(errors("This user doesn’t exist", res.statusCode));
    const isMatch = await user.matchPassword(req.body.password);
    if (!isMatch)
      return res.status(400).json(errors("wrong password", res.statusCode));
    const details = await UserDetails.findOne({ userId: user._id }).populate("userId")
      .populate("blockNumber")
      .populate("houseNumber")
      .populate("societyId");
    if (req.body.deviceId) {
      if (user.activeDevice && user.activeDevice != null && user.activeDevice != '') {
        if (user.activeDevice != req.body.deviceId) {
          return res.status(400).json(errors("This device is already registered to another user", res.statusCode));
        }
      }
      user.activeDevice = req.body.deviceId;
      user.fcmToken = req.body.fcmToken;
      await user.save();
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
    const photoUrl = details.photo
      ? `${req.protocol}://${req.get("host")}/api/${details.photo.replace(/\\/g, '/')}`
      : "";
    const response = {
      _id: user._id,
      email: user.email,
      role: user.role,
      isDefaultPassword: user.isDefaultPassword,
      firstName: details.firstName,
      lastName: details.lastName,
      createdAt: details.createdAt,
      roleName:
        user.role == process.env.SUPER_ADMIN
          ? "Super Admin"
          : user.role == process.env.CHAIRMEN
            ? "Chairman"
            : user.role == process.env.MEMBERS
              ? "House Owner"
              : "TENANT",
      phoneNumber: details.phoneNumber,
      alternativePhoneNumber: details.alternativePhoneNumber,
      dateOfBirth: details.dateOfBirth ? dateConverter(details.dateOfBirth) : "",
      street: details.street,
      locality: details.locality,
      city: details.city,
      state: details.state,
      country: details.country,
      zipCode: details.zipCode,
      societyId: details.societyId ? details.societyId._id : "",
      societyName: details.societyId ? details.societyId.name : "",
      blockNumber: details.blockNumber ? details.blockNumber._id : "",
      blockName: details.blockNumber ? details.blockNumber.name : "",
      houseNumber: details.houseNumber ? details.houseNumber._id : "",
      houseName: details.houseNumber ? details.houseNumber.name : "",
      totalMembers: details.totalMembers,
      photo: photoUrl, // Include photo URL/path
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
    const user = await User.findOne({ email: req.body.email, role: 1, isDeleted: false });
    if (!user)
      return res
        .status(400)
        .json(errors("This user doesn’t exist", res.statusCode));
    user.save();
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
      const result = await clearDevice(req);
      console.log("device clear {}", result.success);
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
      const userDetails = await User.findOne({
        _id: Schema.Types.ObjectId.createFromHexString(decoded.id),
        isDeleted: false
      });
      if (!userDetails) {
        return res.status(404).json(errors("User not found!", res.statusCode));
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
    console.log(req.body.email);
    const user = await User.findBy_email(req.body.email);
    if (!user) {
      // Throw an error to handle it centrally
      return res.status(500).json(errors("User not found", res.statusCode));
    }
    // Clear the active device field
    user.activeDevice = '';
    await user.save();
    // Clear the access token cookie
    res.cookie('accessToken', '', {
      httpOnly: true,
      withCredentials: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    // Clear the refresh token cookie
    res.cookie('refreshToken', '', {
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
    const { page = 1, limit = 10, name, role, email, phone } = req.query;
    let users = null;

    // Define common filters
    const filters = {};

    // Add filters dynamically
    if (req.user.role !== SUPER_ADMIN && req.userDetails.societyId) {
      filters["societyId"] = req.userDetails.societyId;
    }

    if (name) {
      filters["$or"] = [
        { firstName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } },
      ];
    }

    const userFilters = { role: { $ne: SUPER_ADMIN }, isDeleted: false };
    if (role) {
      userFilters.role = role;
    }
    if (email) {
      userFilters["email"] = { $regex: email, $options: "i" };
    }
    if (role) {
      userFilters["role"] = role;
    }

    if (phone) {
      filters["phoneNumber"] = { $regex: phone, $options: "i" };
    }

    console.log("filters ", filters);
    console.log("userFilters ", userFilters);
    const totalCount = await UserDetails.countDocuments(filters);
    // Fetch filtered users
    users = await UserDetails.find(filters)
      .populate({
        path: "userId",
        match: userFilters, // Apply role filter here
      })
      .populate("blockNumber")
      .populate("houseNumber")
      .populate("societyId").sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    users = users.filter((item) => item.userId !== null);
    if (users.length) {
      const user = users.map((item) => ({
        _id: item.userId._id,
        email: item.userId.email,
        role: item.userId.role,
        isDefaultPassword: item.userId.isDefaultPassword,
        firstName: item.firstName,
        lastName: item.lastName,
        createdAt: item.createdAt,
        roleName:
          item.userId.role == process.env.SUPER_ADMIN
            ? "Super Admin"
            : item.userId.role == process.env.CHAIRMEN
              ? "Chairman"
              : item.userId.role == process.env.MEMBERS
                ? "House Owner"
                : "TENANT",
        phoneNumber: item.phoneNumber,
        alternativePhoneNumber: item.alternativePhoneNumber,
        dateOfBirth: item.dateOfBirth ? dateConverter(item.dateOfBirth) : "",
        street: item.street,
        locality: item.locality,
        city: item.city,
        state: item.state,
        country: item.country,
        zipCode: item.zipCode,
        societyId: item.societyId ? item.societyId._id : "",
        societyName: item.societyId ? item.societyId.name : "",
        blockNumber: item.blockNumber ? item.blockNumber._id : "",
        blockName: item.blockNumber ? item.blockNumber.name : "",
        houseNumber: item.houseNumber ? item.houseNumber._id : "",
        houseName: item.houseNumber ? item.houseNumber.name : "",
        totalMembers: item.totalMembers,
        photo: item.photo
          ? `${req.protocol}://${req.get("host")}/api/${item.photo.replace(/\\/g, '/')}`
          : "", // Include photo URL/path
      }));
      res.status(200).json(success("List of Members",{
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        user:user
      } , res.statusCode));
    } else {
      res.status(404).json(success("No members found", [], res.statusCode));
    }
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
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
    const file = req.file;
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      res.status(422).json(validation("User not found"));
      return next();
    }
    const originalData1 = await UserDetails.findOne({ "userId": user._id });
    if (!originalData1) {
      return res
        .status(404)
        .json(errors("User details not found", res.statusCode));
    }
    const validator = await userValidator(data, 'update');
    console.log(validator);
    if (!validator.isValid) {
      res
        .status(422)
        .json(validation(Object.values(validator.errors).join(",")));
      return next();
    }


    let photoPath;
    if (file) {
      // Define relative path to save the file
      const relativeUploadDir = 'uploads/photos';
      const absoluteUploadDir = path.join(__dirname, '..', relativeUploadDir);

      // Create directory if it doesn't exist
      if (!fs.existsSync(absoluteUploadDir)) {
        fs.mkdirSync(absoluteUploadDir, { recursive: true });
      }

      // Define the file name and full path
      const photoFilename = `user_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`;
      const fullPhotoPath = path.join(absoluteUploadDir, photoFilename);

      // Save the file to the absolute path
      fs.writeFileSync(fullPhotoPath, file.buffer);

      // Save the relative path for storing in the database
      photoPath = path.join(relativeUploadDir, photoFilename);
    }
    // Save the original and updated values in the change log
    const log1 = new ChangeLogs({
      method: req.method,
      collectionName: 'UserDetails',
      url: req.url,
      originalData: originalData1.toObject(),
      updatedData: {
        firstName: data.firstname ?? originalData1.firstName,
        lastName: data.lastname ?? originalData1.lastName,
        phoneNumber: data.phoneNumber ?? originalData1.phoneNumber,
        alternativePhoneNumber: data.alternativePhoneNumber ?? originalData1.alternativePhoneNumber,
        dateOfBirth: data.dateOfBirth ?? originalData1.dateOfBirth,
        street: data.street ?? originalData1.street,
        locality: data.locality ?? originalData1.locality,
        city: data.city ?? originalData1.city,
        state: data.state ?? originalData1.state,
        country: data.country ?? originalData1.country,
        zipCode: data.zipCode ?? originalData1.zipCode,
        userType: data.role ?? originalData1.role,
        totalMembers: data.totalMembers ?? originalData1.totalMembers,
        societyId: data.societyId ?? originalData1.societyId,
        blockNumber: data.blockNumber ?? originalData1.blockNumber,
        houseNumber: data.houseNumber ?? originalData1.houseNumber,
        photo: photoPath ?? originalData1.photo,
      }
    });

    await log1.save();
    console.log("Change log saved successfully");
    const updatedUserDetails = await UserDetails.findOneAndUpdate({ "userId": user._id }, {
      $set: {
        firstName: data.firstname ?? originalData1.firstName,
        lastName: data.lastname ?? originalData1.lastName,
        phoneNumber: data.phoneNumber ?? originalData1.phoneNumber,
        alternativePhoneNumber: data.alternativePhoneNumber ?? originalData1.alternativePhoneNumber,
        dateOfBirth: data.dateOfBirth ?? originalData1.dateOfBirth,
        street: data.street ?? originalData1.street,
        locality: data.locality ?? originalData1.locality,
        city: data.city ?? originalData1.city,
        state: data.state ?? originalData1.state,
        country: data.country ?? originalData1.country,
        zipCode: data.zipCode ?? originalData1.zipCode,
        userType: data.role ?? originalData1.role,
        totalMembers: data.totalMembers ?? originalData1.totalMembers,
        societyId: data.societyId ?? originalData1.societyId,
        blockNumber: data.blockNumber ?? originalData1.blockNumber,
        houseNumber: data.houseNumber ?? originalData1.houseNumber,
        photo: photoPath ?? originalData1.photo, // Update photo
      }
    }, { new: true }).populate("userId")
      .populate("blockNumber")
      .populate("houseNumber")
      .populate("societyId");

    if (!updatedUserDetails) {
      return res
        .status(404)
        .json(errors("User details not found", res.statusCode));
    }
    let userDetails = {
      _id: user._id,
      isDefaultPassword: user.isDefaultPassword,
      firstname: updatedUserDetails.firstName,
      lastname: updatedUserDetails.lastName,
      email: user.email,
      role: user.role,
      roleName:
        user.role == process.env.SUPER_ADMIN
          ? "Super Admin"
          : user.role == process.env.CHAIRMEN
            ? "Chairman"
            : user.role == process.env.MEMBERS
              ? "House Owner"
              : "TENANT",
      phoneNumber: updatedUserDetails.phoneNumber,
      alternativePhoneNumber: updatedUserDetails.alternativePhoneNumber,
      dateOfBirth: updatedUserDetails.dateOfBirth ? dateConverter(updatedUserDetails.dateOfBirth) : "",
      street: updatedUserDetails.street,
      locality: updatedUserDetails.locality,
      city: updatedUserDetails.city,
      state: updatedUserDetails.state,
      country: updatedUserDetails.country,
      zipCode: updatedUserDetails.zipCode,
      societyId: updatedUserDetails.societyId ? updatedUserDetails.societyId._id : "",
      societyName: updatedUserDetails.societyId ? updatedUserDetails.societyId.name : "",
      blockNumber: updatedUserDetails.blockNumber ? updatedUserDetails.blockNumber._id : "",
      blockName: updatedUserDetails.blockNumber ? updatedUserDetails.blockNumber.name : "",
      houseNumber: updatedUserDetails.houseNumber ? updatedUserDetails.houseNumber._id : "",
      houseName: updatedUserDetails.houseNumber ? updatedUserDetails.houseNumber.name : "",
      totalMembers: updatedUserDetails.totalMembers,
      photo: updatedUserDetails.photo
        ? `${req.protocol}://${req.get("host")}/api/${updatedUserDetails.photo.replace(/\\/g, '/')}`
        : "", // Include photo URL/path
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

    // Fetch user details with related collections populated
    const user = await UserDetails.findOne({ userId: req.params.id })
      .populate("userId")
      .populate("blockNumber")
      .populate("houseNumber")
      .populate("societyId");

    if (!user || user.userId.isDeleted) {
      return res
        .status(404)
        .json(errors("User not found", res.statusCode));
    }

    console.log(user);
    const photoUrl = user.photo
      ? `${req.protocol}://${req.get("host")}/api/${user.photo.replace(/\\/g, '/')}`
      : "";
    // Build the userDetails object, including photo
    let userDetails = {
      _id: user.userId._id,
      firstname: user.firstName,
      lastname: user.lastName,
      email: user.userId.email,
      role: user.userId.role,
      roleName:
        user.userId.role == process.env.SUPER_ADMIN
          ? "Super Admin"
          : user.userId.role == process.env.CHAIRMEN
            ? "Chairman"
            : user.userId.role == process.env.MEMBERS
              ? "House Owner"
              : "TENANT",
      phoneNumber: user.phoneNumber,
      alternativePhoneNumber: user.alternativePhoneNumber,
      dateOfBirth: user.dateOfBirth ? dateConverter(user.dateOfBirth) : "",
      street: user.street,
      locality: user.locality,
      city: user.city,
      state: user.state,
      country: user.country,
      zipCode: user.zipCode,
      societyId: user.societyId ? user.societyId._id : "",
      societyName: user.societyId ? user.societyId.name : "",
      blockNumber: user.blockNumber ? user.blockNumber._id : "",
      blockName: user.blockNumber ? user.blockNumber.name : "",
      houseNumber: user.houseNumber ? user.houseNumber._id : "",
      houseName: user.houseNumber ? user.houseNumber.name : "",
      totalMembers: user.totalMembers,
      photo: photoUrl, // Include photo URL/path
    };

    res.status(200).json(success("User details fetched successfully", userDetails, res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
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
    user.isDefaultPassword = false;
    await user.save();
    res.status(200).json(success("Password reset successfully", {}, res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message));
    // await session.abortTransaction();
    next();
  }
};

const clearDevice = async (req) => {
  try {
    // Find user by email
    const user = await User.findBy_email(req.email);
    if (!user) {
      // Throw an error to handle it centrally
      throw new Error("User not found");
    }

    // Clear the active device field
    user.activeDevice = '';
    await user.save();

    return { success: true, message: "Device cleared successfully" };
  } catch (error) {
    // Return error details for centralized error handling
    return { success: false, message: error.message };
  }
};

export const DeleteMember = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      return res.status(422).json(validation("User not found"));
    }
    // Save the original and updated values in the change log
    const log1 = new ChangeLogs({
      method: req.method,
      collectionName: 'User',
      url: req.url,
      originalData: user.toObject(),
      updatedData: {
        isDeleted: true
      }
    });

    await log1.save();
    console.log("Change log saved successfully");

    user.isDeleted = true;
    await user.save();

    return res
      .status(200)
      .json(success("User deleted successfully", user, res.statusCode));
  } catch (error) {
    return res.status(500).json(errors(error.message));
  }
};
