require("dotenv").config();   // ✅ Load .env first

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// ✅ Connect to MongoDB using MONGO_URI from .env
connectDB();

app.use(cors());
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Flight API running");
});

// ✅ ROUTES — IMPORT
const flightRoutes = require("./routes/flightRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminFlightRoutes = require("./routes/adminFlightRoutes");
const seatRoutes = require("./routes/seatRoutes");
const authRoutes = require("./routes/authRoutes");

// ✅ USE ROUTES
app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin/flights", adminFlightRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/auth", authRoutes);

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));