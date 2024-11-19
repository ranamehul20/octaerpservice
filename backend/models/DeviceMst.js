import { Schema, model,ObjectId,Date } from "mongoose";

const DeviceMstSchema = new Schema({
    deviceId: { type: String, required: true, trim: true },
    userId: { type: String, required: false },
    blockNumber: { type: ObjectId, ref: 'BlockMst', required: false},
    houseNumber: { type: ObjectId, ref: 'HouseMst', required: false},
    societyId: { type: ObjectId, ref: 'SocietyMst', required:false},
},{
    timestamps: true // This should be here to enable createdAt and updatedAt
});

export const DeviceMst = model("DeviceMst", DeviceMstSchema);