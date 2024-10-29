import { Schema, model, ObjectId, Date } from "mongoose";

const MaintenanceBillSchema = new Schema(
  {
    houseNumber: { type: ObjectId, ref: "HouseMst", required: true },
    userId: { type: ObjectId, ref: "User", required: true },
    penalty: {type: Number, default: 0},
    month: { type: String, required: true},
    year: { type: String, required: true},
    totalAmount: { type: Number, required: true },
    generationDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending"},
    paymentPaid:{ type: Map, of:String},
    maintenanceConfig:{
        maintenanceAmount: { type: Number, required: true }, // Amount to be paid
        maintenanceFrequency: { type: String, enum: ["monthly", "quarterly", "annually"], required: true }, // How often maintenance is due
        dueDay: { type: Number, required: true, default: 10}, // Maintenance due date
        latePaymentPenalty: { type: Number, default: 0 }, // Penalty for late payment
    }
  },
  {
    timestamps: true, // This should be here to enable createdAt and updatedAt
  }
);

export const MaintenanceBill = model("MaintenanceBill", MaintenanceBillSchema);
