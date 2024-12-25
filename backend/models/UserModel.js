import { Schema, model,ObjectId,Date } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema({
    email: { type: String, required: true, trim: true, index: { unique: true } },
    password: { type: String, required: true },
    role: {type: Number, required:true},
    isDefaultPassword: {type:Boolean, required:false, default:true},
    activeDevice: {type: String, required:false, trim: true},
    fcmToken: {type: String, required:false, trim: true},
    isDeleted: {type:Boolean, required:false, default:false},
    createdBy: {type:ObjectId, required:false},
    updatedBy: {type:ObjectId, required:false}
},{
  timestamps: true // This should be here to enable createdAt and updatedAt
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.statics.findBy_id = async function (id) {
  return await this.findOne({_id: id});
};

UserSchema.statics.findBy_email = async function (email) {
  return await this.findOne({email});
};

export const User = model("User", UserSchema);