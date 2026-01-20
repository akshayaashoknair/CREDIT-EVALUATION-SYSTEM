from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field, validator
import joblib
import pandas as pd
import datetime
import json


from database.db import SessionLocal
from database.models import CreditApplication as CreditApplicationDB


# -------------------------------------------------
# APP INIT
# -------------------------------------------------
app = FastAPI(title="AI Credit Evaluation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from backend.routes import document_upload
app.include_router(document_upload.router)
from backend.routes import report
app.include_router(report.router)

# -------------------------------------------------
# LOAD ARTIFACTS
# -------------------------------------------------
model = joblib.load("models/xgboost_model.pkl")
scaler = joblib.load("models/scaler.pkl")
label_encoders = joblib.load("models/label_encoders.pkl")

# -------------------------------------------------
# CONSTANTS
# -------------------------------------------------
MAX_REVENUE = 1e9
MAX_LOAN = 5e8
MAX_YEARS = 60
MIN_CREDIT_SCORE = 300
MAX_CREDIT_SCORE = 900

# -------------------------------------------------
# FEATURE ORDER
# -------------------------------------------------
TRAINING_FEATURE_ORDER = [
    "business_type",
    "years_in_operation",
    "annual_revenue",
    "credit_score",
    "existing_loans",
    "repayment_history",
    "monthly_cashflow",
    "loan_amount_requested",
    "collateral_value",
    "debt_to_income_ratio",
    "loan_to_revenue_ratio",
    "cashflow_to_loan_ratio"
]

# -------------------------------------------------
# INPUT SCHEMA
# -------------------------------------------------
class CreditApplication(BaseModel):
    business_type: str
    years_in_operation: float = Field(ge=0, le=MAX_YEARS)
    annual_revenue: float = Field(gt=0, le=MAX_REVENUE)
    monthly_cashflow: float
    loan_amount_requested: float = Field(gt=0, le=MAX_LOAN)
    credit_score: float = Field(ge=MIN_CREDIT_SCORE, le=MAX_CREDIT_SCORE)
    existing_loans: int = Field(ge=0, le=20)
    debt_to_income_ratio: float = Field(ge=0, le=2)
    collateral_value: float = Field(ge=0)
    repayment_history: str

    @validator("business_type", "repayment_history", pre=True)
    def normalize_strings(cls, v):
        return v.strip().title()

# -------------------------------------------------
# RISK LABEL
# -------------------------------------------------
def qualitative_risk_label(decision, flags_count):
    if decision == "Reject":
        return "Very High"
    if decision == "Manual Review":
        return "High" if flags_count >= 2 else "Moderate"
    return "Low"

# -------------------------------------------------
# PREDICTION ENDPOINT
# -------------------------------------------------
@app.post("/predict")
def predict(application: CreditApplication):

    decision = None
    reasons = []
    flags = []

    # -------------------------------
    # LAYER 1: SANITY CHECKS
    # -------------------------------
    if application.monthly_cashflow < 0:
        decision = "Reject"
        reasons.append(
            "Reported monthly cashflow is negative, indicating the business is operating at a loss"
        )

    if application.monthly_cashflow * 12 > application.annual_revenue * 1.5:
        flags.append("Cashflow appears inconsistent with annual revenue")

    if application.loan_amount_requested > application.annual_revenue * 3:
        flags.append("Loan amount is disproportionately high relative to revenue")

    if application.debt_to_income_ratio > 1:
        flags.append("Debt-to-income ratio exceeds acceptable limits")

    # -------------------------------
    # LAYER 2: POLICY RULES
    # -------------------------------
    if (
        application.credit_score < 580 and
        application.repayment_history == "Poor" and
        application.debt_to_income_ratio > 0.75 and
        application.existing_loans >= 3
    ):
        decision = "Reject"
        reasons.extend([
            "Low credit score",
            "Poor repayment history",
            "High debt burden",
            "Multiple existing loans"
        ])

    if decision is None and application.credit_score < 550:
        decision = "Manual Review"
        reasons.append("Credit score below preferred threshold")

    # -------------------------------
    # GREY ZONE CHECK
    # -------------------------------
    medium_risk = 0

    if 600 <= application.credit_score < 680:
        medium_risk += 1
    if application.debt_to_income_ratio >= 0.5:
        medium_risk += 1
    if application.existing_loans >= 2:
        medium_risk += 1
    if application.collateral_value < application.loan_amount_requested * 0.4:
        medium_risk += 1
    if application.repayment_history == "Average":
        medium_risk += 1

    if medium_risk >= 2:
        flags.append("Multiple moderate risk indicators detected")

    if application.years_in_operation < 2:
        flags.append("Limited operating history")

    if application.collateral_value < application.loan_amount_requested * 0.25:
        flags.append("Insufficient collateral coverage")

    # -------------------------------
    # LAYER 3: ML PREDICTION
    # -------------------------------
    df = pd.DataFrame([application.dict()])

    for col in ["business_type", "repayment_history"]:
        df[col] = label_encoders[col].transform(df[col])

    df["loan_to_revenue_ratio"] = df["loan_amount_requested"] / df["annual_revenue"]
    df["cashflow_to_loan_ratio"] = df["monthly_cashflow"] / df["loan_amount_requested"].clip(lower=1)

    numeric_cols = [
        "years_in_operation", "annual_revenue", "monthly_cashflow",
        "loan_amount_requested", "credit_score", "existing_loans",
        "debt_to_income_ratio", "collateral_value",
        "loan_to_revenue_ratio", "cashflow_to_loan_ratio"
    ]

    df[numeric_cols] = scaler.transform(df[numeric_cols])
    df = df[TRAINING_FEATURE_ORDER]

    prob = float(model.predict_proba(df)[0][1])
    base_risk_score = prob * 100
    risk_score = min(round(base_risk_score + len(flags) * 5, 2), 100)

    # -------------------------------
    # FINAL DECISION
    # -------------------------------
    if decision is None:
        if prob < 0.25:
            decision = "Approve"
            reasons.append("Low predicted probability of default")
        elif prob < 0.55:
            decision = "Manual Review"
            reasons.append("Moderate predicted default risk")
        else:
            decision = "Reject"
            reasons.append("High predicted probability of default")

    if flags:
        reasons.extend(flags)

    risk_level = qualitative_risk_label(decision, len(flags))

    # -------------------------------
    # DATABASE SAVE (ALWAYS)
    # -------------------------------
    db = SessionLocal()
    try:
        db.add(CreditApplicationDB(
            **application.dict(),
            default_probability=round(prob * 100, 2),
            risk_score=risk_score,
            risk_level=risk_level,
            decision=decision,
            reasons=json.dumps(reasons),
            model_used="XGBoost_v1"
        ))
        db.commit()
    finally:
        db.close()

    return {
        "decision": decision,
        "risk_level": risk_level,
        "default_probability": round(prob * 100, 2),
        "risk_score": risk_score,
        "reasons": reasons,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
# -------------------------------------------------
# APPLICATION HISTORY (FOR DASHBOARD)
# -------------------------------------------------
@app.get("/applications")
def get_applications():
    db = SessionLocal()
    try:
        applications = (
            db.query(CreditApplicationDB)
            .order_by(CreditApplicationDB.created_at.desc())
            .all()
        )

        return [
            {
                "application_id": app.id,
                "business_type": app.business_type,
                "loan_amount_requested": app.loan_amount_requested,
                "credit_score": app.credit_score,
                "risk_level": app.risk_level,
                "created_at": app.created_at.isoformat() if app.created_at else None,
            }
            for app in applications
        ]
    finally:
        db.close()



# -------------------------------------------------
# ROOT
# -------------------------------------------------
@app.get("/")
def root():
    return RedirectResponse(url="/docs")
