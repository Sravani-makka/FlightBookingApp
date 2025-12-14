const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  booking_id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  flight_id: { type: String, required: true },
  price_paid: { type: Number, required: true },
  seats: { type: [String], default: [] },
  status: { type: String, default: "confirmed" },
  booking_time: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Booking", BookingSchema);