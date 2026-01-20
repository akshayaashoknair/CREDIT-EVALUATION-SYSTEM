from groq import Groq
import json
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_financials_with_llama(raw_text: str) -> dict:
    prompt = f"""
You are a financial document analysis AI.

Given the following bank statement text, extract these fields:

1. monthly_cashflow (average monthly incoming amount)
2. annual_revenue (estimate if possible)
3. existing_loans (count of EMIs or loans)
4. confidence (high / medium / low)
5. warnings (array of strings)

RULES:
- Return ONLY valid JSON
- Use numbers only (no commas)
- If uncertain, omit the field

BANK STATEMENT TEXT:
\"\"\"
{raw_text[:4000]}
\"\"\"

JSON FORMAT:
{{
  "monthly_cashflow": number,
  "annual_revenue": number,
  "existing_loans": number,
  "confidence": "high|medium|low",
  "warnings": []
}}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    try:
        return json.loads(content)
    except Exception:
        return {
            "warnings": ["LLM failed to return valid JSON"],
            "confidence": "low"
        }
