export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  keyStatus,
  isOpen,
  onToggle,
  user,
  onLogout,
}) {
  return (
     <>
    <div
      className={`sidebar-backdrop ${isOpen ? "visible" : ""}`}
      onClick={onToggle}
      aria-hidden="true"
    />
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="icon-btn menu-toggle" onClick={onToggle} title="Toggle menu" aria-label="Toggle menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <button className="new-chat-btn" onClick={onNewChat}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <span>New chat</span>
      </button>

      <div className="sidebar-section-label">Recent</div>
      <nav className="history-list" aria-label="Chat history">
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`history-item-wrap ${chat._id === activeChatId ? "active" : ""}`}
          >
            <button className="history-item" onClick={() => onSelectChat(chat._id)}>
              {chat.title || "New chat"}
            </button>
            <button
              className="history-delete"
              title="Delete chat"
              aria-label="Delete chat"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat._id);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
         
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="key-status">
          <span className={`dot ${keyStatus}`}></span>
          <span>
            {keyStatus === "ok"
              ? "Connected"
              : keyStatus === "bad"
              ? "Setup needed — check .env"
              : "Checking connection…"}
          </span>
        </div>

        {user && (
          <div className="user-row">
            <div className="user-avatar">{user.name?.[0]?.toUpperCase() || "?"}</div>
            <div className="user-meta">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Log out" aria-label="Log out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
