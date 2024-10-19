import { User } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { userValidator } from "../utils/validator.js";
import { success, errors, validation } from "../utils/common.js";
import { UserDetails } from "../models/UserDetailsModel.js";
import { serialize } from "cookie";
import { sendWelcomeEmail } from "../utils/mailConfig.js";
import { BlockMst } from "../models/BlockMst.js";
import { SUPER_ADMIN } from "../utils/constants.js";

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
          _id: item._id,
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
    const salt = await bcrypt.genSalt(10);
    user.password = bcrypt.hashSync(newPassword, salt);
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

    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      address,
    });
    if (!user) {
      return res
        .status(404)
        .json(errors("User not found", res.statusCode));
    }
    res.status(200).json(success("User details updated successfully", {}, res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};