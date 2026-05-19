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


  function submitQuiz() {

    if (typeof quizData === "undefined" || quizData.length === 0) return;

    let score = 0;

    for (let i = 0; i < quizData.length; i++) {

      const feedbackEl = document.getElementById(`feedback-${i}`);

      const selected = document.querySelector(`input[name="question-${i}"]:checked`);

      const allLabels = document.querySelectorAll(`input[name="question-${i}"]`);

      const correctAnswer = quizData[i].answer;

      if (!selected) {
        if (feedbackEl) {
          feedbackEl.textContent = `Skipped — correct answer: ${correctAnswer}`;
          feedbackEl.className = "question-feedback incorrect";
        }
        continue;
      }

      const userAnswer = selected.value;

      const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

      if (isCorrect) {
        score++;
        if (feedbackEl) {
          feedbackEl.textContent = "Correct!";
          feedbackEl.className = "question-feedback correct";
        }
        selected.closest("label").classList.add("correct");

      } else {
        if (feedbackEl) {
          feedbackEl.textContent = `Incorrect — correct answer: ${correctAnswer}`;
          feedbackEl.className = "question-feedback incorrect";
        }
        selected.closest("label").classList.add("incorrect");

        allLabels.forEach(function(input) {
          if (input.value.toLowerCase() === correctAnswer.toLowerCase()) {
            input.closest("label").classList.add("correct");
          }
        });
      }
    }

    const submitBtn = document.getElementById("quiz-submit-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Quiz submitted";
      submitBtn.style.opacity = "0.5";
      submitBtn.style.cursor = "default";
    }

    const scoreEl = document.getElementById("quiz-score");
    if (scoreEl) {
      scoreEl.style.display = "block";
      scoreEl.textContent = `You scored ${score} out of ${quizData.length}`;

      if (score > quizData.length / 2) {
        scoreEl.className = "quiz-score good";
      } else {
        scoreEl.className = "quiz-score poor";
      }
    }
  }

  window.submitQuiz = submitQuiz;

});