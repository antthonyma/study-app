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
      const question = quizData[i];
      const feedbackEl = document.getElementById(`feedback-${i}`);

      // -------------------------------------------------------
      // MULTIPLE CHOICE grading
      // -------------------------------------------------------
      if (question.type === "multiple_choice") {
        const selected = document.querySelector(`input[name="question-${i}"]:checked`);
        const allLabels = document.querySelectorAll(`input[name="question-${i}"]`);

        if (!selected) {
          if (feedbackEl) {
            feedbackEl.textContent = `Skipped — correct answer: ${question.answer}`;
            feedbackEl.className = "question-feedback incorrect";
          }
          continue;
        }

        const isCorrect = selected.value.toLowerCase() === question.answer.toLowerCase();

        if (isCorrect) {
          score++;
          if (feedbackEl) {
            feedbackEl.textContent = "Correct!";
            feedbackEl.className = "question-feedback correct";
          }
          selected.closest("label").classList.add("correct");
        } else {
          if (feedbackEl) {
            feedbackEl.textContent = `Incorrect — correct answer: ${question.answer}`;
            feedbackEl.className = "question-feedback incorrect";
          }
          selected.closest("label").classList.add("incorrect");
          allLabels.forEach(function(input) {
            if (input.value.toLowerCase() === question.answer.toLowerCase()) {
              input.closest("label").classList.add("correct");
            }
          });
        }

      // -------------------------------------------------------
      // TRUE/FALSE grading — same logic as multiple choice
      // -------------------------------------------------------
      } else if (question.type === "true_false") {
        const selected = document.querySelector(`input[name="question-${i}"]:checked`);
        const allLabels = document.querySelectorAll(`input[name="question-${i}"]`);

        if (!selected) {
          if (feedbackEl) {
            feedbackEl.textContent = `Skipped — correct answer: ${question.answer}`;
            feedbackEl.className = "question-feedback incorrect";
          }
          continue;
        }

        const isCorrect = selected.value.toLowerCase() === question.answer.toLowerCase();

        if (isCorrect) {
          score++;
          if (feedbackEl) {
            feedbackEl.textContent = "Correct!";
            feedbackEl.className = "question-feedback correct";
          }
          selected.closest("label").classList.add("correct");
        } else {
          if (feedbackEl) {
            feedbackEl.textContent = `Incorrect — correct answer: ${question.answer}`;
            feedbackEl.className = "question-feedback incorrect";
          }
          selected.closest("label").classList.add("incorrect");
          allLabels.forEach(function(input) {
            if (input.value.toLowerCase() === question.answer.toLowerCase()) {
              input.closest("label").classList.add("correct");
            }
          });
        }

      // -------------------------------------------------------
      // FILL IN THE BLANK grading
      // -------------------------------------------------------
      } else if (question.type === "fill_blank") {
        const input = document.getElementById(`fill-blank-${i}`);

        if (!input || input.value.trim() === "") {
          if (feedbackEl) {
            feedbackEl.textContent = `Skipped — correct answer: ${question.answer}`;
            feedbackEl.className = "question-feedback incorrect";
          }
          continue;
        }

        const userAnswer = input.value.toLowerCase().trim();
        const isCorrect = userAnswer === question.answer.toLowerCase().trim();

        if (isCorrect) {
          score++;
          input.classList.add("correct");
          if (feedbackEl) {
            feedbackEl.textContent = "Correct!";
            feedbackEl.className = "question-feedback correct";
          }
        } else {
          input.classList.add("incorrect");
          if (feedbackEl) {
            feedbackEl.textContent = `Incorrect — correct answer: ${question.answer}`;
            feedbackEl.className = "question-feedback incorrect";
          }
        }

        input.disabled = true;

      // -------------------------------------------------------
      // MATCHING grading
      // -------------------------------------------------------
      } else if (question.type === "matching") {
        const selects = document.querySelectorAll(`.matching-select[data-question-index="${i}"]`);

        let anySkipped = false;
        selects.forEach(function(sel) {
          if (sel.value === "") anySkipped = true;
        });

        if (anySkipped) {
          if (feedbackEl) {
            feedbackEl.textContent = "Incomplete — please match all items before submitting.";
            feedbackEl.className = "question-feedback incorrect";
          }
          continue;
        }

        let allCorrect = true;
        selects.forEach(function(sel) {
          const leftIndex = parseInt(sel.dataset.leftIndex);
          const selectedRightIndex = parseInt(sel.value);
          const isMatch = selectedRightIndex === leftIndex;

          if (isMatch) {
            sel.classList.add("correct");
          } else {
            sel.classList.add("incorrect");
            allCorrect = false;
          }

          sel.disabled = true;
        });

        if (allCorrect) {
          score++;
          if (feedbackEl) {
            feedbackEl.textContent = "Correct — all pairs matched!";
            feedbackEl.className = "question-feedback correct";
          }
        } else {
          if (feedbackEl) {
            feedbackEl.textContent = "Some pairs were incorrect. Correct matches are highlighted green.";
            feedbackEl.className = "question-feedback incorrect";
          }
        }

      // -------------------------------------------------------
      // SELECT ALL THAT APPLY grading
      // -------------------------------------------------------
      } else if (question.type === "select_all") {
        const checkboxes = document.querySelectorAll(`input[name="question-${i}"]`);

        const userAnswers = [];
        checkboxes.forEach(function(cb) {
          if (cb.checked) userAnswers.push(cb.value);
        });

        if (userAnswers.length === 0) {
          if (feedbackEl) {
            feedbackEl.textContent = `Skipped — correct answers: ${question.answer.join(", ")}`;
            feedbackEl.className = "question-feedback incorrect";
          }
          continue;
        }

        const correctSorted = [...question.answer].sort().join(",");
        const userSorted = [...userAnswers].sort().join(",");
        const isCorrect = correctSorted === userSorted;

        checkboxes.forEach(function(cb) {
          const shouldBeChecked = question.answer.includes(cb.value);
          const wasChecked = cb.checked;

          if (shouldBeChecked && wasChecked) {
            cb.closest("label").classList.add("correct");
          } else if (!shouldBeChecked && wasChecked) {
            cb.closest("label").classList.add("incorrect");
          } else if (shouldBeChecked && !wasChecked) {
            cb.closest("label").classList.add("correct");
          }

          cb.disabled = true;
        });

        if (isCorrect) {
          score++;
          if (feedbackEl) {
            feedbackEl.textContent = "Correct!";
            feedbackEl.className = "question-feedback correct";
          }
        } else {
          if (feedbackEl) {
            feedbackEl.textContent = `Incorrect — correct answers: ${question.answer.join(", ")}`;
            feedbackEl.className = "question-feedback incorrect";
          }
        }
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