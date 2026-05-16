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
          const aline = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          html += `<p>${aline}</p>`;
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

  let currentCardIndex = 0;

  let isFlipped = false;

  function flipCard() {
    const card = document.getElementById("flashcard");

    if (card) {
      card.classList.toggle("flipped");

      isFlipped = !isFlipped;
    }
  }

  function showCard(index) {
    if (typeof flashcardData === "undefined") return;

    const frontText = document.getElementById("card-front-text");
    const backText = document.getElementById("card-back-text");
    const cardNumDisplay = document.getElementById("current-card-num");
    const card = document.getElementById("flashcard");

    if (!frontText || !backText || !cardNumDisplay || !card) return;

    card.classList.remove("flipped");
    isFlipped = false;

    frontText.textContent = flashcardData[index].front;
    backText.textContent = flashcardData[index].back;

    cardNumDisplay.textContent = index + 1;
  }

  function nextCard() {
    if (typeof flashcardData === "undefined") return;

    if (currentCardIndex < flashcardData.length - 1) {
      currentCardIndex++;
      showCard(currentCardIndex);
    }
  }

  function prevCard() {
    if (typeof flashcardData === "undefined") return;

    if (currentCardIndex > 0) {
      currentCardIndex--;
      showCard(currentCardIndex);
    }
  }

  window.flipCard = flipCard;
  window.nextCard = nextCard;
  window.prevCard = prevCard;

});