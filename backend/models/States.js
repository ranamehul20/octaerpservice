import { Schema, model,ObjectId,Date } from "mongoose";

const stateSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  country_id: { type: Number, required: true },
  country_code: { type: String, required: true },
  country_name: { type: String, required: true },
  state_code: { type: String, required: true },
  type: { type: String, default: null }, // Optional field
  latitude: { type: String, required: true },
  longitude: { type: String, required: true }
}, { timestamps: true });

export const States = model('State', stateSchema);