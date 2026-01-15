import pandas as pd
import joblib
import shap

# Load data
df = pd.read_csv("data/processed/credit_data_processed.csv")
X = df.drop(columns=["default_flag"])

# Load model
model = joblib.load("models/xgboost_model.pkl")

# SHAP explainer
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X.sample(200, random_state=42))

# Summary plot
shap.summary_plot(shap_values, X.sample(200, random_state=42))


