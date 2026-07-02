require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// credentials: true is required so the browser is allowed to send/receive
// the httpOnly auth cookie. In dev, Vite proxies /api same-origin so this
// mostly matters once frontend and backend are on different origins in prod —
// set CLIENT_ORIGIN in .env to your deployed frontend URL in that case.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    groqKeyConfigured: Boolean(process.env.GROQ_API_KEY),
    mongoConnected: require("mongoose").connection.readyState === 1,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);

// In production, serve the built React app from the backend so you only
// need to deploy one service. This block is a no-op in local dev, since
// frontend/dist won't exist until you run `npm run build` in /frontend.
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
  console.log("✅ Serving built frontend from frontend/dist");
}

app.listen(PORT, () => {
  console.log(`✅ BeatBox backend running at http://localhost:${PORT}`);
  console.log(
    process.env.GROQ_API_KEY ? "✅ GROQ_API_KEY detected." : "⚠️  GROQ_API_KEY missing — set it in .env"
  );
});
