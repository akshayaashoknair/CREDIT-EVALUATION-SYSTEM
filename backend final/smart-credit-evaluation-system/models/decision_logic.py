import pandas as pd
import joblib

# Load processed data
df = pd.read_csv("data/processed/credit_data_processed.csv")

# Separate features
X = df.drop(columns=["default_flag"])

# Load FINAL model (tuned XGBoost)
model = joblib.load("models/xgboost_model.pkl")

# Predict default probability
df["default_probability"] = model.predict_proba(X)[:, 1]

# Convert probability to risk score (0–100)
df["risk_score"] = (df["default_probability"] * 100).round(2)

# Decision logic
def decision_rule(prob):
    if prob < 0.30:
        return "APPROVE"
    elif prob < 0.60:
        return "MANUAL_REVIEW"
    else:
        return "REJECT"

df["decision"] = df["default_probability"].apply(decision_rule)

# Save final decision output
df.to_csv("data/processed/credit_decisions.csv", index=False)

print("✅ Decision logic applied successfully!")
print(df[["default_probability", "risk_score", "decision"]].head(10))

