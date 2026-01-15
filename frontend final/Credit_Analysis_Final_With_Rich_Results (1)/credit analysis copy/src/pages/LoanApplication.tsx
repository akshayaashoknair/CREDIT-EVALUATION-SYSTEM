import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Layout from "@/components/layout/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { submitLoanApplication } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/* ---------------- BACKEND-ALIGNED FORM TYPE ---------------- */

interface LoanApplicationForm {
  business_type: string;
  years_in_operation: number;
  annual_revenue: number;
  monthly_cashflow: number;
  loan_amount_requested: number;
  credit_score: number;
  existing_loans: number;          // COUNT
  debt_to_income_ratio: number;    // PERCENT INPUT (converted later)
  collateral_value: number;
  repayment_history: string;
}

const LoanApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<LoanApplicationForm>({
    business_type: "Manufacturing",
    years_in_operation: 0,
    annual_revenue: 0,
    monthly_cashflow: 0,
    loan_amount_requested: 0,
    credit_score: 0,
    existing_loans: 0,
    debt_to_income_ratio: 0, // % entered by user
    collateral_value: 0,
    repayment_history: "Good",
  });

  /* ---------------- BASIC VALIDATION ---------------- */

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.annual_revenue <= 0) newErrors.annual_revenue = "Required";
    if (formData.loan_amount_requested <= 0) newErrors.loan_amount_requested = "Required";
    if (formData.credit_score < 300 || formData.credit_score > 900)
      newErrors.credit_score = "Must be between 300 and 900";
    if (formData.existing_loans < 0 || formData.existing_loans > 20)
      newErrors.existing_loans = "Must be between 0 and 20";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const payload = {
      business_type: formData.business_type.trim(),
      years_in_operation: Number(formData.years_in_operation),
      annual_revenue: Number(formData.annual_revenue),
      monthly_cashflow: Number(formData.monthly_cashflow),
      loan_amount_requested: Number(formData.loan_amount_requested),
      credit_score: Number(formData.credit_score),
      existing_loans: Number(formData.existing_loans), // COUNT
      debt_to_income_ratio: Number(formData.debt_to_income_ratio) / 100, // % → decimal
      collateral_value: Number(formData.collateral_value),
      repayment_history: formData.repayment_history.trim(),
    };

    console.log("PAYLOAD SENT TO BACKEND:", payload);

    try {
      const result = await submitLoanApplication(payload);
      navigate("/result", { state: result });
    } catch (error: any) {
      console.error("Backend error:", error.message);
      toast({
        title: "Risk evaluation failed",
        description: "Backend rejected the request. Check input values.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof LoanApplicationForm,
    value: number | string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Layout>
      <div className="mx-auto max-w-2xl animate-fade-in">
        <Card className="shadow-elevated">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Loan Application
            </CardTitle>
            <CardDescription>
              Submit details for AI-powered credit risk evaluation
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Business Type */}
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Select
                  value={formData.business_type}
                  onValueChange={(v) => handleInputChange("business_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Trading">Trading</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
			  
			  {/* Years in Operation */}
				<div className="space-y-2">
				  <Label htmlFor="years_in_operation">Years in Operation</Label>
				  <Input
					id="years_in_operation"
					type="number"
					min={0}
					value={formData.years_in_operation || ''}
					onChange={(e) =>
					  handleInputChange(
						'years_in_operation',
						Number(e.target.value)
					  )
					}
				  />
				</div>


              {/* Annual Revenue */}
              <div className="space-y-2">
                <Label>Annual Revenue (₹)</Label>
                <Input
                  type="number"
                  value={formData.annual_revenue || ""}
                  onChange={(e) =>
                    handleInputChange("annual_revenue", Number(e.target.value))
                  }
                />
              </div>
			  
			  {/* Monthly Cashflow */}
			<div className="space-y-2">
			  <Label htmlFor="monthly_cashflow">Monthly Cashflow (₹)</Label>
			  <Input
				id="monthly_cashflow"
				type="number"
				value={formData.monthly_cashflow || ''}
				onChange={(e) =>
				  handleInputChange(
					'monthly_cashflow',
					Number(e.target.value)
				  )
				}
			  />
			</div>


              {/* Loan Amount */}
              <div className="space-y-2">
                <Label>Loan Amount Requested (₹)</Label>
                <Input
                  type="number"
                  value={formData.loan_amount_requested || ""}
                  onChange={(e) =>
                    handleInputChange("loan_amount_requested", Number(e.target.value))
                  }
                />
              </div>

              {/* Credit Score */}
              <div className="space-y-2">
                <Label>Credit Score (300–900)</Label>
                <Input
                  type="number"
                  min={300}
                  max={900}
                  value={formData.credit_score || ""}
                  onChange={(e) =>
                    handleInputChange("credit_score", Number(e.target.value))
                  }
                />
              </div>

              {/* Existing Loans */}
              <div className="space-y-2">
                <Label>Existing Loans (Count)</Label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={formData.existing_loans || ""}
                  onChange={(e) =>
                    handleInputChange("existing_loans", Number(e.target.value))
                  }
                />
              </div>

              {/* Debt-to-Income Ratio */}
              <div className="space-y-2">
                <Label>Debt-to-Income Ratio (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.debt_to_income_ratio || ""}
                  onChange={(e) =>
                    handleInputChange("debt_to_income_ratio", Number(e.target.value))
                  }
                />
              </div>

              {/* Collateral */}
              <div className="space-y-2">
                <Label>Collateral Value (₹)</Label>
                <Input
                  type="number"
                  value={formData.collateral_value || ""}
                  onChange={(e) =>
                    handleInputChange("collateral_value", Number(e.target.value))
                  }
                />
              </div>

              {/* Repayment History */}
              <div className="space-y-2">
                <Label>Repayment History</Label>
                <Select
                  value={formData.repayment_history}
                  onValueChange={(v) =>
                    handleInputChange("repayment_history", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing…
                  </>
                ) : (
                  <>
                    Submit for Risk Evaluation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LoanApplication;
