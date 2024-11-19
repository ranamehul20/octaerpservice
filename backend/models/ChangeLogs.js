import { Schema, model} from "mongoose";

const ChangeLogsSchema = new Schema({
  method: { type: String, required: true },
  collectionName: { type: String, required: true},
  url: { type: String, required: true },
  originalData: { type: Object, required: false },
  updatedData: { type: Object, required: false }
}, { timestamps: true });

export const ChangeLogs = model('ChangeLogs', ChangeLogsSchema);