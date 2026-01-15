import numpy as np
import pandas as pd
import random

np.random.seed(42)
random.seed(42)

n = 10000

data = pd.DataFrame({
    "applicant_id": range(1, n + 1),
    "business_type": np.random.choice(
        ["Manufacturing", "Trading", "Services"], n),
    "years_in_operation": np.random.randint(1, 30, n),
    "annual_revenue": np.random.lognormal(mean=10, sigma=0.6, size=n),
    "credit_score": np.random.randint(300, 900, n),
    "existing_loans": np.random.randint(0, 5, n),
    "repayment_history": np.random.choice(
        ["Good", "Average", "Poor"], n, p=[0.6, 0.25, 0.15])
})

data["monthly_cashflow"] = (
    data["annual_revenue"] / 12 * np.random.uniform(0.05, 0.25, n)
)
data["loan_amount_requested"] = (
    data["annual_revenue"] * np.random.uniform(0.1, 0.6, n)
)
data["collateral_value"] = (
    data["loan_amount_requested"] * np.random.uniform(0.5, 2.0, n)
)
data["debt_to_income_ratio"] = np.random.uniform(0.1, 0.9, n)


def calculate_default(row):
    risk_score = 0

    if row["credit_score"] < 500:
        risk_score += 2
    if row["debt_to_income_ratio"] > 0.6:
        risk_score += 2
    if row["repayment_history"] == "Poor":
        risk_score += 2
    if row["monthly_cashflow"] < (row["loan_amount_requested"] / 24):
        risk_score += 1
    if row["existing_loans"] >= 3:
        risk_score += 1

    # Probabilistic default (realistic)
    probability = min(0.15 * risk_score, 0.9)
    return 1 if random.random() < probability else 0


data["default_flag"] = data.apply(calculate_default, axis=1)

data.to_csv("data/raw/business_credit_data.csv", index=False)

print("✅ Dataset created successfully with probabilistic defaults!")


