import { User } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { userValidator } from "../utils/auth.js";
import { success, errors, validation } from "../utils/common.js";
import { UserDetails } from "../models/UserDetailsModel.js";
import { serialize } from "cookie";

// register method
export const Register = async (req, res, next) => {
  const data = req.body;
  // const session = await mongoose.startSession();
  // session.startTransaction();
  try {
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
    });
    const userResponse = await userModel.save();
    if (userResponse) {
      const userDetailsData = new UserDetails({
        firstName: data.firstname,
        lastName: data.lastname,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        totalMembers: data.totalMembers,
        street: data.street,
        locality: data.locality,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode,
        userType: data.userType,
        userId: userResponse._id,
        houseNumber: data.houseNumber,
        blockNumber: data.blockNumber,
        societyId: data.societyId,
      });
      const userDetails = await userDetailsData.save();
      if (userDetails) {
        // await session.commitTransaction();
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const serialized = serialize("token", token, {
      httpOnly: true,
      withCredentials: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    res.setHeader("Set-Cookie", serialized);
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const serialized = serialize("token", token, {
      httpOnly: true,
      withCredentials: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    res.setHeader("Set-Cookie", serialized);
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
    const authHeader = req.headers.cookie;
    if (!authHeader) {
      res.status(401).json(errors("Unauthorized", res.statusCode));
      return next();
    }
    const token = authHeader.split("=")[1];
    console.log("token: " + token);
    if (!token) {
      res.status(401).json(errors("Unauthorized", res.statusCode));
      return next();
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      async (err, result) => {
        if (err)
          return res.status(401).json(errors("Unauthorized", res.statusCode));
        console.log("decoded: " + result);
        const user = await User.findById(decoded.id);
        if (!user) {
          res.status(401).json(errors("Unauthorized", res.statusCode));
          return next();
        }
        res
          .status(200)
          .json(success("User is authenticated", {}, res.statusCode));
        return next();
      }
    );
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
    res.setHeader(
      "Set-Cookie",
      serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: -1,
        expires: new Date(0),
        path: "/",
      })
    );
    res.status(200).json(success("Logged out successfull", {}, res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};
