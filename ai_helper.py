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