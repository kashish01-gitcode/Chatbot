const jwt = require("jsonwebtoken");

const COOKIE_NAME = "BeatBox_token";

// Signs a JWT for this user and sets it as an httpOnly cookie on the response.
// httpOnly means client-side JS can never read it (protects against XSS token
// theft) — the browser just sends it automatically on every request.
function generateTokenAndSetCookie(res, userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
}

module.exports = { generateTokenAndSetCookie, COOKIE_NAME };
