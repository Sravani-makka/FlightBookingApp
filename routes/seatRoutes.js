const express = require("express");
const Flight = require("../Models/Flight");

const router = express.Router();

/* -----------------------------------------
   GET /api/seats/:flight_id
   Get all seats for a flight
------------------------------------------ */
router.get("/:flight_id", async (req, res) => {
  try {
    const { flight_id } = req.params;

    const flight = await Flight.findOne({ flight_id });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.json({
      message: "Seats fetched successfully",
      flight_id: flight.flight_id,
      seats: flight.seats
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   POST /api/seats/select
   Select seats for a flight (no payment here)
------------------------------------------ */
router.post("/select", async (req, res) => {
  try {
    const { flight_id, seats } = req.body;
    // seats = ["1A", "1B"]

    const flight = await Flight.findOne({ flight_id });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    // Check seat availability
    const unavailable = [];
    seats.forEach(seatNum => {
      const seat = flight.seats.find(s => s.seat_number === seatNum);
      if (!seat || seat.is_booked) {
        unavailable.push(seatNum);
      }
    });

    if (unavailable.length > 0) {
      return res.status(400).json({
        message: "Some seats are not available",
        unavailable
      });
    }

    // Mark selected seats as temporarily booked (soft lock)
    seats.forEach(seatNum => {
      const seat = flight.seats.find(s => s.seat_number === seatNum);
      if (seat) {
        seat.is_booked = true;
      }
    });

    await flight.save();

    res.json({
      message: "Seats selected successfully",
      selected_seats: seats
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;