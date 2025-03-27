import { SupportRequest } from "../models/SupportRequest.js";
import { success, errors, validation } from "../utils/common.js";
import { ChangeLogs } from "../models/ChangeLogs.js";

// Country listing Methods
export const createSupport  = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const newRequest = new SupportRequest({
            userId: req.user._id,
            title:title,
            description:description
         });
        const savedRequest = await newRequest.save();
        return res
        .status(200)
        .json(success("Support Ticket created successfully.",savedRequest, res.statusCode));
    } catch (err) {
        res.status(500).json(errors(error.message, res.statusCode));
        next(error);
    }
}

export const listSupport  = async (req, res, next) => {
    try {
        const requests = await SupportRequest.find({ userId: req.user._id});
        return res
        .status(200)
        .json(success("Support Ticket fetched successfully.",requests, res.statusCode));
    } catch (err) {
        res.status(500).json(errors(error.message, res.statusCode));
        next(error);
    }
}

export const updateSupport  = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedRequest = await SupportRequest.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        );
        return res
        .status(200)
        .json(success("Support Ticket updated successfully.",updatedRequest, res.statusCode));
    } catch (err) {
        res.status(500).json(errors(error.message, res.statusCode));
        next(error);
    }
}