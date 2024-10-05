import { Schema, model,ObjectId,Date } from "mongoose";

const BlockMstSchema = new Schema({
    name: { type: String, required: true, trim: true },
    totalHouse: { type: Number, required: true, trim: true },
    societyId: { type: ObjectId, ref: 'SocietyMst', required:true},
    createdBy: {type:ObjectId,ref: 'User', required:false},
    updatedBy: {type:ObjectId,ref: 'User', required:false}
},{
    timestamps: true // This should be here to enable createdAt and updatedAt
  });

  BlockMstSchema.pre('save', async function(next) {
    if (!this.isModified('name')) return next();
    const existingBlock = await BlockMst.findOne({ name: this.name, societyId: this.societyId });
    if (existingBlock) return next(new Error('Block already exists'));
    next();
  });

  
  
export const BlockMst = model("BlockMst", BlockMstSchema);