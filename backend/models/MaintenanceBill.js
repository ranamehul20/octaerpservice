import { Schema, model, ObjectId, Date } from "mongoose";

const MaintenanceBillSchema = new Schema(
  {
    houseNumber: { type: ObjectId, ref: "HouseMst", required: true },
    userId: { type: ObjectId, ref: "User", required: true },
    societyId: { type: ObjectId, ref: "SocietyMst", required: true }, // Reference to the society
    blockNumber: { type: String, ref: 'BlockMst', required: false }, // Block number (optional)
    penalty: { type: Number, default: 0 },
    month: { type: String, required: true },
    year: { type: String, required: true },
    generationDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "paid","overdue"], default: "pending" },
    razorpayOrderId: { type: String, default: null }, // Razorpay Order ID
    paymentId: { type: ObjectId, default: null },
    maintenanceConfig: {
      maintenanceAmount: { type: Number, required: true },
      maintenanceFrequency: {
        type: String,
        enum: ["monthly", "quarterly", "annually"],
        required: true,
      },
      dueDay: { type: Number, required: true, default: 10 },
      latePaymentPenalty: { type: Number, default: 0 },
      gstApplicable: { type: String, required: false},
      gstPercentage: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export const MaintenanceBill = model("MaintenanceBill", MaintenanceBillSchema);
