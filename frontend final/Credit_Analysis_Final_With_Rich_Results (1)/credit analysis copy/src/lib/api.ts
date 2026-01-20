const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Shape EXACTLY matching backend CreditApplication (main.py)
 */
export interface CreditApplicationPayload {
  business_type: string;
  years_in_operation: number;
  annual_revenue: number;
  monthly_cashflow: number;
  loan_amount_requested: number;
  credit_score: number;
  existing_loans: number;        // COUNT (0–20)
  debt_to_income_ratio: number;  // DECIMAL (0–2)
  collateral_value: number;
  repayment_history: string;
}

/**
 * Backend response from POST /predict
 */
export interface RiskEvaluationResult {
  decision: "Approve" | "Reject" | "Manual Review";
  risk_level: "Low" | "Moderate" | "High" | "Very High";
  default_probability: number;
  risk_score: number;
  reasons: string[];
  profile_message: string;
}

/**
 * History row returned by GET /applications
 */
export interface ApplicationHistory {
  application_id: number;
  business_type: string;
  loan_amount_requested: number;
  credit_score: number;
  risk_level: "Low" | "Moderate" | "High" | "Very High";
  created_at: string;
}


/**
 * POST /predict
 * Sends fully normalized payload to backend risk engine
 */
export async function submitLoanApplication(
  payload: CreditApplicationPayload
): Promise<RiskEvaluationResult> {

  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Backend validation failed");
  }

  return res.json();
}

/**
 * GET /applications
 * Fetches authoritative application history from DB
 */
export async function getApplicationHistory(): Promise<ApplicationHistory[]> {
  const res = await fetch(`${API_BASE_URL}/applications`);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch application history");
  }

  return res.json();
}
