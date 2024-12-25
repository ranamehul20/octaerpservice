import { Schema, model,ObjectId,Date } from "mongoose";

const NotificationSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    fcmToken: { type: String, required:true},
    userId: { type: ObjectId, ref:'User', required: true},
    status: { type: Number, required: false, default:1},
    category: { type: String, required: false, trim: true },
    refId: { type: ObjectId, required:false},
    createdBy: { type: ObjectId, ref: 'User', required:false},
    updatedBy: { type: ObjectId, ref: 'User', required:false}
},{
    timestamps: true // This should be here to enable createdAt and updatedAt
  });

  
  
export const Notification = model("Notification", NotificationSchema);