const mongoose = require("mongoose");

// ✅ Define SeatSchema first
const SeatSchema = new mongoose.Schema({
  seat_number: { type: String, required: true },  // e.g. "1A"
  is_booked: { type: Boolean, default: false }
});

// ✅ Now define FlightSchema
const FlightSchema = new mongoose.Schema({
  flight_id: { type: String, required: true, unique: true },
  airline: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  base_price: { type: Number, required: true },
  current_price: { type: Number, default: null },
  seats: { type: [SeatSchema], default: [] }   // ✅ Now this works
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Flight || mongoose.model("Flight", FlightSchema);