const connectDB = require("../config/db");
const Flight = require("../models/Flight");

const seedFlights = async () => {
  await connectDB();

  const flights = [
    {
      flight_id: "XT101",
      airline: "Indigo",
      departure_city: "Hyderabad",
      arrival_city: "Delhi",
      base_price: 2500,
    },
    {
      flight_id: "XT102",
      airline: "Air India",
      departure_city: "Mumbai",
      arrival_city: "Bangalore",
      base_price: 2700,
    },
    {
      flight_id: "XT103",
      airline: "Vistara",
      departure_city: "Chennai",
      arrival_city: "Kolkata",
      base_price: 2600,
    },
    {
      flight_id: "XT104",
      airline: "SpiceJet",
      departure_city: "Delhi",
      arrival_city: "Hyderabad",
      base_price: 2400,
    },
    {
      flight_id: "XT105",
      airline: "Indigo",
      departure_city: "Bangalore",
      arrival_city: "Mumbai",
      base_price: 2300,
    },
    {
      flight_id: "XT106",
      airline: "Air India",
      departure_city: "Kolkata",
      arrival_city: "Chennai",
      base_price: 2800,
    },
    {
      flight_id: "XT107",
      airline: "Vistara",
      departure_city: "Hyderabad",
      arrival_city: "Bangalore",
      base_price: 2200,
    },
    {
      flight_id: "XT108",
      airline: "SpiceJet",
      departure_city: "Delhi",
      arrival_city: "Mumbai",
      base_price: 2900,
    },
    {
      flight_id: "XT109",
      airline: "Indigo",
      departure_city: "Chennai",
      arrival_city: "Delhi",
      base_price: 2700,
    },
    {
      flight_id: "XT110",
      airline: "Air India",
      departure_city: "Mumbai",
      arrival_city: "Hyderabad",
      base_price: 2600,
    },
  ];

  try {
    await Flight.deleteMany(); // Clear old data
    await Flight.insertMany(flights);
    console.log("✅ Flights seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding flights:", err);
    process.exit(1);
  }
};

seedFlights();