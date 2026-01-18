from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, Any

from backend.services.document_reader import extract_text_from_pdf
from backend.services.document_reader import parse_bank_statement

router = APIRouter()

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...)
) -> Dict[str, Any]:

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # ✅ READ FILE BYTES (CRITICAL)
    try:
        content = await file.read()
        result = extract_text_from_pdf(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    extracted_fields = {}
    confidence = {}
    warnings = []

    # ✅ BANK STATEMENT PARSING
    if document_type == "bank_statement":
        extracted_fields, confidence, warnings = parse_bank_statement(
            result.get("raw_text_preview", "")
        )

    return {
        "document_type": document_type,
        "extracted_fields": extracted_fields,
        "confidence": confidence,
        "warnings": warnings,
        "raw_text_preview": result.get("raw_text_preview", "")
    }
