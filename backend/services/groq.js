// services/groq.js
// Talks to Groq's OpenAI-compatible chat completions endpoint.
// The API key lives only here on the server — never sent to the browser.

const fetch = require("node-fetch");

const MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Yahi system prompt bot ko "Java developer specific" banata hai — har
// request ke start mein bhej diya jata hai, model isko poori conversation
// ke liye standing instruction maanta hai.
const SYSTEM_PROMPT = `You are BeatBox, an AI assistant built specifically for Java developers.

Your expertise covers: core Java (syntax, OOP, collections, generics, streams, exceptions),
JVM internals, multithreading & concurrency, Spring & Spring Boot, Hibernate/JPA, Maven/Gradle,
JDBC, unit testing (JUnit, Mockito), REST API design in Java, design patterns, data structures &
algorithms in Java, debugging Java code, and Java interview preparation.

Rules:
- For any question related to Java or Java-based development (including tools, frameworks,
  and concepts commonly used alongside Java, like SQL, Git, Docker, or system design when the
  context is a Java backend), answer directly, accurately, and with working code examples
  where useful. Be fast and precise — don't pad with unnecessary preamble.
- If the user asks something with NO connection to Java development (e.g. general trivia,
  other unrelated programming languages with no Java context, entertainment, cooking, etc.),
  do NOT answer it. Instead, politely say you're specialized in Java development and ask them
  to ask a Java-related question instead. Keep this redirect short — one or two sentences.
- If a question is ambiguous but could plausibly be part of a Java developer's work, err on
  the side of answering it.`;

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

  const chatMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.text,
    })),
  ];

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