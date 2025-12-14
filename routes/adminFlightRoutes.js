const express = require("express");
const Flight = require("../Models/Flight");

const router = express.Router();

/* -----------------------------------------
   ✅ POST /api/admin/flights/add
   Add a new flight + auto-generate seats
------------------------------------------ */
router.post("/add", async (req, res) => {
  try {
    const { flight_id, airline, departure_city, arrival_city, base_price } = req.body;

    // ✅ Validate required fields
    if (!flight_id || !airline || !departure_city || !arrival_city || !base_price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check duplicate flight ID
    const exists = await Flight.findOne({ flight_id });
    if (exists) {
      return res.status(400).json({ message: "Flight ID already exists" });
    }

    // ✅ Auto-generate 36 seats (1A–6F)
    const seatRows = ["1", "2", "3", "4", "5", "6"];
    const seatCols = ["A", "B", "C", "D", "E", "F"];

    const seats = [];

    seatRows.forEach(row => {
      seatCols.forEach(col => {
        seats.push({
          seat_number: row + col,
          is_booked: false
        });
      });
    });

    // ✅ Create flight
    const flight = await Flight.create({
      flight_id,
      airline,
      departure_city,
      arrival_city,
      base_price,
      current_price: base_price, // ✅ default
      seats
    });

    res.json({
      message: "Flight added successfully with auto-generated seats",
      flight
    });

  } catch (err) {
    console.error("❌ Error adding flight:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   ✅ PUT /api/admin/flights/update/:flight_id
   Update flight details
------------------------------------------ */
router.put("/update/:flight_id", async (req, res) => {
  try {
    const { flight_id } = req.params;

    const updated = await Flight.findOneAndUpdate(
      { flight_id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.json({
      message: "Flight updated successfully",
      updated
    });

  } catch (err) {
    console.error("❌ Error updating flight:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   ✅ DELETE /api/admin/flights/delete/:flight_id
   Delete a flight
------------------------------------------ */
router.delete("/delete/:flight_id", async (req, res) => {
  try {
    const { flight_id } = req.params;

    const deleted = await Flight.findOneAndDelete({ flight_id });

    if (!deleted) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.json({
      message: "Flight deleted successfully"
    });

  } catch (err) {
    console.error("❌ Error deleting flight:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------
   ✅ GET /api/admin/flights/all
   Fetch all flights (admin view)
------------------------------------------ */
router.get("/all", async (req, res) => {
  try {
    const flights = await Flight.find();

    res.json({
      message: "All flights fetched",
      total: flights.length,
      flights
    });

  } catch (err) {
    console.error("❌ Error fetching flights:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;