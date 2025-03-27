import { Schema, model,ObjectId,Date } from "mongoose";

const feedbackSchema  = new Schema({
    userId: { type: ObjectId,ref: 'User', required: true },
    type: { type: String, required: false },
    message: { type: String, required: true },
}, { timestamps: true });

export const Feedback = model('Feedback', feedbackSchema);