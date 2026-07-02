// Small, safe markdown-ish renderer: escapes HTML first, then adds support
// for **bold**, `code`, ```code blocks```, and basic bullet lists.
// Returns an HTML string meant to be used with dangerouslySetInnerHTML.
export function renderMarkdownLite(raw) {
  const escape = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let text = escape(raw);

  // fenced code blocks
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

  // bold
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // bullet lists (lines starting with "- " or "* ")
  const lines = text.split("\n");
  let html = "";
  let inList = false;
  for (const line of lines) {
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${line.replace(/^\s*[-*]\s+/, "")}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      if (line.trim() === "") {
        html += "";
      } else if (!line.startsWith("<pre>")) {
        html += `<p>${line}</p>`;
      } else {
        html += line;
      }
    }
  }
  if (inList) html += "</ul>";
  return html;
}
