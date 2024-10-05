import { Schema, model,ObjectId,Date } from "mongoose";

const UserDetailsSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: false },
    dateOfBirth: { type: Date, required: false},
    blockNumber: { type: ObjectId, ref: 'BlockMst', required: false},
    houseNumber: { type: ObjectId, ref: 'HouseMst', required: false},
    societyId: { type: ObjectId, ref: 'SocietyMst', required:false},
    totalMembers: { type: Number, required:true},
    street: { type: String, required: false, trim: true },
    locality: { type: String, required: false, trim: true },
    state: { type: String, required: false, trim: true },
    country: { type: String, required: false, trim: true },
    zipCode: { type: String, required: false, trim: true },
    userType: { type: Number, required: false},
    photo: {type: String,required:false},
    userId: { type: ObjectId, ref: 'User', required: true},
    createdBy: {type:ObjectId,ref: 'User', required:false},
    updatedBy: {type:ObjectId,ref: 'User', required:false}
},{
    timestamps: true // This should be here to enable createdAt and updatedAt
});

export const UserDetails = model("UserDetails", UserDetailsSchema);