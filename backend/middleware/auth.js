const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { COOKIE_NAME } = require("../utils/generateToken");

// Reads the JWT cookie, verifies it, and attaches the logged-in user to
// req.user. Any route using this middleware can assume req.user exists.
async function protect(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: "Not authenticated. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }
}

module.exports = { protect };
