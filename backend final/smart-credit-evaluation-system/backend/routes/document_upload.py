from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, Any
from backend.services.document_reader import extract_text_from_pdf, parse_bank_statement

router = APIRouter()

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...)
) -> Dict[str, Any]:

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    try:
        content = await file.read()
        result = extract_text_from_pdf(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    extracted_fields = {}
    confidence = {}
    warnings = []

    if document_type == "bank_statement":
        from backend.services.llm_extractor import extract_financials_with_llama

        llm_result = extract_financials_with_llama(result["raw_text"])

        extracted_fields = {
            k: v for k, v in llm_result.items()
            if k in ["monthly_cashflow", "annual_revenue", "existing_loans"]
        }

        confidence = {"overall": llm_result.get("confidence")}
        warnings = llm_result.get("warnings", [])


        # ✅ Sanity check MUST be here
        if extracted_fields.get("monthly_cashflow", 0) < 1000:
            warnings.append("Extracted cashflow is unrealistically low. Kindly check manually.")
            extracted_fields.pop("monthly_cashflow", None)

    return {
        "document_type": document_type,
        "extracted_fields": extracted_fields,
        "confidence": confidence,
        "warnings": warnings,
        "raw_text_preview": result.get("raw_text_preview", "")
    }

