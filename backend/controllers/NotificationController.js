import { success, errors, validation } from "../utils/common.js";
import { Notification } from '../models/Notification.js';
import { ChangeLogs } from "../models/ChangeLogs.js";

export const list = async (req, res) => {
    try {
      const { page = 1, limit = 10,searchText,title,description, startDate, endDate } = req.query;
      const filters = {
        userId: req.user._id
      };

      if (description) {
        filters.description = { $regex: description, $options: "i" }
      }
  
      if (title) {
        filters.title = { $regex: title, $options: "i" }
      }
  
      if(searchText){
        filters["$or"] = [
          { title: { $regex: req.query.name, $options: "i" } },
          { description: { $regex: req.query.name, $options: "i" } },
        ];
      }

      // Add date range filter if provided
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) {
        filters.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filters.createdAt.$lte = new Date(endDate);
      }
    }

      const totalCount = await Notification.countDocuments(filters);
      const notifications = await Notification.find(filters)
        .populate("userId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      if (!notifications.length) {
        return res.status(200).json(
          success(
            "Notification not found",
            {
              totalCount,
              currentPage: parseInt(page),
              totalPages: Math.ceil(totalCount / limit),
              notifications: [],
            },
            res.statusCode
          )
        );
      }
      const notificationList = notifications.map((notification) => {
        return {
          _id: notification._id,
          title:notification.title,
          description: notification.description,
          status: notification.status,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
        };
      });
      res.status(200).json(
        success(
          "Notification fetched successfully",
          {
            totalCount,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            notifications: notificationList,
          },
          res.statusCode
        )
      );
    } catch (error) {
      res.status(500).json(errors(error.message, res.statusCode));
      next(error);
    }
};