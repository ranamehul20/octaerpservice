import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Identifier for the collection
  seq: { type: Number, default: 0 } // Sequence number
});

export const Counter = mongoose.model("Counter", CounterSchema);
