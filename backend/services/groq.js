// services/groq.js
// Talks to Groq's OpenAI-compatible chat completions endpoint.
// The API key lives only here on the server — never sent to the browser.

const fetch = require("node-fetch");

const MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * @param {{role: "user"|"assistant", text: string}[]} messages
 * @returns {Promise<string>} the assistant's reply text
 */
async function getGroqReply(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error(
      "Server is missing GROQ_API_KEY. Add it to backend/.env, then restart the server."
    );
    err.statusCode = 500;
    throw err;
  }

  const chatMessages = messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.text,
  }));

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: chatMessages,
      temperature: 0.9,
      max_tokens: 2048,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data?.error?.message || "Groq API returned an error.");
    err.statusCode = response.status;
    throw err;
  }

  return (
    data?.choices?.[0]?.message?.content ||
    "Sorry, I couldn't generate a response for that. Please try rephrasing."
  );
}

module.exports = { getGroqReply };
