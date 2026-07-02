import { useRef } from "react";

export default function Composer({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null);

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  function handleChange(e) {
    onChange(e.target.value);
    autoGrow();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    if (!value.trim() || disabled) return;
    onSend(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  return (
    <div className="composer-wrap">
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          ref={textareaRef}
          className="composer-input"
          placeholder="Message BeatBox…"
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={disabled || value.trim().length === 0}
          title="Send"
          aria-label="Send message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12h15M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
      <p className="disclaimer">BeatBox can make mistakes. Consider checking important information.</p>
    </div>
  );
}
