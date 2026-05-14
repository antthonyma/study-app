document.addEventListener("DOMContentLoaded", function () {
  console.log("Study App loaded.");

  const notesRaw = document.getElementById("notes-raw");
  const notesRendered = document.getElementById("notes-rendered");

  if (notesRaw && notesRendered) {
    const markdown = notesRaw.textContent;

    function simpleMarkdownToHTML(text) {
      const lines = text.split("\n");
      let html = "";
      let inList = false;

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("## ")) {
          if (inList) {
            html += "</ul>";
            inList = false;
          }
          html += `<h3>${trimmed.slice(3)}</h3>`;
        } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          if (!inList) {
            html += "<ul>";
            inList = true;
          }
          const itemText = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          html += `<li>${itemText}</li>`;
        } else if (trimmed === "") {
          if (inList) {
            html += "</ul>";
            inList = false;
          }
          html += "<p>&nbsp;</p>";
        } else {
          if (inList) {
            html += "</ul>";
            inList = false;
          }
          const line = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          html += `<p>${line}</p>`;
        }
      }
      if (inList) {
        html += "</ul>";
      }

      return html;
    }
    const renderedHTML = simpleMarkdownToHTML(markdown);
    notesRendered.innerHTML = renderedHTML;
  }

});