import { Schema, model,ObjectId} from "mongoose";

const supportRequestSchema = new Schema({
    userId: { type: ObjectId, required: true, ref: 'User' }, // Reference to User model
    title: { type: String, required: true},
    category: { type: String, required: false }, // e.g., Maintenance, Complaint, Query
    description: { type: String, required: true },
    status: { type: String, default: 'pending' }
},{
    timestamps: true // This should be here to enable createdAt and updatedAt
});

export const SupportRequest = model('SupportRequest', supportRequestSchema);