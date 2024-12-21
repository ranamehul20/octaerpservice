import { Schema, model,ObjectId,Date } from "mongoose";

const NoticeMstSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: Number, required: true, default:1},
    societyId: { type: String, ref: 'SocietyMst', required:true},
    status: { type: Number, required: false, default:1},
    blockId: { type: Map, ref: 'BlockMst', required:true},
    createdBy: {type:ObjectId,ref: 'User', required:false},
    updatedBy: {type:ObjectId,ref: 'User', required:false}
},{
    timestamps: true // This should be here to enable createdAt and updatedAt
  });

  NoticeMstSchema.pre('save', async function(next) {
    if (!this.isModified('name')) return next();
    // const existingBlock = await BlockMst.findOne({ name: this.name, societyId: this.societyId });
    // if (existingBlock) return next(new Error('Block already exists'));
    next();
  });

  
  
export const NoticeMst = model("NoticeMst", NoticeMstSchema);