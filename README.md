# BeatBox — Gemini-style AI Chatbot (MERN Stack)

Same look and feel as the earlier version, rebuilt properly as a MERN app:

- **M**ongoDB — stores your chats and messages permanently (survives browser clears, works across devices)
- **E**xpress — backend API server
- **R**eact — frontend UI (built with Vite)
- **N**ode.js — runs it all

AI replies come from **Groq** (Llama 3.3 70B) — free, no credit card, fast.

```
mern-gemini-clone/
├── backend/
│   ├── server.js
│   ├── config/db.js          ← MongoDB connection
│   ├── models/Chat.js        ← chat + message schema
│   ├── routes/chatRoutes.js  ← /api/chats endpoints
│   ├── services/groq.js      ← calls the Groq API
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js             ← fetch calls to the backend
    │   ├── components/
    │   └── index.css
    └── vite.config.js
```

---

## Step 1 — Get a free Groq API key (no credit card)

1. Go to **https://console.groq.com/keys**
2. Sign up with email or Google — no card, no billing.
3. Click **Create API Key** and copy it (looks like `gsk_...`).

---

## Step 2 — Set up MongoDB

Pick **one** of these:

### Option A: MongoDB Atlas (easiest, free, no local install)
1. Go to **https://www.mongodb.com/cloud/atlas/register** and sign up (no card needed for the free tier).
2. Create a free **M0 cluster** (takes ~1 minute to spin up).
3. Under **Database Access**, create a database user with a username/password.
4. Under **Network Access**, click **Add IP Address → Allow access from anywhere** (`0.0.0.0/0`) — fine for development.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```
6. Replace `<username>` and `<password>` with your real credentials, and add `BeatBox` as the database name at the end:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/BeatBox
   ```

### Option B: Local MongoDB
1. Install MongoDB Community Server: **https://www.mongodb.com/try/download/community**
2. Start it (it usually runs automatically as a service, or run `mongod` in a terminal).
3. Your connection string is simply:
   ```
   mongodb://127.0.0.1:27017/BeatBox
   ```

---

## Step 3 — Open the project in VS Code and install dependencies

This project has **two** separate apps (backend and frontend), so you install and run each one.

```bash
# from the project root
cd backend
npm install

cd ../frontend
npm install
```

You need Node.js v18+ (`node -v` to check) — get it from **https://nodejs.org** if missing.

---

## Step 4 — Configure environment variables

In `backend/`, duplicate `.env.example` → rename to `.env`, then fill in:

```
GROQ_API_KEY=gsk_your_real_key_here
MONGODB_URI=mongodb+srv://... (or your local URI from Step 2)
PORT=5000
```

Save it. `.env` is already in `.gitignore`, so it won't be committed.

---

## Step 5 — Run it locally (two terminals)

**Terminal 1 — backend:**
```bash
cd backend
npm start
```
You should see:
```
✅ MongoDB connected
✅ BeatBox backend running at http://localhost:5000
✅ GROQ_API_KEY detected.
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```
Vite will print a local URL, usually **http://localhost:5173** — open that in your browser.

The frontend automatically proxies `/api` requests to the backend on port 5000 (configured in `vite.config.js`), so both need to be running at the same time while you develop.

---

## Step 6 — How it fits together

- **`frontend/src/api.js`** — every button click in the UI calls a function here (`sendMessage`, `listChats`, etc.), which does a `fetch("/api/...")`.
- **`backend/routes/chatRoutes.js`** — receives those requests, reads/writes the `Chat` collection in MongoDB via Mongoose.
- **`backend/services/groq.js`** — when a new message comes in, this sends the whole conversation to Groq and returns the reply. Your `GROQ_API_KEY` never leaves the backend.
- **`backend/models/Chat.js`** — defines what a chat document looks like in MongoDB: a title and an array of `{role, text}` messages.

Chats now persist in MongoDB instead of the browser's `localStorage` — open the app on a different device pointing at the same backend and your history is still there.

---

## Step 7 — Deploy it so it works globally

The cleanest way to deploy a MERN app as one service: **build the React app, and have Express serve it.**

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
   This creates `frontend/dist/`. `backend/server.js` already checks for this folder and serves it automatically if present — so once built, the backend serves both the API and the UI on one port.

2. Push the whole `mern-gemini-clone/` folder to a GitHub repo (see Step 8).

3. Deploy on **Render** (free tier):
   - **New → Web Service**, connect your repo.
   - **Root Directory:** leave blank (repo root)
   - **Build command:**
     ```
     cd frontend && npm install && npm run build && cd ../backend && npm install
     ```
   - **Start command:**
     ```
     cd backend && npm start
     ```
   - Add environment variables: `GROQ_API_KEY`, `MONGODB_URI` (use your Atlas string — Atlas works from anywhere, unlike a local MongoDB), and `PORT` isn't needed (Render sets it).
   - Deploy — you'll get a public URL serving the whole app.

4. **Important:** if you used local MongoDB for development, switch to **MongoDB Atlas** for deployment — a hosted server can't reach `127.0.0.1` on your laptop. Atlas Option A above works from any deployment host.

---

## Step 8 — Push to GitHub

```bash
git init
git add .
git commit -m "BeatBox MERN chatbot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Run `git status` before committing — no `.env` file should be listed (it's git-ignored).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "MongoDB connection failed" | Check `MONGODB_URI` in `backend/.env`. For Atlas: confirm username/password and that Network Access allows your IP (or `0.0.0.0/0`). For local: confirm `mongod` is actually running. |
| Frontend loads but chats don't send | Make sure the **backend** terminal is also running — the frontend on its own can't talk to Groq or MongoDB. |
| "GROQ_API_KEY missing" | `.env` file missing/misnamed, or key not pasted in `backend/.env` (not `frontend/.env`). |
| CORS errors in browser console | Only happens if you bypass the Vite proxy (e.g. hardcoding `http://localhost:5000` in `api.js`) — leave `BASE = "/api"` as relative. |
| Works locally, blank page after deploy | Confirm the build command actually ran `npm run build` in `frontend/` before starting the backend, and that `backend/server.js`'s static-serving block found `frontend/dist`. |

---

## Next ideas
- Add user accounts (JWT auth) so multiple people can use the same deployment with separate chat histories.
- Streaming responses using Groq's `stream: true` + Server-Sent Events.
- Edit/regenerate message buttons.
