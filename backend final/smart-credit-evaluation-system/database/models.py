from sqlalchemy import Column, Integer, Float, String, DateTime, Text
from datetime import datetime
from .db import Base

class CreditApplication(Base):
    __tablename__ = "credit_applications"

    id = Column(Integer, primary_key=True, index=True)

    business_type = Column(String)
    years_in_operation = Column(Float)
    annual_revenue = Column(Float)
    monthly_cashflow = Column(Float)
    loan_amount_requested = Column(Float)
    credit_score = Column(Float)
    existing_loans = Column(Integer)
    debt_to_income_ratio = Column(Float)
    collateral_value = Column(Float)
    repayment_history = Column(String)

    default_probability = Column(Float)
    risk_score = Column(Float)
    risk_level = Column(String)
    decision = Column(String)

    reasons = Column(Text)
    model_used = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)
