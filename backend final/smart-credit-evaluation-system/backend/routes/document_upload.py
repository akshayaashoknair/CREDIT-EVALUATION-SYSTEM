import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.services.document_reader import extract_text_from_pdf

router = APIRouter(prefix="/upload-document", tags=["Document Upload"])

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...)
):
    # Validate document type
    allowed_types = {
        "bank_statement",
        "profit_and_loss",
        "balance_sheet",
        "loan_summary",
        "tax_filing"
    }

    if document_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid document type")

    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported in Phase 3A")

    # Save file temporarily
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        extracted_text = extract_text_from_pdf(file_path)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read PDF")

    # Cleanup
    os.remove(file_path)

    # TEMP RESPONSE (for Phase 3A testing)
    return {
        "document_type": document_type,
        "extracted_text_preview": extracted_text[:1000]  # limit size
    }
