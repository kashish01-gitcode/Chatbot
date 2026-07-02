const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Give me 5 creative birthday party ideas",
  "Indore me best Dal Bafle kaha milte hai",
  "Help me debug why my for loop runs forever",
];

export default function Greeting({ onPick }) {
  return (
    <div className="greeting">
      <h1>
        <span className="grad-text">Hello, there</span>
      </h1>
      <h2>What would you like to explore today?</h2>

      <div className="suggestion-grid">
        {SUGGESTIONS.map((prompt) => (
          <button key={prompt} className="suggestion-card" onClick={() => onPick(prompt)}>
            <span className="suggestion-text">{prompt}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
