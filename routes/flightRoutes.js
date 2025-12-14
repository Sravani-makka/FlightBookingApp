const express = require("express");
const Flight = require("../models/Flight");

const router = express.Router();

// GET /api/flights
router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;

    const query = {};
    if (from) query.departure_city = from;
    if (to) query.arrival_city = to;

    const flights = await Flight.find(query).limit(10);

    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;