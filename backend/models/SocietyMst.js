import { Schema, model,ObjectId,Date } from "mongoose";
import {Counter} from './Counter.js';

const SocietyMstSchema = new Schema({
    id: { type: Number, unique: true },
    name: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    city: { type: Number,ref: 'City',  required: true, trim: true },
    state: { type: Number,ref: 'State',  required: true, trim: true },
    country: { type: Number,ref: 'Country',  required: true, trim: true },
    zipCode: { type: Number, required: true, trim: true },
    establishment: { type: Date, required: false, trim: true},
    type: { type:Number, required: true},
    contactPerson: {
        name: {type: String, required: false},
        email: {type: String, required: false},
        phone: {type: String, required: false},
    },
    settings:{
        logo: {type: String, required: false},
        currency: {type: String, required: false},
        registrationNumber: {type: String, required: false},
        bankName: {type: String, required: false},
        bankBranch: {type: String, required: false},
        bankAccountNumber: {type: String, required: false},
        bankIFSCCode: {type: String, required: false},
        // Maintenance Settings
        maintenanceAmount: { type: Number, required: true }, // Amount to be paid
        maintenanceFrequency: { type: String, enum: ['monthly', 'quarterly', 'annually'], required: true }, // How often maintenance is due
        dueDay: { type: Number, required: true , default: 10}, // Maintenance due date
        latePaymentPenalty: { type: Number, default: 0 }, // Penalty for late payment
        gstApplicable: { type: String, required: false},
        gstPercentage: { type: Number, default: 0 },
        // Optional additional fields
        lastPaymentDate: { type: Date }, // Last maintenance payment date for tracking
        totalCollectedMaintenance: { type: Number, default: 0 }, // Track total collected maintenance
    },
    razorpayData:{
        accountId:{type: String, required: false},
        productId:{type: String, required: false},
        accountCreated:{type: Boolean, required: false,default:false},
        stackholderCreated:{type: Boolean, required: false,default:false},
        accountConfigure:{type: Boolean, required: false,default:false},
        updatedAccountConfigure:{type: Boolean, required: false,default:false},
    },
    createdBy: {type:ObjectId, ref: 'User', required:false},
    updatedBy: {type:ObjectId,ref: 'User', required:false}
},{
    timestamps: true // This should be here to enable createdAt and updatedAt
  });

  SocietyMstSchema.pre("save", async function (next) {
    if (!this.isNew) return next(); // Skip for updates
  
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "society" }, // Identifier for this collection's counter
        { $inc: { seq: 1 } }, // Increment sequence
        { new: true, upsert: true } // Create document if not exists
      );
      this.id = counter.seq; // Set the auto-incremented value
      next();
    } catch (error) {
      next(error);
    }
  });

export const SocietyMst = model("SocietyMst", SocietyMstSchema);