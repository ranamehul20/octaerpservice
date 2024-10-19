import { HouseMst } from "../models/HouseMst.js";
import { houseValidator } from "../utils/validator.js";
import { success, errors, validation } from "../utils/common.js";
import Schema from "mongoose";

// House Create Method
export const createHouse = async (req, res, next) => {
  const data = req.body;
  console.log(req.user._id);
  try {
    const validator = await houseValidator(data);
    console.log(validator);
    if (!validator.isValid) {
      res
        .status(422)
        .json(validation(Object.values(validator.errors).join(",")));
      return next();
    }
    const houseExists = await HouseMst.findOne({
      name: data.name,
      blockId: Schema.Types.ObjectId.createFromHexString(data.blockId),
      societyId: Schema.Types.ObjectId.createFromHexString(data.societyId),
    });
    if (houseExists) {
      res
        .status(422)
        .json(validation("This house already exist in block " + data.blockId));
      return next();
    }
    const house = new HouseMst({
      name: data.name,
      totalMembers: data.totalMembers ?? 0,
      totalChildren: data.totalChildren ?? 0,
      totalAdults: data.totalAdults ?? 0,
      blockId: Schema.Types.ObjectId.createFromHexString(data.blockId),
      societyId: Schema.Types.ObjectId.createFromHexString(data.societyId),
      type: data.type,
      createdBy: req.user._id,
    });
    console.log(house);
    const houseDetails = await house.save();
    if (houseDetails) {
      // await session.commitTransaction();
      res
        .status(200)
        .json(success("House created successfully",{}, res.statusCode));
      return next();
    }
    res
      .status(500)
      .json(
        errors("Some error occurred while adding house details", res.statusCode)
      );
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// House Listing Method
export const listingHouses = async (req, res, next) => {
  try {
    if (req.user.isAdmin) {
      const houseDetails = await HouseMst.find()
        .populate("societyId")
        .populate("blockId")
        .populate("createdBy", "name");
      if (houseDetails) {
        const house = [];
        houseDetails.forEach((item) => {
          house.push({
            _id: item._id,
            name: item.name,
            type: item.type,
            block: item.blockId.name ?? "",
            society: item.societyId.name ?? "",
          });
        });
        res
          .status(200)
          .json(success("Houses fetched successfully", house, res.statusCode));
        return next();
      }
      res
        .status(500)
        .json(
          errors("Some error occurred while fetching houses", res.statusCode)
        );
      return next();
    }
    const houses = await HouseMst.find({
      blockId: Schema.Types.ObjectId.createFromHexString(req.query.blockId),
    })
      .populate("societyId")
      .populate("blockId")
      .populate("createdBy", "name");
    if (houses) {
      // await session.commitTransaction();
      res
        .status(200)
        .json(success("Houses fetched successfully", houses, res.statusCode));
      return next();
    }
    res
      .status(500)
      .json(
        errors("Some error occurred while fetching houses", res.statusCode)
      );
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// House Details Method
export const housesDetail = async (req, res, next) => {
  try {
    const houseDetails = await HouseMst.findById(req.params.id)
      .populate("societyId")
      .populate("blockId")
      .populate("createdBy", "name");
    if (houseDetails) {
      // await session.commitTransaction();
      res
        .status(200)
        .json(
          success("House fetched successfully", houseDetails, res.statusCode)
        );
      return next();
    }
    res.status(404).json(errors("House not found", res.statusCode));
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// House Update Method
export const updateHouses = async (req, res, next) => {
  const data = req.body;
  try {
    const validator = await houseValidator(data);
    if (!validator.isValid) {
      res
        .status(422)
        .json(validation(Object.values(validator.errors).join(",")));
      return next();
    }
    const houseExists = await HouseMst.findOne({
      _id: { $ne: req.params.id },
      name: data.name,
      blockId: Schema.Types.ObjectId.createFromHexString(data.blockId),
      societyId: Schema.Types.ObjectId.createFromHexString(data.societyId),
    });
    if (houseExists) {
      res.status(422).json(validation("This house already exist"));
      return next();
    }
    const house = await HouseMst.findByIdAndUpdate(req.params.id, {
      $set: {
        name: data.name,
        totalMembers: data.totalMembers ?? 0,
        totalChildren: data.totalChildren ?? 0,
        totalAdults: data.totalAdults ?? 0,
        blockId: Schema.Types.ObjectId.createFromHexString(data.blockId),
        societyId: Schema.Types.ObjectId.createFromHexString(data.societyId),
        type: data.type,
        updatedBy: req.user._id,
      },
    });
    if (house) {
      // await session.commitTransaction();
      res
        .status(200)
        .json(success("House updated successfully", house, res.statusCode));
      return next();
    }
    res
      .status(500)
      .json(errors("Error while updating details", res.statusCode));
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// House Delete Method
export const deleteHouses = async (req, res, next) => {
  try {
    const house = await HouseMst.findByIdAndDelete(req.params.id);
    if (house) {
      // await session.commitTransaction();
      res
       .status(200)
       .json(success("House deleted successfully",{}, res.statusCode));
      return next();
    }
    res.status(404).json(errors("House not found", res.statusCode));
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// House Details 
export const houseDetails = async (req, res, next) => {
  try {
    const houseDetails = await HouseMst.findById(req.params.id)
     .populate("societyId")
     .populate("blockId")
     .populate("createdBy", "name");
    if (houseDetails) {
      // await session.commitTransaction();
      res
       .status(200)
       .json(
          success("House fetched successfully", houseDetails, res.statusCode)
        );
      return next();
    }
    res.status(404).json(errors("House not found", res.statusCode));
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};
