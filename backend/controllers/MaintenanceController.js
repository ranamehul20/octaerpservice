import { User } from "../models/UserModel.js";
import { HouseMst } from "../models/HouseMst.js";
import { MaintenanceBill } from "../models/MaintenanceBill.js";
import moment from "moment";
import { UserDetails } from "../models/UserDetailsModel.js";
import { MEMBER, TENANT } from "../utils/constants.js";
import { success, errors, validation } from "../utils/common.js";
import { ChangeLogs } from "../models/ChangeLogs.js";

export const generateBills = async (req, res, next) => {
  try {
    // Fetch users from the database
    const houses = await HouseMst.find().populate("societyId");
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
      month: month,
      year: year,
      totalAmount: house.societyId.settings.maintenanceAmount,
      generationDate: curDate,
      dueDate: dueDate,
      maintenanceConfig: {
        maintenanceAmount: house.societyId.settings.maintenanceAmount,
        maintenanceFrequency: house.societyId.settings.maintenanceFrequency,
        dueDay: house.societyId.settings.dueDay,
        latePaymentPenalty: house.societyId.settings.latePaymentPenalty,
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
        const { page = 1, limit = 10,status } = req.query;
        const filters = {
          userId: req.user._id,
        };
        if(status){
          filters.status=status.toLowerCase()
        }
        const maintenanceBills = await MaintenanceBill.find(filters).populate("houseNumber userId").sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));;
        const bills =[];
        maintenanceBills.forEach((item) => {
            bills.push({
                _id: item._id,
                houseNumber: item.houseNumber.name,
                userId: item.userId.name,
                month: item.month,
                year: item.year,
                totalAmount: item.totalAmount,
                generationDate: item.generationDate,
                dueDate: item.dueDate,
                status: item.status,
                penalty: item.penalty
            });
        });
        res
        .status(200)
        .json(success("Bills fetched successfully", bills, res.statusCode));
       next();
    } catch (error) {
        res.status(500).json(errors(error.message, res.statusCode));
        next(error);
    }
};