def generate_ai_summary(app):
    summary = f"""
This credit application was evaluated using a hybrid AI + rule-based system.

The final decision was **{app.decision}**, with a risk level of **{app.risk_level}**.
The predicted probability of default is **{app.default_probability}%**.

Key factors influencing this decision include:
{app.reasons}

Overall, the applicant's financial profile indicates a {app.risk_level.lower()} risk,
based on cashflow stability, credit score, and existing liabilities.
"""
    return summary.strip()
