const mongoose = require("mongoose");

const BookingAttemptSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  flight_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BookingAttempt", BookingAttemptSchema);
const express = require("express");
const Flight = require("../Models/Flight");
const BookingAttempt = require("../Models/BookingAttempt");

const router = express.Router();

