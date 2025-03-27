import { success, errors, validation } from "../utils/common.js";
import Schema from "mongoose";
import {Feedback} from "../models/Feedback.js";

// Block Create Method
export const createFeedback = async (req, res, next) => {
    try {
        const { userId, type, message } = req.body;
        const feedback = new Feedback({
            userId:userId,
            type:type ?? "",
            message:message
        });
        await feedback.save();
        res
        .status(200)
        .json(success("Feedback Submitted successfully",{}, res.statusCode));
        return next();
    } catch (error) {
        res.status(500).json(errors(error.message, res.statusCode));
        // await session.abortTransaction();
        next(error);
    }
};

export const listingFeedback = async (req,res,next) =>{
    try {
        const feedbacks = await Feedback.find().populate("userId");
        res
        .status(200)
        .json(success("Feedback Fetched successfully",feedbacks, res.statusCode));
        return next();
    } catch (error) {
        res.status(500).json(errors(error.message, res.statusCode));
        // await session.abortTransaction();
        next(error);
    }
};