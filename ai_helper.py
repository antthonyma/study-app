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