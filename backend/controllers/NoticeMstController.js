import { NoticeMst } from "../models/NoticeMst.js";
import { UserDetails } from "../models/UserDetailsModel.js";
import { noticeValidator } from "../utils/validator.js";
import { success, errors, validation } from "../utils/common.js";
import {
  NOTICE_DEFAULT,
  NOTICE_GENERAL,
  NOTICE_EVENT,
  NOTICE_STATUS_PENDING,
  NOTICE_STATUS_SENT,
  NOTICE_MAINTENANCE_DUE,
  NOTICE_BLOCK_WISE,
  NOTICE_WORK_OR_MAINTENANCE_ACTIVITY,
  NOTICE_VIOLATION,
  NOTICE_POLICY_AND_RULE_CHANGES,
} from "../utils/constants.js";
import admin from "firebase-admin";
import serviceAccount from "../octa-society-firebase-adminsdk-qsa1p-a8f2732f75.json" assert { type: "json" };
import { BlockMst } from "../models/BlockMst.js";
import { ChangeLogs } from "../models/ChangeLogs.js";
import { Notification } from '../models/Notification.js';
import Schema from "mongoose";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const create = async (req, res) => {
  try {
    const data = req.body;

    // Fetch user details
    const details = await UserDetails.findOne({ userId: req.user._id }).populate("userId");
    if (!details) {
      return res.status(404).json(errors("User details not found"));
    }

    data.societyId = details.societyId;
    data.blockId = data.blockId?.map((block) => Schema.Types.ObjectId.createFromHexString(block)) || [];
    // Validate notice data
    const validator = await noticeValidator(data);
    if (!validator.isValid) {
      return res.status(422).json(validation(Object.values(validator.errors).join(",")));
    }
    console.log("Transformed Data:", data);
    // Create and save the notice
    const notice = new NoticeMst({
      title: data.title,
      description: data.description,
      societyId: data.societyId,
      blockId: data.blockId,
      category: data.category,
      createdBy: req.user._id,
    });    

    await notice.save();

    // Fetch the notice with populated society details
    const populatedNotice = await NoticeMst.findById(notice._id).populate("societyId");

    // Prepare device tokens for notification
    const deviceTokens = [];
    if (data.blockId && data.blockId.length > 0) {
      const users = await UserDetails.find({ blockNumber: { $in: data.blockId } }).populate("userId");
      for (const user of users) {
        if (user.userId?.fcmToken) {
          const notificationReq = new Notification({
            title: data.title,
            description: data.description,
            fcmToken: user.userId.fcmToken ?? '',
            category: "Notice",
            refId: notice._id,
            userId: user.userId._id,
            createdBy: req.user._id,
          });
          await notificationReq.save();
          deviceTokens.push(user.userId.fcmToken);
        }
      }
    } else {
      const users = await UserDetails.find({ societyId: data.societyId }).populate("userId");
      for (const user of users) {
        if (user.userId?.fcmToken) {
          const notificationReq = new Notification({
            title: data.title,
            description: data.description,
            fcmToken: user.userId.fcmToken ?? '',
            category: "Notice",
            refId: notice._id,
            userId: details.userId._id,
            createdBy: req.user._id,
          });
          await notificationReq.save();
          deviceTokens.push(details.userId.fcmToken);
        }
      }
    }

    console.log("deviceTokens", deviceTokens);

    // Send notification
    if (deviceTokens.length > 0) {
      const message = {
        notification: {
          title: data.title,
          body: data.description,
        },
        tokens: deviceTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log("Successfully sent message:", response);
    } else {
      console.log("No valid device tokens found.");
    }

    // Categorize notice
    const categories = {
      [NOTICE_MAINTENANCE_DUE]: "Maintenance Dues Notice",
      [NOTICE_POLICY_AND_RULE_CHANGES]: "Policy and Rule Changes",
      [NOTICE_EVENT]: "Event Notice",
      [NOTICE_WORK_OR_MAINTENANCE_ACTIVITY]: "Work or Maintenance Activity Notice",
      [NOTICE_VIOLATION]: "Violation Notice",
    };
    const category = categories[populatedNotice.category] || "General Notice";

    // Construct response
    const noticeResponse = {
      _id: populatedNotice._id,
      title: populatedNotice.title,
      description: populatedNotice.description,
      societyId: populatedNotice.societyId?.name,
      blockId:populatedNotice.blockId,
      categoryId: populatedNotice.category,
      createdAt: populatedNotice.createdAt,
      updatedAt: populatedNotice.updatedAt,
    };

    return res
      .status(200)
      .json(success("Notice created successfully", noticeResponse, res.statusCode));
  } catch (error) {
    console.error("Error creating notice:", error);
    return res.status(500).json(errors(error.message, res.statusCode));
  }
};

export const update = async (req, res) => {
  try {
    const data = req.body;

    // Fetch user details
    const details = await UserDetails.findOne({ userId: req.user._id }).populate("userId");
    if (!details) {
      return res.status(404).json(errors("User details not found"));
    }

    data.societyId = details.societyId;
    data.blockId = data.blockId?.map((block) => Schema.Types.ObjectId.createFromHexString(block)) || [];
    // Validate notice data
    const validator = await noticeValidator(data);
    if (!validator.isValid) {
      return res.status(422).json(validation(Object.values(validator.errors).join(",")));
    }
    console.log("Transformed Data:", data);
    // Fetch original notice data
    const originalData = await NoticeMst.findOne({ _id: req.params.id,status:1 });
    if (!originalData) {
      return res.status(404).json(errors("Notice Data not found"));
    }

    // Save change log
    const log = new ChangeLogs({
      method: req.method,
      collectionName: "NoticeMst",
      url: req.url,
      originalData: originalData.toObject(),
      updatedData: data,
    });
    await log.save();
    console.log("Change log saved successfully");

    // Update the notice
    const notice = await NoticeMst.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: data.title,
          description: data.description,
          blockId: data.blockId ?? [],
          category: data.category,
          updatedBy: req.user._id,
        },
      },
      { new: true } // Return updated document
    ).populate("societyId");

    if (!notice) {
      return res.status(404).json(errors("Notice not found"));
    }

    // Prepare device tokens for notification
    const deviceTokens = [];
    if (data.blockId && data.blockId.length > 0) {
      const users = await UserDetails.find({ blockNumber: { $in: data.blockId } }).populate("userId");
      for (const user of users) {
        if (user.userId?.fcmToken) {
          const notificationReq = new Notification({
            title: data.title,
            description: data.description,
            fcmToken: user.userId.fcmToken ?? '',
            category: "Notice",
            refId: notice._id,
            userId: user.userId._id,
            createdBy: req.user._id,
          });
          await notificationReq.save();
          deviceTokens.push(user.userId.fcmToken);
        }
      }
    } else {
      const users = await UserDetails.find({ societyId: data.societyId }).populate("userId");
      for (const user of users) {
        if (user.userId?.fcmToken) {
          const notificationReq = new Notification({
            title: data.title,
            description: data.description,
            fcmToken: user.userId.fcmToken ?? '',
            category: "Notice",
            refId: notice._id,
            userId: details.userId._id,
            createdBy: req.user._id,
          });
          await notificationReq.save();
          deviceTokens.push(details.userId.fcmToken);
        }
      }
    }

    console.log("deviceTokens", deviceTokens);

    // Send notification
    if (deviceTokens.length > 0) {
      const message = {
        notification: {
          title: data.title,
          body: data.description,
        },
        tokens: deviceTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log("Successfully sent message:", response);
    } else {
      console.log("No valid device tokens found.");
    }

    // Categorize notice
    const categories = {
      [NOTICE_MAINTENANCE_DUE]: "Maintenance Dues Notice",
      [NOTICE_POLICY_AND_RULE_CHANGES]: "Policy and Rule Changes",
      [NOTICE_EVENT]: "Event Notice",
      [NOTICE_WORK_OR_MAINTENANCE_ACTIVITY]: "Work or Maintenance Activity Notice",
      [NOTICE_VIOLATION]: "Violation Notice",
    };
    const category = categories[notice.category] || "General Notice";

    // Construct response
    const noticeResponse = {
      _id: notice._id,
      title: notice.title,
      description: notice.description,
      societyId: notice.societyId?.name,
      blockId:notice.blockId,
      categoryId: notice.category,
      createdAt: notice.createdAt,
      updatedAt: notice.updatedAt,
    };

    res
      .status(200)
      .json(success("Notice updated successfully", noticeResponse, res.statusCode));
    next();
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json(errors(error.message, res.statusCode));
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate, description, title, searchText } = req.query;

    // Fetch the current user's details
    const currentUser = await UserDetails.findOne({ userId: req.user._id });

    // Construct the query filter object
    const filters = {
      societyId: currentUser.societyId,
      status: 1,
    };

    // Add category filter if provided
    const categoryMap = {
      "General Notice": NOTICE_GENERAL,
      "Maintenance Dues Notice": NOTICE_MAINTENANCE_DUE,
      "Policy and Rule Changes": NOTICE_POLICY_AND_RULE_CHANGES,
      "Event Notice": NOTICE_EVENT,
      "Work or Maintenance Activity Notice": NOTICE_WORK_OR_MAINTENANCE_ACTIVITY,
      "Violation Notice": NOTICE_VIOLATION,
    };
    if (category) {
      const mappedCategory = categoryMap[category];
      if (mappedCategory) {
        filters.category = mappedCategory;
      } 
    }

    if (description) {
      filters.description = { $regex: description, $options: "i" }
    }

    if (title) {
      filters.title = { $regex: title, $options: "i" }
    }

    if(searchText){
      filters["$or"] = [
        { title: { $regex: req.query.searchText, $options: "i" } },
        { description: { $regex: req.query.searchText, $options: "i" } },
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

    // Count the total number of notices with the applied filters
    const totalCount = await NoticeMst.countDocuments(filters);

    // Fetch the filtered notices
    const notices = await NoticeMst.find(filters)
      .populate("societyId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Handle case when no notices are found
    if (!notices.length) {
      res.status(200).json(
        success(
          "Notices not found",
          {
            totalCount,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            notices: [],
          },
          res.statusCode
        )
      );
    }

    // Transform the notices for response
    const noticeList = notices.map((notice) => {
      let categoryName = "";
      switch (notice.category) {
        case NOTICE_MAINTENANCE_DUE:
          categoryName = "Maintenance Dues Notice";
          break;
        case NOTICE_POLICY_AND_RULE_CHANGES:
          categoryName = "Policy and Rule Changes";
          break;
        case NOTICE_EVENT:
          categoryName = "Event Notice";
          break;
        case NOTICE_WORK_OR_MAINTENANCE_ACTIVITY:
          categoryName = "Work or Maintenance Activity Notice";
          break;
        case NOTICE_VIOLATION:
          categoryName = "Violation Notice";
          break;
        default:
          categoryName = "General Notice";
      }
      return {
        _id: notice._id,
        title: notice.title,
        description: notice.description,
        societyId: notice.societyId.name,
        blockId:notice.blockId,
        category: categoryName,
        categoryId: notice.category,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
      };
    });

    // Send the response with pagination and filtered results
    res.status(200).json(
      success(
        "Notices fetched successfully",
        {
          totalCount,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          notices: noticeList,
        },
        res.statusCode
      )
    );
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    next(error);
  }
};

export const noticeCategories = (req, res) => {
  const category = [
    { value: NOTICE_GENERAL, label: "Default" },
    { value: NOTICE_MAINTENANCE_DUE, label: "Maintenance Dues" },
    { value: NOTICE_POLICY_AND_RULE_CHANGES, label: "Policy and Rule Changes" },
    { value: NOTICE_EVENT, label: "Event" },
    {
      value: NOTICE_WORK_OR_MAINTENANCE_ACTIVITY,
      label: "Work or Maintenance Activity",
    },
    { value: NOTICE_VIOLATION, label: "Violation" },
  ];
  res
    .status(200)
    .json(
      success("Notice category fetched successfully", category, res.statusCode)
    );
};

export const deleteNotice = async(req, res) => {
  const varOcg = req.params.id; // Extract the notice ID from request parameters

  try {
    // Fetch original notice data
    const originalData = await NoticeMst.findOne({ _id: req.params.id,status:1 });
    if (!originalData) {
      return res.status(404).json(errors("Notice data not found"));
    }
    const data={
      status:2,
      updatedBy: req.user._id
    }
    // Save change log
    const log = new ChangeLogs({
      method: req.method,
      collectionName: "NoticeMst",
      url: req.url,
      originalData: originalData.toObject(),
      updatedData: data,
    });
    await log.save();
    console.log("Change log saved successfully");

    const deletedNotice = await NoticeMst.findByIdAndUpdate(
      varOcg,
      {
        $set: {
          status:2,
          updatedBy: req.user._id,
        },
      },
      { new: true } // Return updated document
    ).populate("societyId");

    if (!deletedNotice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    res.status(200).json({ message: 'Notice deleted successfully.', data: [] });
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notice.', error: error.message });
    next(error);
  }
};
