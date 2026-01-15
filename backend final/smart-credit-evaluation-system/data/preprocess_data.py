import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Load raw data
df = pd.read_csv("data/raw/business_credit_data.csv")

# -------------------------------
# 1. Handle Missing Values (if any)
# -------------------------------
df.fillna({
    "years_in_operation": df["years_in_operation"].median(),
    "annual_revenue": df["annual_revenue"].median(),
    "monthly_cashflow": df["monthly_cashflow"].median(),
    "loan_amount_requested": df["loan_amount_requested"].median(),
    "credit_score": df["credit_score"].median(),
    "existing_loans": df["existing_loans"].median(),
    "debt_to_income_ratio": df["debt_to_income_ratio"].median(),
    "collateral_value": df["collateral_value"].median()
}, inplace=True)

# -------------------------------
# 2. Encode Categorical Variables
# -------------------------------
label_encoders = {}

for col in ["business_type", "repayment_history"]:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# -------------------------------
# 3. Feature Engineering
# -------------------------------
df["loan_to_revenue_ratio"] = df["loan_amount_requested"] / df["annual_revenue"]
df["cashflow_to_loan_ratio"] = df["monthly_cashflow"] / df["loan_amount_requested"]

# -------------------------------
# 4. Drop ID Column (Not Useful for ML)
# -------------------------------
df.drop(columns=["applicant_id"], inplace=True)

# -------------------------------
# 5. Feature Scaling
# -------------------------------
scaler = StandardScaler()

numeric_cols = [
    "years_in_operation",
    "annual_revenue",
    "monthly_cashflow",
    "loan_amount_requested",
    "credit_score",
    "existing_loans",
    "debt_to_income_ratio",
    "collateral_value",
    "loan_to_revenue_ratio",
    "cashflow_to_loan_ratio"
]

df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
import joblib
joblib.dump(scaler, "models/scaler.pkl")
joblib.dump(label_encoders, "models/label_encoders.pkl")


# -------------------------------
# 6. Save Processed Dataset
# -------------------------------
df.to_csv("data/processed/credit_data_processed.csv", index=False)

print("✅ Data preprocessing completed successfully!")

