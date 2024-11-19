import { Schema, model,ObjectId,Date } from "mongoose";

const TransactionHistorySchema = new Schema({
    description: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    amount: { type: Number, required: false, default:0, trim: true },
    societyId: { type: ObjectId, ref: 'SocietyMst', required:true},
    currency: { type: String, required: true, trim: true },
    createdBy: {type:ObjectId,ref: 'User', required:false},
    updatedBy: {type:ObjectId,ref: 'User', required:false}
},{
    timestamps: true // This should be here to enable createdAt and updatedAt
});
  
  
export const TransactionHistory = model("TransactionHistory", TransactionHistorySchema);