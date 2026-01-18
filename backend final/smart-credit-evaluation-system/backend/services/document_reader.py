import pdfplumber
import pytesseract
import re
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

    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                raw_text += page_text + "\n"

    normalized = normalize_text(raw_text)

    extracted_fields = {}
    confidence = {}
    warnings = []

    # -----------------------------
    # BANK STATEMENT CASHFLOW LOGIC
    # -----------------------------

    credit_pattern = re.compile(
        r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}).*?(CR|CREDIT).*?([\d,]+\.\d{2})",
        re.IGNORECASE
    )

    monthly_totals = defaultdict(float)
    matches = credit_pattern.findall(normalized)

    for date_str, _, amount in matches:
        try:
            date = datetime.strptime(date_str, "%d/%m/%Y")
            value = float(amount.replace(",", ""))
            month_key = date.strftime("%Y-%m")
            monthly_totals[month_key] += value
        except Exception:
            continue

    if monthly_totals:
        avg_monthly_cashflow = sum(monthly_totals.values()) / len(monthly_totals)
        extracted_fields["monthly_cashflow"] = round(avg_monthly_cashflow, 2)
        confidence["monthly_cashflow"] = 0.75
    else:
        warnings.append("Could not reliably detect monthly cashflow")

    return {
        "raw_text_preview": normalized[:500],
        "extracted_fields": extracted_fields,
        "confidence": confidence,
        "warnings": warnings,
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
        date_match = re.search(r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", line)
        if not date_match:
            continue

        try:
            date = datetime.strptime(date_match.group(1), "%d/%m/%Y")
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
