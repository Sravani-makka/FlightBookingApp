const jwt = require("jsonwebtoken");
const JWT_SECRET = "my_super_secret_key"; // same as in authRoutes

module.exports = function (req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user_id = decoded.user_id; // attach user_id to request
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};