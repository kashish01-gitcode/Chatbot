const express = require("express");
const Chat = require("../models/Chat");
const { getGroqReply } = require("../services/groq");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Every route below requires a logged-in user, and every query is scoped to
// req.user._id — so a user can only ever see/touch their own chats.
router.use(protect);

// GET /api/chats — list this user's chats for the sidebar (no message bodies)
router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find(
      { user: req.user._id },
      { title: 1, updatedAt: 1, createdAt: 1 }
    ).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to load chats." });
  }
});

// POST /api/chats — create a new empty chat owned by this user
router.post("/", async (req, res) => {
  try {
    const chat = await Chat.create({ user: req.user._id, title: "New chat", messages: [] });
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: "Failed to create chat." });
  }
});

// GET /api/chats/:id — full chat with messages (only if it belongs to this user)
router.get("/:id", async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ error: "Chat not found." });
    res.json(chat);
  } catch (err) {
    res.status(400).json({ error: "Invalid chat id." });
  }
});

// DELETE /api/chats/:id — only deletes if it belongs to this user
router.delete("/:id", async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ error: "Chat not found." });
    res.json({ deleted: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid chat id." });
  }
});

// POST /api/chats/:id/messages — send a user message, get the AI reply back
router.post("/:id/messages", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text is required." });
    }

    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ error: "Chat not found." });

    // First message in the chat also sets its title (used in the sidebar)
    if (chat.messages.length === 0) {
      chat.title = text.length > 40 ? text.slice(0, 40) + "…" : text;
    }

    chat.messages.push({ role: "user", text });

    let reply;
    try {
      reply = await getGroqReply(chat.messages.map((m) => ({ role: m.role, text: m.text })));
    } catch (aiErr) {
      // Save the user's message even if the AI call fails, so it isn't lost
      await chat.save();
      return res.status(aiErr.statusCode || 500).json({ error: aiErr.message });
    }

    chat.messages.push({ role: "assistant", text: reply });
    await chat.save();

    res.json({ reply, chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

module.exports = router;
