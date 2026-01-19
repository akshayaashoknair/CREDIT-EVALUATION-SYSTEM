import pdfplumber
import pytesseract
import re
from pdf2image import convert_from_bytes
from collections import defaultdict
from datetime import datetime
from statistics import mean
from PIL import Image
import io

def extract_text_from_document(file) -> str:
    """
    Extract raw text from PDF or image.
    No parsing, no intelligence yet.
    """

    filename = file.filename.lower()
    content = file.file.read()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(content)

    elif filename.endswith((".png", ".jpg", ".jpeg")):
        return extract_text_from_image(content)

    else:
        raise ValueError("Unsupported file format")


def extract_text_from_pdf(content: bytes) -> dict:
    raw_text = ""
    table_text = ""

    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                raw_text += text + "\n"

            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if row:
                        table_text += " ".join(cell for cell in row if cell) + "\n"

    combined = normalize_text(raw_text + "\n" + table_text)

    # 🔥 FORCE OCR if transaction structure missing
    TRANSACTION_HINTS = ["deposit", "withdrawal", "credit", "debit", "balance"]

    if not any(h in combined.lower() for h in TRANSACTION_HINTS):
        print("🔥 OCR FALLBACK TRIGGERED")
        images = convert_from_bytes(content)
        ocr_text = ""
        for img in images:
            ocr_text += pytesseract.image_to_string(img) + "\n"
        combined = normalize_text(combined + "\n" + ocr_text)

    return {
        "raw_text": combined,
        "raw_text_preview": combined[:500]
    }


def extract_text_from_image(content: bytes) -> str:
    image = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(image)
    return normalize_text(text)


def normalize_text(text: str) -> str:
    return (
        text.lower()
        .replace(",", "")
        .replace("₹", " rs ")
        .replace("$", " usd ")
    )

import re
from collections import defaultdict
from datetime import datetime

def parse_bank_statement(text: str):
    extracted_fields = {}
    confidence = {}
    warnings = []

    if not text:
        warnings.append("No text extracted from document")
        return extracted_fields, confidence, warnings

    IGNORE_KEYWORDS = [
        "micr",
        "ifsc",
        "account no",
        "account number",
        "branch",
        "opening balance",
        "closing balance",
        "balance",
    ]

    monthly_totals = defaultdict(float)
    valid_transaction_count = 0

    lines = text.split("\n")

    for line in lines:
        lower = line.lower()

        # 🚫 Skip non-transaction lines
        if any(k in lower for k in IGNORE_KEYWORDS):
            continue

        # ✅ Look only for CREDIT-like lines
        if not re.search(r"\b(cr|credit|salary|neft|imps|upi)\b", lower):
            continue

        # 💰 Extract amount (with decimals only)
        amount_match = re.search(r"([\d,]+(?:\.\d{2})?)", line)
        if not amount_match:
            continue

        try:
            value = float(amount_match.group(1).replace(",", ""))

            # 🚨 Sanity check: skip unrealistic values
            if value <= 0 or value > 1_000_000:
                continue
                
            # Skip balance column values (usually the largest number in line)
            if "balance" in lower:
                continue

        except Exception:
            continue
            
        # 📅 Try extracting date
        date = None

        # Format 1: 16/06/2019 or 16-06-2019
        numeric_date = re.search(r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", line)

        # Format 2: 16 Jun 19
        text_date = re.search(
            r"(\d{1,2}\s+[A-Za-z]{3}\s+\d{2})",
            line
        )

        try:
            if numeric_date:
                date = datetime.strptime(numeric_date.group(1), "%d/%m/%Y")
            elif text_date:
                date = datetime.strptime(text_date.group(1), "%d %b %y")
            else:
                continue

            month_key = date.strftime("%Y-%m")

        except Exception:
            continue

        monthly_totals[month_key] += value
        valid_transaction_count += 1

    if monthly_totals:
        avg_cashflow = sum(monthly_totals.values()) / len(monthly_totals)
        extracted_fields["monthly_cashflow"] = round(avg_cashflow, 2)

        # Confidence logic
        confidence["monthly_cashflow"] = (
            "high" if valid_transaction_count >= 8 else "medium"
        )
    else:
        warnings.append("Could not reliably detect monthly cashflow")

    return extracted_fields, confidence, warnings
