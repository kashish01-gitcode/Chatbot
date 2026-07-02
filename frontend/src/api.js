// Small fetch wrapper around our backend's /api routes.
// Vite's dev proxy (see vite.config.js) forwards /api to the Express server,
// so relative paths work both in dev and once built/deployed together.
///

const BASE = "/api";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

// ---------- Auth ----------

export async function registerUser({ name, email, password }) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handle(res);
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res);
}

export async function logoutUser() {
  const res = await fetch(`${BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return handle(res);
}

export async function getMe() {
  const res = await fetch(`${BASE}/auth/me`, { credentials: "include" });
  return handle(res);
}

// ---------- Health ----------

export async function checkHealth() {
  const res = await fetch(`${BASE}/health`, { credentials: "include" });
  return handle(res);
}

// ---------- Chats ----------

export async function listChats() {
  const res = await fetch(`${BASE}/chats`, { credentials: "include" });
  return handle(res);
}

export async function createChat() {
  const res = await fetch(`${BASE}/chats`, { method: "POST", credentials: "include" });
  return handle(res);
}

export async function getChat(id) {
  const res = await fetch(`${BASE}/chats/${id}`, { credentials: "include" });
  return handle(res);
}

export async function deleteChat(id) {
  const res = await fetch(`${BASE}/chats/${id}`, { method: "DELETE", credentials: "include" });
  return handle(res);
}

export async function sendMessage(chatId, text) {
  const res = await fetch(`${BASE}/chats/${chatId}/messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return handle(res);
}
