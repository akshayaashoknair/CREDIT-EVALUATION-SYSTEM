from fastapi import APIRouter, HTTPException
from database.db import SessionLocal
from database.models import CreditApplication
from backend.services.report_generator import generate_ai_summary

router = APIRouter()

@router.get("/report/{application_id}")
def get_report(application_id: int):
    db = SessionLocal()
    app = db.query(CreditApplication).filter(
        CreditApplication.id == application_id
    ).first()
    db.close()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    ai_summary = generate_ai_summary(app)

    return {
        "application_id": app.id,
        "decision": app.decision,
        "risk_level": app.risk_level,
        "risk_score": app.risk_score,
        "default_probability": app.default_probability,
        "reasons": app.reasons,
        "ai_summary": ai_summary,
        "created_at": app.created_at
    }
