import { User } from "../models/UserModel.js";
import { HouseMst } from "../models/HouseMst.js";
import { MaintenanceBill } from "../models/MaintenanceBill.js";
import moment from "moment";
import { UserDetails } from "../models/UserDetailsModel.js";
import { MEMBER, TENANT } from "../utils/constants.js";
import { success, errors, validation,dateConverter,maintainanceAmount } from "../utils/common.js";
import { ChangeLogs } from "../models/ChangeLogs.js";
import { BlockMst } from "../models/BlockMst.js";
import Schema from "mongoose";

export const generateBills = async (req, res, next) => {
  try {
    // Fetch users from the database
    const houses = await HouseMst.find().populate("societyId").populate('blockId');
    const billGenerationPromises = houses.map(async (house) => {
      if (
        house.societyId &&
        house.societyId.settings &&
        house.societyId.settings.maintenanceAmount
      ) {
        if (house.societyId.settings.maintenanceFrequency === "quarterly") {
          let month = moment().format("MMM");
          let year = moment().format("YYYY");
          const quarterlyMonth = ["Jan", "Apr", "Jul", "Oct"];
          if (quarterlyMonth.includes(month)) {
            return generate(
              house,
              month,
              year,
              house.societyId.settings.maintenanceFrequency
            );
          }
        } else if (
          house.societyId.settings.maintenanceFrequency === "annually" ||
          house.societyId.settings.maintenanceFrequency === "monthly"
        ) {
          let month = moment().format("MMM");
          let year = moment().format("YYYY");
          return generate(
            house,
            month,
            year,
            house.societyId.settings.maintenanceFrequency
          );
        }
      }
    });
    // Wait for all bills to be processed
    await Promise.all(billGenerationPromises);

    // Send response after all operations are complete
    console.log("Maintenance bills generated successfully");
  } catch (error) {
    console.error("Error generating maintenance bills:", error);
  }
};

async function generate(house, month, year, frequency) {
  try {
    const userId = await getUser(house._id);
    if (!userId) {
      console.log("No user found for house", house._id);
      return;
    }
    if (frequency == "yearly") {
      const checkExists = await MaintenanceBill.findOne({
        userId: userId,
        year: year,
        houseNumber: house._id,
      });
      if (checkExists) {
        console.log(
          "Bill already exists for house and society",
          house._id.toString(),
          house.societyId.name
        );
        return;
      }
    } else {
      const checkExists = await MaintenanceBill.findOne({
        userId: userId,
        month: month,
        year: year,
        houseNumber: house._id,
      });
      if (checkExists) {
        console.log(
          "Bill already exists for house and society",
          house._id.toString(),
          house.societyId.name
        );
        return;
      }
    }
    let curDate = new Date();
    let dueDate = new Date(curDate);
    dueDate.setDate(curDate.getDate() + house.societyId.settings.dueDay);
    const bill = new MaintenanceBill({
      houseNumber: house._id,
      userId: userId,
      societyId:house.societyId._id,
      blockNumber:blockId._id,
      month: month,
      year: year,
      generationDate: curDate,
      dueDate: dueDate,
      maintenanceConfig: {
        maintenanceAmount: house.societyId.settings.maintenanceAmount,
        maintenanceFrequency: house.societyId.settings.maintenanceFrequency,
        dueDay: house.societyId.settings.dueDay,
        latePaymentPenalty: house.societyId.settings.latePaymentPenalty,
        gstApplicable: house.societyId.settings.gstApplicable,
        gstPercentage: house.societyId.settings.gstPercentage
      },
    });
    const result = await bill.save();
    if (result) {
      console.log(
        "Bill generated successfully for house and  society",
        house._id.toString(),
        house.societyId.name
      );
      return;
    }
  } catch (error) {
    console.error("Error generating maintenance bills:", error);
    return;
  }
}

async function getUser(houseId) {
  try {
    console.log("Getting user", houseId);
    const userResults = await UserDetails.aggregate([
      {
        $lookup: {
          from: "users", // Collection name of User (lowercase plural form)
          localField: "userId",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: "$users",
      },
      {
        $match: {
          "users.role": TENANT, // Filter based on the role field in User collection
          houseNumber: houseId,
        },
      },
      {
        $project: {
          houseNumber: 1,
          "users.role": 1,
          userId: 1,
        },
      },
      { $limit: 1 },
    ]);
    if (userResults.length > 0) {
      return userResults[0].userId;
    }
    const userMemberResults = await UserDetails.aggregate([
      {
        $lookup: {
          from: "users", // Collection name of User (lowercase plural form)
          localField: "userId",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: "$users",
      },
      {
        $match: {
          "users.role": MEMBER, // Filter based on the role field in User collection
          houseNumber: houseId,
        },
      },
      {
        $project: {
          houseNumber: 1,
          "users.role": 1,
          userId:1,
        },
      },
      { $limit: 1 },
    ]);
    if (userMemberResults.length > 0) {
      return userMemberResults[0].userId;
    }
  } catch (error) {
    console.error("Error fetching user details by role:", error);
  }
}

export const findOverdueMaintenanceBills = async (req, res, next) => {
try {
    // Current date for comparison
    const currentDate = moment().toDate();

    // Query to find bills that are pending and have a past due date
    const overdueBills = await MaintenanceBill.find({
      status: "pending",
      dueDate: { $lt: currentDate }
    });
    overdueBills.map(async (bill) => {
        try {
            // Calculate the penalty amount
            const penaltyAmount = bill.maintenanceConfig.latePaymentPenalty;

            // Update the bill status to 'overdue' and add the penalty amount
            await MaintenanceBill.findByIdAndUpdate(bill._id, {
                status: "overdue",
                penalty: penaltyAmount
            });

            // Send notification to the user
            console.log(`Notification sent to user ${bill.userId} for overdue maintenance bill ${bill._id}`);
        } catch (error) {
            console.error(`Error updating bill status for overdue bill ${bill._id}:`, error);
        }
    });

} catch (error) {
    console.error("Error checking amount maintenance bills:", error);
}
};

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, userId, month, year, blockNumber, houseNumber, sort } = req.query;

    let filters = {};
    if (req.user.role == process.env.CHAIRMEN) {
      filters = { societyId: req.userDetails.societyId };
    } else if (req.user.role != process.env.SUPER_ADMIN && req.user.role != process.env.CHAIRMEN) {
      filters = { userId: req.user._id };
    }

    if (userId) filters.userId = userId;
    if (status) filters.status = status.toLowerCase();

    // 🔹 Handle multiple months (e.g., ?month=Jan,Feb)
    if (month) {
      const monthArray = month.split(",").map((m) => m.trim());
      filters.month = { $in: monthArray };
    }

    // 🔹 Handle multiple years (e.g., ?year=2023,2024)
    if (year) {
      const yearArray = year.split(",").map((y) => parseInt(y.trim(), 10));
      filters.year = { $in: yearArray };
    }

    // Handle multiple block numbers (e.g., ?blockNumber=101,102)
    if (blockNumber) {
      filters["blockNumber._id"] = { $in: blockNumber };
    }

    //  Handle multiple house numbers (e.g., ?houseNumber=A1,A2)
    if (houseNumber) {
      filters["houseNumber._id"] = { $in: houseNumber };
    }

    const parsedLimit = parseInt(limit, 10);

    //  Multi-field sorting
    let sortOptions = { createdAt: -1 }; // Default sorting
    if (sort) {
      sortOptions = sort.split(",").reduce((acc, field) => {
        const [key, order] = field.split(":");
        acc[key] = order === "asc" ? 1 : -1;
        return acc;
      }, {});
    }

    console.log("filters", filters);
    console.log("sortOptions", sortOptions);

    const totalCount = await MaintenanceBill.countDocuments(filters);
    const maintenanceBills = await MaintenanceBill.find(filters)
      .populate("houseNumber userId blockNumber")
      .sort(sortOptions)
      .skip((page - 1) * parsedLimit)
      .limit(parsedLimit)
      .collation({ locale: "en", strength: 2 }); // Case-insensitive sorting

    const bills = [];

    for (const item of maintenanceBills) {
      const details = await UserDetails.findOne({ userId: item.userId._id })
        .populate("societyId")
        .populate("blockNumber")
        .populate("houseNumber") || {}; // Default to empty object

      let totalAmount = maintainanceAmount(item);
      let gstAmount = 0;
      let cgst = 0;
      let sgst = 0;

      if (item.maintenanceConfig.gstApplicable && item.maintenanceConfig.gstApplicable == "yes") {
        gstAmount = (totalAmount * item.maintenanceConfig.gstPercentage) / 100;
      }

      if (gstAmount !== 0) {
        cgst = gstAmount / 2;
        sgst = gstAmount / 2;
      }

      const razorpayFee = (totalAmount * process.env.RAZORPAY_FEE_PERCENT) / 100;
      const gstOnFee = (razorpayFee * process.env.RAZORPAY_GST_PERCENT) / 100;
      totalAmount = totalAmount + razorpayFee + gstOnFee;

      bills.push({
        _id: item._id,
        houseNumber: item.houseNumber.name,
        blockNumber: item.blockNumber.name,
        userId: item.userId.name,
        month: item.month, // Month stored as string (e.g., "Mar")
        year: item.year,
        generationDate: item.generationDate,
        dueDate: item.dueDate,
        status: item.status,
        maintenanceDetails: {
          maintenanceAmount: item.maintenanceConfig.maintenanceAmount,
          totalAmount: totalAmount.toFixed(2),
          penalty: item.penalty,
          platformFee: razorpayFee + gstOnFee,
          CGST: cgst,
          SGST: sgst,
        },
        memberDetails: {
          email: item.userId.email,
          role: item.userId.role,
          isDefaultPassword: item.userId.isDefaultPassword,
          firstName: details.firstName || "",
          lastName: details.lastName || "",
          createdAt: details.createdAt || "",
          roleName:
            item.userId.role == process.env.SUPER_ADMIN
              ? "Super Admin"
              : item.userId.role == process.env.CHAIRMEN
              ? "Chairman"
              : item.userId.role == process.env.MEMBERS
              ? "House Owner"
              : "TENANT",
          phoneNumber: details.phoneNumber || "",
          alternativePhoneNumber: details.alternativePhoneNumber || "",
          dateOfBirth: details.dateOfBirth ? dateConverter(details.dateOfBirth) : "",
          street: details.street || "",
          locality: details.locality || "",
          city: details.city || "",
          state: details.state || "",
          country: details.country || "",
          zipCode: details.zipCode || "",
          societyId: details.societyId ? details.societyId._id : "",
          societyName: details.societyId ? details.societyId.name : "",
          blockNumber: details.blockNumber ? details.blockNumber._id : "",
          blockName: details.blockNumber ? details.blockNumber.name : "",
          houseNumber: details.houseNumber ? details.houseNumber._id : "",
          houseName: details.houseNumber ? details.houseNumber.name : "",
          totalMembers: details.totalMembers || 0,
          photo: details.photo
            ? `${req.protocol}://${req.get("host")}/api/${details.photo.replace(/\\/g, "/")}`
            : "",
        },
      });
    }

    return res.status(200).json(
      success(
        "Bills fetched successfully",
        {
          totalCount,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parsedLimit),
          bills,
        },
        res.statusCode
      )
    );
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    return next(error);
  }
};






export const getDetails = async (req, res, next) => {
  try {
      const {paymentMethod}=req.query;
      const id = req.params.id;
      const maintenanceBill = await MaintenanceBill.findOne({_id:Schema.Types.ObjectId.createFromHexString(id)}).populate("houseNumber userId");
      if(!maintenanceBill){
        res.status(404).json(errors("Maintenance Bill not found", res.statusCode));
        return next();
      }
      const userDetails = await UserDetails.findOne({userId:maintenanceBill.userId._id}).populate('societyId')        // Populate the 'userId' field (reference to User)
      .populate('blockNumber')   // Populate the 'blockNumber' field (reference to BlockNumber)
      .populate('houseNumber');
      if(!userDetails){
        res.status(404).json(errors("User not found", res.statusCode));
        return next();
      }
      const block = await BlockMst.findOne({_id:userDetails.blockNumber});
      if(!block){
        res.status(404).json(errors("Block not found", res.statusCode));
        return next();
      }
      let totalAmount = maintainanceAmount(maintenanceBill);
      let gstAmount = 0;
      let cgst=0;
      let sgst=0;
      if(maintenanceBill.maintenanceConfig.gstApplicable && maintenanceBill.maintenanceConfig.gstApplicable=='yes'){
        gstAmount = (total*maintenanceBill.maintenanceConfig.gstPercentage)/100;
      }
      if(gstAmount != 0){
        cgst = gstAmount/2;
        sgst = gstAmount/2;
      }
      let razorpayFee=0;
      let gstOnFee=0;
      if(paymentMethod && paymentMethod.toLowerCase()=='online'){
        razorpayFee = (totalAmount*process.env.RAZORPAY_FEE_PERCENT)/100;
        gstOnFee = (razorpayFee*process.env.RAZORPAY_GST_PERCENT)/100;
        totalAmount= totalAmount+razorpayFee + gstOnFee;
      }
      const bills ={
        _id: maintenanceBill._id,
        houseNumber: maintenanceBill.houseNumber.name,
        userId: maintenanceBill.userId.name,
        month: maintenanceBill.month,
        year: maintenanceBill.year,
        generationDate: maintenanceBill.generationDate,
        dueDate: maintenanceBill.dueDate,
        status: maintenanceBill.status,
        razorpayOrderId: maintenanceBill.razorpayOrderId || "",
        currency: "INR",
        maintenanceDetails:{
          maintenanceAmount:maintenanceBill.maintenanceConfig.maintenanceAmount,
          totalAmount: totalAmount.toFixed(2),
          penalty: maintenanceBill.penalty,
          platformFee: razorpayFee + gstOnFee,
          CGST:cgst,
          SGST:sgst,
        },
        memberDetails: {
          email: maintenanceBill.userId.email,
          role: maintenanceBill.userId.role,
          isDefaultPassword: maintenanceBill.userId.isDefaultPassword,
          firstName: userDetails.firstName || "",
          lastName: userDetails.lastName || "",
          createdAt: userDetails.createdAt || "",
          roleName:
          maintenanceBill.userId.role == process.env.SUPER_ADMIN
              ? "Super Admin"
              : maintenanceBill.userId.role == process.env.CHAIRMEN
              ? "Chairman"
              : maintenanceBill.userId.role == process.env.MEMBERS
              ? "House Owner"
              : "TENANT",
          phoneNumber: userDetails.phoneNumber || "",
          alternativePhoneNumber: userDetails.alternativePhoneNumber || "",
          dateOfBirth: userDetails.dateOfBirth ? dateConverter(userDetails.dateOfBirth) : "",
          street: userDetails.street || "",
          locality: userDetails.locality || "",
          city: userDetails.city || "",
          state: userDetails.state || "",
          country: userDetails.country || "",
          zipCode: userDetails.zipCode || "",
          societyId: userDetails.societyId ? userDetails.societyId._id : "",
          societyName: userDetails.societyId ? userDetails.societyId.name : "",
          blockNumber: userDetails.blockNumber ? userDetails.blockNumber._id : "",
          blockName: userDetails.blockNumber ? userDetails.blockNumber.name : "",
          houseNumber: userDetails.houseNumber ? userDetails.houseNumber._id : "",
          houseName: userDetails.houseNumber ? userDetails.houseNumber.name : "",
          totalMembers: userDetails.totalMembers || 0,
          photo: userDetails.photo
            ? `${req.protocol}://${req.get("host")}/api/${userDetails.photo.replace(/\\/g, "/")}`
            : "", // Include photo URL/path
        },
    };
      res
      .status(200)
      .json(success("Bills fetched successfully", bills, res.statusCode));
     next();
  } catch (error) {
      res.status(500).json(errors(error.message, res.statusCode));
      next(error);
  }
};

export const duplicateMaintenance = async (req, res, next)=>{
  const house = await HouseMst.findOne({_id:req.body.house_id});
  console.log(house);
  const userId = req.body.user_id;
  const block = await BlockMst.findOne({societyId:house.societyId});
  let curDate = new Date();
  let dueDate = new Date(curDate);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const month = monthNames[new Date().getMonth()];
  dueDate.setDate(curDate.getDate() + 10);
  const year = curDate.getFullYear();
  const bill = new MaintenanceBill({
    houseNumber: house._id,
    userId: userId,
    societyId:house.societyId._id,
    blockNumber:block._id,
    month: month,
    year: new Date().getFullYear(),
    generationDate: curDate,
    dueDate: dueDate,
    maintenanceConfig: {
      maintenanceAmount: 500,
      maintenanceFrequency: "monthly",
      dueDay: 10,
      latePaymentPenalty: 0,
    },
  });
  const result = await bill.save();
  if (result) {
    console.log(
      "Bill generated successfully for house and  society",
      house._id.toString(),
      house.societyId.name
    );
    res
      .status(200)
      .json(success("Duplicate Bill generated successfully for house and  society", {}, res.statusCode));
      return next();
  }
  res.status(500).json(errors(error.message, res.statusCode));
  return next(error);
};