import { Schema, model,ObjectId,Date } from "mongoose";

const HouseMstSchema = new Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    blockId: { type: ObjectId, ref: 'BlockMst', required:true},
    totalMembers: { type: Number, required: false, default:1, trim: true, default:0 },
    totalChildren: { type: Number, required: false, default:0, trim: true, default:0 },
    totalAdults: { type: Number, required: false, default:1, trim: true, default:0 },
    societyId: { type: ObjectId, ref: 'SocietyMst', required:true},
    createdBy: {type:ObjectId, ref: 'User', required:false},
    updatedBy: {type:ObjectId, ref: 'User', required:false}
},{
    timestamps: true // This should be here to enable createdAt and updatedAt
  });

export const HouseMst = model("HouseMst", HouseMstSchema);