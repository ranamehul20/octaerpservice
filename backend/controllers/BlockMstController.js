import { BlockMst } from "../models/BlockMst.js";
import { ChangeLogs } from "../models/ChangeLogs.js";
import { blockValidator } from "../utils/validator.js";
import { success, errors, validation } from "../utils/common.js";
import Schema from "mongoose";

// Block Create Method
export const createBlock = async (req, res, next) => {
  const data = req.body;
  console.log(req.user._id);
  console.log("req",data);
  try {
    const validator = await blockValidator(data);
    console.log(validator);
    if (!validator.isValid) {
      res
        .status(422)
        .json(
          validation(Object.values(validator.errors).join(","))
        );
      return next();
    }
    const blockExists = await BlockMst.findOne({ name: data.name,societyId: Schema.Types.ObjectId.createFromHexString(data.societyId) });
    if (blockExists) {
      res.status(422).json(validation("This block already exist"));
      return next();
    }

    const block = new BlockMst({
        name: data.name,
        totalHouse: data.totalHouse,
        societyId: Schema.Types.ObjectId.createFromHexString(data.societyId),
        createdBy: req.user._id
    });
    console.log(block);
    const blockDetails = await block.save();
    if (blockDetails) {
      // await session.commitTransaction();
      res
        .status(200)
        .json(success("Block created successfully",{}, res.statusCode));
      return next();
    }
    res
      .status(500)
      .json(
        errors("Some error occurred while adding block details", res.statusCode)
      );
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// Block Listing Method
export const listingBlocks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default pagination values
    const query = {};

    if (req.query.societyId) {
      query.societyId = Schema.Types.ObjectId.createFromHexString(req.query.societyId);
    }

    if (req.user.isAdmin) {
      // const totalCount = await BlockMst.countDocuments(query);
      const blockDetails = await BlockMst.find(query)
        .populate("societyId")
        .populate("createdBy", "name");
        // .skip((page - 1) * limit)
        // .limit(parseInt(limit));

      if (blockDetails.length) {
        const blocks = blockDetails.map((item) => ({
          _id: item._id,
          name: item.name,
          society: item.societyId?.name ?? "",
        }));

        return res.status(200).json(
          success("Blocks fetched successfully",blocks, res.statusCode)
        );
      }

      return res.status(404).json(errors("No blocks found", res.statusCode));
    }

    // Non-admin fetching blocks by societyId
    if (!req.query.societyId) {
      return res.status(400).json(errors("societyId is required", res.statusCode));
    }

    const totalCount = await BlockMst.countDocuments(query);
    const blocks = await BlockMst.find(query)
      .populate("createdBy", "name")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    if (blocks.length) {
      return res.status(200).json(
        success("Blocks fetched successfully", {
          totalCount,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          blocks,
        }, res.statusCode)
      );
    }

    return res.status(404).json(errors("No blocks found", res.statusCode));
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    next(error);
  }
};

// Block Update Method
export const updateBlocks = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(req.user._id);
    console.log("req",data);
    const validator = await blockValidator(data);
    if (!validator.isValid) {
      res
        .status(422)
        .json(
          validation(Object.values(validator.errors).join(","))
        );
      return next();
    }
    const blockExists = await BlockMst.findOne({ _id:{$ne:req.params.id}, name: data.name,societyId: Schema.Types.ObjectId.createFromHexString(data.societyId) });
    if (blockExists) {
      res.status(422).json(validation("This block already exist"));
      return next();
    }

    const originalData = await BlockMst.findOne({ _id:req.params.id});
     // Save the original and updated values in the change log
     const log = new ChangeLog({
      method: req.method,
      collectionName: 'BlockMst',
      url: req.url,
      originalData: originalData.toObject(),
      updatedData: data
    });

    await log.save();
    console.log("Change log saved successfully");

    const block = await BlockMst.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: data.name,
          totalHouse: data.totalHouse,
          societyId: Schema.Types.ObjectId.createFromHexString(data.societyId),
          updatedBy: req.user._id,
        },
      }
    );
    if (block) {
      // await session.commitTransaction();
      res
       .status(200)
       .json(success("Block updated successfully",{}, res.statusCode));
      return next();
    }
    res.status(500).json(errors("Error while updating details", res.statusCode));
    return next();
  } catch (e) {
    console.log(e);
    res.status(400).json(errors("Validation error", res.statusCode));
    return next();
  }
};

// Block Delete Method 
export const deleteBlock = async (req, res, next) => {
  try {
    const block = await BlockMst.findByIdAndDelete(req.params.id);
    if (block) {
      // await session.commitTransaction();
      res.status(200).json(success("Block deleted successfully",{}, res.statusCode));
      return next();
    }
    res.status(404).json(errors("Block not found", res.statusCode));
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// Block Details Method
export const getBlockDetails = async (req, res, next) => {
  try {
    const block = await BlockMst.findById(req.params.id).populate('societyId','name');
    if (block) {
      // await session.commitTransaction();
      res.status(200).json(success("Block details fetched successfully", block, res.statusCode));
      return next();
    }
    res.status(404).json(errors("Block not found", res.statusCode));
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};