// models/booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  checkin: Date,
  checkout: Date,
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "confirmed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
