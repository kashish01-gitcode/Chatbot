import { renderMarkdownLite } from "../markdown.js";

function AvatarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C12 7.523 16.477 12 22 12C16.477 12 12 16.477 12 22C12 16.477 7.523 12 2 12C7.523 12 12 7.523 12 2Z" />
    </svg>
  );
}

function Message({ role, text }) {
  return (
    <div className={`msg ${role}`}>
      <div className="msg-avatar">{role === "user" ? "You" : <AvatarIcon />}</div>
      <div className="msg-body" dangerouslySetInnerHTML={{ __html: renderMarkdownLite(text) }} />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="msg assistant">
      <div className="msg-avatar">
        <AvatarIcon />
      </div>
      <div className="msg-body">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default function Messages({ messages, isTyping, error, scrollRef }) {
  return (
    <div className="messages">
      {messages.map((m, i) => (
        <Message key={i} role={m.role} text={m.text} />
      ))}
      {isTyping && <TypingIndicator />}
      {error && <div className="error-banner">{error}</div>}
      <div ref={scrollRef} />
    </div>
  );
}
