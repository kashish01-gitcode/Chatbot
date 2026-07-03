// Thin wrapper around the browser's built-in Web Speech API.
// No backend, no API key, no extra cost — but only works in browsers that
// support it (Chrome, Edge; Safari partially; Firefox: no STT support yet).

const SpeechRecognitionImpl =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export const isSpeechToTextSupported = !!SpeechRecognitionImpl;
export const isTextToSpeechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * Starts listening to the mic and streams recognized text back via callbacks.
 * Returns a controller object with a `.stop()` method.
 */
export function startListening({ onResult, onEnd, onError }) {
  if (!SpeechRecognitionImpl) {
    onError?.(new Error("Speech recognition isn't supported in this browser."));
    return { stop: () => {} };
  }

  const recognition = new SpeechRecognitionImpl();
  recognition.lang = "en-IN"; // works fine for Hindi-English mixed speech too
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let finalText = "";
    let interimText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += transcript;
      else interimText += transcript;
    }
    if (finalText) onResult(finalText, true);
    else if (interimText) onResult(interimText, false);
  };

  recognition.onerror = (event) => onError?.(event);
  recognition.onend = () => onEnd?.();

  recognition.start();
  return { stop: () => recognition.stop() };
}

// Strips markdown syntax so spoken replies don't say "asterisk asterisk" etc.
function toSpeakableText(text) {
  return text
    .replace(/```[\s\S]*?```/g, " code block omitted. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

let currentUtterance = null;

export function speak(text) {
  if (!isTextToSpeechSupported || !text) return;
  window.speechSynthesis.cancel();
  currentUtterance = new SpeechSynthesisUtterance(toSpeakableText(text));
  currentUtterance.rate = 1;
  currentUtterance.pitch = 1;
  window.speechSynthesis.speak(currentUtterance);
}

export function stopSpeaking() {
  if (isTextToSpeechSupported) window.speechSynthesis.cancel();
}