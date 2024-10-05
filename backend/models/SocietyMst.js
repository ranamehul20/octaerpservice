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
    },
    createdBy: {type:ObjectId, ref: 'User', required:false},
    updatedBy: {type:ObjectId,ref: 'User', required:false}
},{
    timestamps: true // This should be here to enable createdAt and updatedAt
  });

export const SocietyMst = model("SocietyMst", SocietyMstSchema);