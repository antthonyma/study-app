from flask import Flask, render_template, request, redirect, url_for, session
import os
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from ai_helper import generate_notes, generate_flashcards, generate_quiz

import uuid

load_dotenv()

app = Flask(__name__)

app.secret_key = os.urandom(24)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

TEMP_FOLDER = os.path.join(os.path.dirname(__file__), 'temp')

os.makedirs(TEMP_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'txt', 'pdf'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text(filepath):
    extension = filepath.rsplit('.', 1)[1].lower()

    if extension == 'txt':
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()

    elif extension == 'pdf':
        text_parts = []
        with open(filepath, 'rb') as f:
            reader = PdfReader(f)
            for page in reader.pages:
                text_parts.append(page.extract_text())
        return "\n\n".join(text_parts)

    return ""


@app.route("/")
def home():
    history = session.get("history", [])
    return render_template("index.html", history=history)


@app.route("/upload", methods=["POST"])
def upload():
    file = request.files.get("source_file")

    if not file or file.filename == "":
        return redirect(url_for("home"))

    if not allowed_file(file.filename):
        return render_template("index.html", error="Only .txt and .pdf files are accepted.", history=session.get("history", []))

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    extracted_text = extract_text(filepath)

    if not extracted_text.strip():
        return render_template("index.html", error="Could not extract text from that file. Try a different one.", history=session.get("history", []))

    temp_id = str(uuid.uuid4())
    temp_path = os.path.join(TEMP_FOLDER, f"{temp_id}.txt")

    with open(temp_path, 'w', encoding='utf-8') as f:
        f.write(extracted_text)

    session['pending_temp_id'] = temp_id
    session['pending_filename'] = filename

    return redirect(url_for("loading"))


@app.route("/loading")
def loading():
    if 'pending_temp_id' not in session:
        return redirect(url_for("home"))

    return render_template("loading.html")


@app.route("/generate")
def generate():
    if 'pending_temp_id' not in session:
        return redirect(url_for("home"))

    temp_id = session.pop('pending_temp_id')
    filename = session.pop('pending_filename')

    temp_path = os.path.join(TEMP_FOLDER, f"{temp_id}.txt")

    if not os.path.exists(temp_path):
        return redirect(url_for("home"))

    with open(temp_path, 'r', encoding='utf-8') as f:
        extracted_text = f.read()

    os.remove(temp_path)

    notes = generate_notes(extracted_text)
    flashcards = generate_flashcards(extracted_text)
    quiz = generate_quiz(extracted_text)

    history = session.get("history", [])

    if not history or history[0] != filename:
        history.insert(0, filename)
        history = history[:5]
        session['history'] = history

    return render_template(
        "results.html",
        filename=filename,
        text=extracted_text,
        notes=notes,
        flashcards=flashcards,
        quiz=quiz
    )


if __name__ == "__main__":
    app.run(debug=True)