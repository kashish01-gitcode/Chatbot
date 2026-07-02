const express = require("express");
const User = require("../models/User");
const { generateTokenAndSetCookie, COOKIE_NAME } = require("../utils/generateToken");
const { protect } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are all required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const user = await User.create({ name, email, password });
    generateTokenAndSetCookie(res, user._id);

    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // password has `select: false` in the schema, so it must be explicitly requested
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    generateTokenAndSetCookie(res, user._id);
    res.json({ user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log in. Please try again." });
  }
});

// POST /api/auth/logout — clears the cookie so the browser stops sending it
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ loggedOut: true });
});

// GET /api/auth/me — used on app load to check "am I still logged in?"
router.get("/me", protect, (req, res) => {
  res.json({
    user: { _id: req.user._id, name: req.user.name, email: req.user.email },
  });
});

module.exports = router;
