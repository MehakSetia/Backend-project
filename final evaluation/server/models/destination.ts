import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  image: String,
});

export const Destination = mongoose.model("Destination", destinationSchema);
