import { success, errors, validation } from "../utils/common.js";
import { Notification } from '../models/Notification.js';
import { ChangeLogs } from "../models/ChangeLogs.js";

export const list = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const totalCount = await Notification.countDocuments({
        userId: req.user._id
      });
      const notifications = await Notification.find({ userId: req.user._id })
        .populate("userId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      if (!notifications.length) {
        return res.status(404).json(errors("Notification not found"));
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