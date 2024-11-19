import { Schema, model} from "mongoose";

const ApiLogsSchema = new Schema({
  method: { type: String, required: true },
  url: { type: String, required: true },
  headers: { type: String, required: true },
  body: { type: String, required: true },
  query: { type: String, required: true },
}, { timestamps: true });

export const ApiLogs = model('ApiLogs', ApiLogsSchema);