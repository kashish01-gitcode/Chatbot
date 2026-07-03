import { useRef, useState } from "react";
import { isSpeechToTextSupported, startListening, stopSpeaking } from "../voice.js";

export default function Composer({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

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

  // Base text captured before this listening session started, so interim
  // (not-yet-final) speech results replace only what was said this session
  // instead of duplicating/overwriting existing typed text.
  const baseTextRef = useRef("");

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    baseTextRef.current = value ? value + " " : "";
    stopSpeaking(); // don't let the bot's voice bleed into the mic input
    setListening(true);

    recognitionRef.current = startListening({
      onResult: (text, isFinal) => {
        const next = baseTextRef.current + text;
        onChange(next);
        if (isFinal) baseTextRef.current = next + " ";
        requestAnimationFrame(autoGrow);
      },
      onEnd: () => setListening(false),
      onError: () => setListening(false),
    });
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
        {isSpeechToTextSupported && (
          <button
            type="button"
            className={`mic-btn ${listening ? "listening" : ""}`}
            onClick={toggleMic}
            title={listening ? "Stop listening" : "Speak your message"}
            aria-label={listening ? "Stop listening" : "Speak your message"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 11a7 7 0 01-14 0M12 18v3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <textarea
          ref={textareaRef}
          className="composer-input"
          placeholder={listening ? "Listening…" : "Message BeatBox about Java…"}
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