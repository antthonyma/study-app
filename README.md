# Study App

An AI-powered studying application that takes uploaded course materials and automatically generates study notes, flashcards, and quizzes to help university students learn more effectively.

## Features

- Upload PDF or plain text (.txt) files
- AI-generated study notes organized into summary, key concepts, important details, and key takeaways
- Interactive flashcards with flip animation
- Auto-generated quizzes with five question types: multiple choice, true/false, fill in the blank, matching, and select all that apply
- Quiz grading with instant feedback and score display
- Section navigation bar for jumping between content
- Recent upload history

## Tech Stack

- **Backend:** Python, Flask
- **Frontend:** HTML, CSS, JavaScript
- **AI:** Groq API (Llama 3.3 70B)
- **PDF parsing:** PyPDF2

## Setup

1. Clone the repository
2. Create a virtual environment and activate it
3. Install dependencies: `pip install -r requirements.txt`
4. Create a `.env` file with your Groq API key: `GROQ_API_KEY=your-key-here`
5. Run the app: `python app.py`
6. Visit `http://127.0.0.1:5000` in your browser