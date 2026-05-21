from dotenv import load_dotenv
load_dotenv()

from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_notes(source_text):
    prompt = f"""
You are a study assistant helping a university student understand their course material.

Given the following source text, generate clear and well-organized study notes.

Format your notes like this:
- Start with a "## Summary" section: 3-5 sentences giving the big picture
- Then a "## Key Concepts" section: a bullet list of the most important ideas, each with a one-sentence explanation
- Then a "## Important Details" section: specific facts, dates, formulas, or definitions worth remembering
- End with a "## Key Takeaways" section: 3 bullet points of the most essential things to remember

Keep the language clear and student-friendly. Do not copy large chunks of the source text.

Source text:
{source_text}
"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful study assistant for university students."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1500
        )

        return completion.choices[0].message.content.strip()

    except Exception as e:
        return f"Error generating notes: {str(e)}"


def generate_flashcards(source_text):

    prompt = f"""
You are a study assistant helping a university student memorize their course material.

Given the following source text, generate exactly 8 flashcards.

You MUST respond using this exact format and nothing else — no introduction, no explanation,
no extra text before or after. Just the flashcards in this exact structure:

CARD 1
FRONT: [a clear, specific question or term]
BACK: [a concise answer or definition, 1-2 sentences max]

CARD 2
FRONT: [a clear, specific question or term]
BACK: [a concise answer or definition, 1-2 sentences max]

...and so on up to CARD 8.

Make the fronts specific and testable — not vague like "What is X?" but rather
questions that require real understanding. Mix question types: some definitions,
some "how does X work", some "what is the difference between X and Y".

Source text:
{source_text}
"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a study assistant. Always respond in the exact format requested with no extra text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1500
        )

        raw = completion.choices[0].message.content.strip()

        flashcards = []

        card_blocks = raw.split("CARD ")[1:]

        for block in card_blocks:
            lines = block.strip().splitlines()

            front = ""
            back = ""

            for line in lines:
                if line.startswith("FRONT:"):
                    front = line.replace("FRONT:", "", 1).strip()

                elif line.startswith("BACK:"):
                    back = line.replace("BACK:", "", 1).strip()

            if front and back:
                flashcards.append({"front": front, "back": back})

        return flashcards if flashcards else []

    except Exception as e:
        print(f"Error generating flashcards: {str(e)}")
        return []


def generate_quiz(source_text):

    prompt = f"""
You are a study assistant helping a university student test their knowledge.

Given the following source text, generate exactly 10 quiz questions.
Use exactly: 2 multiple choice, 2 true/false, 2 fill in the blank, 2 matching, and 2 select all that apply.

You MUST respond in this exact format and nothing else — no introduction,
no explanation, no extra text before or after.

--- MULTIPLE CHOICE FORMAT ---
QUESTION [n]
TYPE: multiple_choice
QUESTION: [the question text]
A: [option A]
B: [option B]
C: [option C]
D: [option D]
ANSWER: [just the letter: A, B, C, or D]

--- TRUE/FALSE FORMAT ---
QUESTION [n]
TYPE: true_false
QUESTION: [a statement that is either true or false]
ANSWER: [just the word: True or False]

--- FILL IN THE BLANK FORMAT ---
QUESTION [n]
TYPE: fill_blank
QUESTION: [a sentence with exactly one blank represented by _____]
ANSWER: [the word or short phrase that fills the blank]

--- MATCHING FORMAT ---
QUESTION [n]
TYPE: matching
QUESTION: [brief instruction like "Match each term to its definition"]
LEFT_1: [term 1]
RIGHT_1: [definition 1]
LEFT_2: [term 2]
RIGHT_2: [definition 2]
LEFT_3: [term 3]
RIGHT_3: [definition 3]
LEFT_4: [term 4]
RIGHT_4: [definition 4]
PAIRS: 1-1,2-2,3-3,4-4

--- SELECT ALL THAT APPLY FORMAT ---
QUESTION [n]
TYPE: select_all
QUESTION: [the question text]
A: [option A]
B: [option B]
C: [option C]
D: [option D]
ANSWER: [comma-separated correct letters, e.g. A,C or A,B,D]

Important rules:
- For matching, PAIRS shows which LEFT matches which RIGHT. The order shown is always the correct pairing — LEFT_1 matches RIGHT_1, etc. Always write PAIRS as 1-1,2-2,3-3,4-4.
- For select all that apply, always have at least 2 correct answers and at least 1 wrong answer.
- Make questions test real understanding, not just memorization.
- Number questions 1 through 10 in order.

Source text:
{source_text}
"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a study assistant. Always respond in the exact format requested with no extra text whatsoever."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=3000
        )

        raw = completion.choices[0].message.content.strip()
        questions = []
        blocks = raw.split("QUESTION ")[1:]

        for block in blocks:
            lines = block.strip().splitlines()

            q_type = ""
            q_text = ""
            options = {}
            answer = ""
            left_items = {}
            right_items = {}

            for line in lines:
                line = line.strip()

                if line.startswith("TYPE:"):
                    q_type = line.replace("TYPE:", "", 1).strip()

                elif line.startswith("QUESTION:"):
                    q_text = line.replace("QUESTION:", "", 1).strip()

                elif line.startswith("A:"):
                    options["A"] = line.replace("A:", "", 1).strip()

                elif line.startswith("B:"):
                    options["B"] = line.replace("B:", "", 1).strip()

                elif line.startswith("C:"):
                    options["C"] = line.replace("C:", "", 1).strip()

                elif line.startswith("D:"):
                    options["D"] = line.replace("D:", "", 1).strip()

                elif line.startswith("ANSWER:"):
                    answer = line.replace("ANSWER:", "", 1).strip()

                elif line.startswith("LEFT_"):
                    parts = line.split(":", 1)
                    if len(parts) == 2:
                        num = parts[0].replace("LEFT_", "").strip()
                        left_items[num] = parts[1].strip()

                elif line.startswith("RIGHT_"):
                    parts = line.split(":", 1)
                    if len(parts) == 2:
                        num = parts[0].replace("RIGHT_", "").strip()
                        right_items[num] = parts[1].strip()

            if q_type and q_text and answer:

                if q_type == "multiple_choice" and options:
                    questions.append({
                        "type": "multiple_choice",
                        "question": q_text,
                        "options": options,
                        "answer": answer
                    })

                elif q_type == "true_false":
                    questions.append({
                        "type": "true_false",
                        "question": q_text,
                        "answer": answer
                    })

                elif q_type == "fill_blank":
                    questions.append({
                        "type": "fill_blank",
                        "question": q_text,
                        "answer": answer.lower()
                    })

                elif q_type == "matching" and left_items and right_items:
                    questions.append({
                        "type": "matching",
                        "question": q_text,
                        "left": [left_items[k] for k in sorted(left_items.keys())],
                        "right": [right_items[k] for k in sorted(right_items.keys())],
                        "answer": answer
                    })

                elif q_type == "select_all" and options:
                    answer_list = [a.strip() for a in answer.split(",")]
                    questions.append({
                        "type": "select_all",
                        "question": q_text,
                        "options": options,
                        "answer": answer_list
                    })

        return questions if questions else []

    except Exception as e:
        print(f"Error generating quiz: {str(e)}")
        return []