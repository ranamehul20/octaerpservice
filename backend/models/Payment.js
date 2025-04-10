import { Schema, model, ObjectId, Date } from "mongoose";

const PaymentSchema  = new Schema(
  {
    maintenanceBillId: { type: ObjectId, ref: "MaintenanceBill", required: true },
    userId: { type: ObjectId, ref: "User", required: true },
    paymentDate: { type: Date, default: Date.now },
    amountPaid: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    paymentMode: { type: String, enum: ["online", "cash"], required: true },
    razorpayOrderId: { type: String, default: null }, // Razorpay Order ID
    razorpayPaymentId: { type: String, default: null }, // Razorpay Payment ID
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export const Payment = model("Payment", PaymentSchema);
