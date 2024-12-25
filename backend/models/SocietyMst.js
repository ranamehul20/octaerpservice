import { Schema, model,ObjectId,Date } from "mongoose";

const SocietyMstSchema = new Schema({
    name: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    city: { type: Number, required: true, trim: true },
    state: { type: Number, required: true, trim: true },
    country: { type: Number, required: true, trim: true },
    zipCode: { type: Number, required: true, trim: true },
    establishment: { type: Date, required: false, trim: true},
    type: { type:Number, required: true},
    settings:{
        logo: {type: String, required: false},
        currency: {type: String, required: false},
        registrationNumber: {type: String, required: false},
        bankDetails: {type: String, required: false},
        bankName: {type: String, required: false},
        bankBranch: {type: String, required: false},
        bankAccountNumber: {type: String, required: false},
        bankIFSCCode: {type: String, required: false},
        // Maintenance Settings
        maintenanceAmount: { type: Number, required: true }, // Amount to be paid
        maintenanceFrequency: { type: String, enum: ['monthly', 'quarterly', 'annually'], required: true }, // How often maintenance is due
        dueDay: { type: Number, required: true , default: 10}, // Maintenance due date
        latePaymentPenalty: { type: Number, default: 0 }, // Penalty for late payment
        
        // Optional additional fields
        lastPaymentDate: { type: Date }, // Last maintenance payment date for tracking
        totalCollectedMaintenance: { type: Number, default: 0 }, // Track total collected maintenance

    },
    createdBy: {type:ObjectId, ref: 'User', required:false},
    updatedBy: {type:ObjectId,ref: 'User', required:false}
},{
    timestamps: true // This should be here to enable createdAt and updatedAt
  });

export const SocietyMst = model("SocietyMst", SocietyMstSchema);