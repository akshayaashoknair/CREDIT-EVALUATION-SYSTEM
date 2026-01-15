import pandas as pd
import joblib
import matplotlib.pyplot as plt

# Load processed data
df = pd.read_csv("data/processed/credit_data_processed.csv")
X = df.drop(columns=["default_flag"])

# Load trained XGBoost model (FINAL MODEL)
model = joblib.load("models/xgboost_model.pkl")

# Get feature importance
importance = model.feature_importances_

feature_importance_df = pd.DataFrame({
    "Feature": X.columns,
    "Importance": importance
}).sort_values(by="Importance", ascending=False)

print("\n📊 TOP IMPORTANT FEATURES (XGBoost)")
print(feature_importance_df.head(10))

# Plot
plt.figure(figsize=(8, 5))
plt.barh(
    feature_importance_df["Feature"][:10][::-1],
    feature_importance_df["Importance"][:10][::-1]
)
plt.xlabel("Importance Score")
plt.title("Top 10 Features Influencing Credit Risk")
plt.tight_layout()
plt.show()

