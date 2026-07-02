import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Greeting from "./components/Greeting.jsx";
import Messages from "./components/Messages.jsx";
import Composer from "./components/Composer.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { checkHealth, listChats, createChat, getChat, deleteChat as apiDeleteChat, sendMessage as apiSendMessage } from "./api.js";

export default function App() {

  const { user, status, logout } = useAuth();

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [keyStatus, setKeyStatus] = useState("checking");
  //const [sidebarOpen, setSidebarOpen] = useState(false);
     // Open by default on desktop (wide screens), closed by default on mobile
// (off-canvas drawer) — matches how Gemini/ChatGPT behave.
const [sidebarOpen, setSidebarOpen] = useState(() =>
  typeof window !== "undefined" ? window.innerWidth > 720 : true
);
  const scrollAnchorRef = useRef(null);

  // Initial load: health check + this user's chat list. Only runs once we
  // know someone is actually logged in, so we don't hit protected routes
  // (and get 401s) while the login screen is showing.
  useEffect(() => {
    if (!user) return;

    checkHealth()
      .then((data) => setKeyStatus(data.groqKeyConfigured && data.mongoConnected ? "ok" : "bad"))
      .catch(() => setKeyStatus("bad"));

    listChats()
      .then((data) => setChats(data))
      .catch(() => setChats([]));
  }, [user]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function refreshChatList() {
  listChats()
    .then(setChats)
    .catch(() => {});
}

// Auto-close the drawer after picking/starting a chat, but only on mobile —
// on desktop the sidebar should stay put; the user controls it explicitly
// with the hamburger button.
function closeSidebarOnMobile() {
  if (window.innerWidth <= 720) setSidebarOpen(false);
}

async function openChat(id) {
  try {
    const chat = await getChat(id);
    setActiveChatId(chat._id);
    setMessages(chat.messages || []);
    setError(null);
  } catch {
    setError("Couldn't load that chat.");
  }
  closeSidebarOnMobile();
}

function startNewChat() {
  setActiveChatId(null);
  setMessages([]);
  setError(null);
  closeSidebarOnMobile();
}

  async function handleDeleteChat(id) {
    try {
      await apiDeleteChat(id);
      setChats((prev) => prev.filter((c) => c._id !== id));
      if (id === activeChatId) startNewChat();
    } catch {
      setError("Couldn't delete that chat.");
    }
  }

  async function handleSend(text) {
    setError(null);
    setInputValue("");

    let chatId = activeChatId;

    // Lazily create the chat in the DB on first message, so browsing/new-chat
    // doesn't clutter the sidebar with empty chats.
    if (!chatId) {
      try {
        const chat = await createChat();
        chatId = chat._id;
        setActiveChatId(chatId);
        setChats((prev) => [chat, ...prev]);
      } catch {
        setError("Couldn't start a new chat. Is the backend running?");
        return;
      }
    }

    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsTyping(true);

    try {
      const { reply } = await apiSendMessage(chatId, text);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      refreshChatList();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsTyping(false);
    }
  }

  async function handleLogout() {
    await logout();
    // Clear local chat state so nothing from this session lingers on screen
    // (and so the next user who logs in on this device doesn't see it).
    setChats([]);
    setActiveChatId(null);
    setMessages([]);
    setError(null);
  }

  if (status === "checking") {
    return (
      <div className="auth-screen">
        <div className="auth-loading">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const showGreeting = messages.length === 0;

  return (
    
  <div className={`app ${sidebarOpen ? "" : "sidebar-closed"}`}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={openChat}
        onNewChat={startNewChat}
        onDeleteChat={handleDeleteChat}
        keyStatus={keyStatus}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main">
  <header className="topbar">
    <button
      className="icon-btn topbar-menu-toggle"
      onClick={() => setSidebarOpen((v) => !v)}
      title="Toggle menu"
      aria-label="Toggle menu"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
    <div className="brand">
            <svg className="brand-mark" width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 7.523 16.477 12 22 12C16.477 12 12 16.477 12 22C12 16.477 7.523 12 2 12C7.523 12 12 7.523 12 2Z"
                fill="url(#BeatBoxGrad)"
              />
              <defs>
                <linearGradient id="BeatBoxGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4285F4" />
                  <stop offset="0.5" stopColor="#9B72CB" />
                  <stop offset="1" stopColor="#D96570" />
                </linearGradient>
              </defs>
            </svg>
            <span className="brand-name">BeatBox</span>
          </div>
        </header>

        <section className="chat-scroll">
          {showGreeting ? (
            <>
              <Greeting onPick={handleSend} />
              {error && <div className="error-banner greeting-error">{error}</div>}
            </>
          ) : (
            <Messages messages={messages} isTyping={isTyping} error={error} scrollRef={scrollAnchorRef} />
          )}
        </section>

        <Composer value={inputValue} onChange={setInputValue} onSend={handleSend} disabled={isTyping} />
      </main>
    </div>
  );
}
