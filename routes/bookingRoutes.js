const express = require("express");
const Flight = require("../Models/Flight");
const BookingAttempt = require("../Models/BookingAttempt");
const Booking = require("../Models/Booking");
const Wallet = require("../Models/Wallet");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* -----------------------------------------
   ✅ POST /api/bookings/attempt
   Logs booking attempts + surge pricing
------------------------------------------ */
router.post("/attempt", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { flight_id } = req.body;

    await BookingAttempt.create({ user_id, flight_id });

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const attempts = await BookingAttempt.find({
      user_id,
      flight_id,
      timestamp: { $gte: fiveMinutesAgo },
    });

    const flight = await Flight.findOne({ flight_id });
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    // ✅ Surge pricing
    if (attempts.length >= 3) {
      flight.current_price = Math.round(flight.base_price * 1.1);
      await flight.save();
    }

    // ✅ Reset price after 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentAttempt = await BookingAttempt.findOne({
      flight_id,
      timestamp: { $gte: tenMinutesAgo },
    });

    if (!recentAttempt) {
      flight.current_price = flight.base_price;
      await flight.save();
    }

    res.json({
      message: "Booking attempt logged",
      current_price: flight.current_price,
      attempts_last_5_min: attempts.length,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   ✅ POST /api/bookings/confirm
   Deduct wallet + confirm booking + lock seats
------------------------------------------ */
router.post("/confirm", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { flight_id, seats } = req.body;

    const flight = await Flight.findOne({ flight_id });
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    const price = flight.current_price || flight.base_price;

    // ✅ Wallet check
    let wallet = await Wallet.findOne({ user_id });
    if (!wallet) {
      wallet = await Wallet.create({ user_id, balance: 50000 });
    }

    if (wallet.balance < price) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // ✅ Seat availability check
    const unavailable = [];
    seats?.forEach(seatNum => {
      const seat = flight.seats.find(s => s.seat_number === seatNum);
      if (!seat || seat.is_booked) unavailable.push(seatNum);
    });

    if (unavailable.length > 0) {
      return res.status(400).json({
        message: "Some seats are not available",
        unavailable
      });
    }

    // ✅ Lock seats
    seats?.forEach(seatNum => {
      const seat = flight.seats.find(s => s.seat_number === seatNum);
      if (seat) seat.is_booked = true;
    });

    await flight.save();

    // ✅ Deduct wallet
    wallet.balance -= price;
    await wallet.save();

    // ✅ Create booking
    const booking_id = "BK" + Math.floor(100000 + Math.random() * 900000);

    const booking = await Booking.create({
      booking_id,
      user_id,
      flight_id,
      price_paid: price,
      seats: seats || [],
      status: "confirmed"
    });

    res.json({
      message: "Booking confirmed",
      booking_id: booking.booking_id,
      seats,
      price_paid: price,
      remaining_balance: wallet.balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   ✅ POST /api/bookings/cancel
   Cancel booking + refund + free seats
------------------------------------------ */
router.post("/cancel", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { booking_id } = req.body;

    const booking = await Booking.findOne({ booking_id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    if (booking.user_id.toString() !== user_id) {
      return res.status(403).json({ message: "Unauthorized cancellation" });
    }

    const flight = await Flight.findOne({ flight_id: booking.flight_id });
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    // ✅ Release seats
    booking.seats.forEach(seatNum => {
      const seat = flight.seats.find(s => s.seat_number === seatNum);
      if (seat) seat.is_booked = false;
    });

    await flight.save();

    // ✅ Refund wallet
    const wallet = await Wallet.findOne({ user_id });
    wallet.balance += booking.price_paid;
    await wallet.save();

    booking.status = "cancelled";
    await booking.save();

    res.json({
      message: "Booking cancelled successfully",
      refunded_amount: booking.price_paid,
      seats_released: booking.seats
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   ✅ GET /api/bookings/history
------------------------------------------ */
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user_id;

    const bookings = await Booking.find({ user_id });

    res.json({
      message: "Booking history fetched",
      bookings
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   ✅ GET /api/bookings/wallet
------------------------------------------ */
router.get("/wallet", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user_id;

    let wallet = await Wallet.findOne({ user_id });
    if (!wallet) {
      wallet = await Wallet.create({ user_id, balance: 50000 });
    }

    res.json({
      message: "Wallet fetched successfully",
      balance: wallet.balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;