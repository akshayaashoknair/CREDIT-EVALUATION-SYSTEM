import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ArrowRight } from "lucide-react";

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
  existing_loans: number;
  debt_to_income_ratio: number;
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
    debt_to_income_ratio: 0,
    collateral_value: 0,
    repayment_history: "Good",
  });

  /* ---------------- DOCUMENT UPLOAD STATES ---------------- */
  const [documentType, setDocumentType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  /* ---------------- VALIDATION ---------------- */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.annual_revenue <= 0) newErrors.annual_revenue = "Required";
    if (formData.loan_amount_requested <= 0)
      newErrors.loan_amount_requested = "Required";
    if (formData.credit_score < 300 || formData.credit_score > 900)
      newErrors.credit_score = "Must be between 300 and 900";
    if (formData.existing_loans < 0 || formData.existing_loans > 20)
      newErrors.existing_loans = "Must be between 0 and 20";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- INPUT HANDLER ---------------- */
  const handleInputChange = (
    field: keyof LoanApplicationForm,
    value: number | string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  /* ---------------- DOCUMENT UPLOAD ---------------- */
  const handleDocumentUpload = async () => {
	  console.log("UPLOAD BUTTON CLICKED", { documentType, selectedFile });

	  if (!documentType || !selectedFile) {
		console.log("BLOCKED BEFORE FETCH");
		toast({
		  title: "Missing information",
		  description: "Please select a document type and file.",
		  variant: "destructive",
		});
		return;
	  }

	  console.log("PASSING VALIDATION, CALLING FETCH");

    const formDataPayload = new FormData();
    formDataPayload.append("file", selectedFile);
    formDataPayload.append("document_type", documentType);

    try {
      setUploadLoading(true);

      console.log("ABOUT TO SEND FETCH REQUEST");
	  const response = await fetch(
		"http://127.0.0.1:8000/upload-document",
		{
			method: "POST",
			body: formDataPayload,
		}
	);

	console.log("FETCH SENT, status:", response.status);


      if (!response.ok) throw new Error("Extraction failed");

      const data = await response.json();
	  console.log("BACKEND RESPONSE:", data);

      const extracted = data.extracted_fields || {};

	setFormData((prev) => ({
	  ...prev,
	  ...(extracted.annual_revenue && {
		annual_revenue: extracted.annual_revenue,
	  }),
	  ...(extracted.monthly_cashflow && {
		monthly_cashflow: extracted.monthly_cashflow,
	  }),
	  ...(extracted.collateral_value && {
		collateral_value: extracted.collateral_value,
	  }),
	  ...(extracted.existing_loans && {
		existing_loans: extracted.existing_loans,
	  }),
	}));

      toast({
        title: "Document processed",
        description: "Fields auto-filled. Please review before submission.",
      });
    } catch {
      toast({
        title: "Upload failed",
        description: "Could not extract data from document.",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await submitLoanApplication({
        ...formData,
        debt_to_income_ratio: formData.debt_to_income_ratio / 100,
      });
      navigate("/result", { state: result });
    } catch {
      toast({
        title: "Risk evaluation failed",
        description: "Backend rejected the request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Layout>
      <div className="mx-auto max-w-2xl py-10 animate-fade-in">
        <Card className="rounded-2xl shadow-xl border border-indigo-100 bg-white/80 backdrop-blur-md">
          <CardHeader className="rounded-t-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Loan Application
            </CardTitle>
            <CardDescription>
              AI-assisted credit risk evaluation for business loans
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* DOCUMENT UPLOAD */}
              <div className="rounded-xl border border-indigo-100 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 space-y-4">
                <h3 className="text-sm font-semibold text-indigo-700">
                  Upload Financial Document (Optional)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Auto-fill form fields using uploaded documents (preferably a bank statement). Please verify
                  all values.
                </p>

                <Select
                  value={documentType}
                  onValueChange={(v) => setDocumentType(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_statement">
                      Bank Statement
                    </SelectItem>
                    <SelectItem value="profit_and_loss">
                      Profit & Loss Statement
                    </SelectItem>
                    <SelectItem value="balance_sheet">
                      Balance Sheet
                    </SelectItem>
                    <SelectItem value="loan_summary">Loan Summary</SelectItem>
                    <SelectItem value="tax_filing">Tax Filing</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="rounded-lg focus-visible:ring-indigo-300"
                  onChange={(e) =>
                    setSelectedFile(
                      e.target.files ? e.target.files[0] : null
                    )
                  }
                />

                <Button
				  type="button"
				  variant="secondary"
				  disabled={!documentType || !selectedFile || uploadLoading}
				  onClick={(e) => {
					e.preventDefault();
					handleDocumentUpload();
				  }}
				>
				  {uploadLoading ? "Extracting..." : "Upload & Auto-Fill"}
				</Button>
              </div>

              {/* FORM FIELDS */}
              {[
                ["Annual Revenue (₹)", "annual_revenue"],
                ["Monthly Cashflow (₹)", "monthly_cashflow"],
                ["Loan Amount Requested (₹)", "loan_amount_requested"],
                ["Credit Score", "credit_score"],
                ["Existing Loans", "existing_loans"],
                ["Debt-to-Income Ratio (%)", "debt_to_income_ratio"],
                ["Collateral Value (₹)", "collateral_value"],
              ].map(([label, field]) => (
                <div key={field} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    value={(formData as any)[field] || ""}
                    onChange={(e) =>
                      handleInputChange(field as any, Number(e.target.value))
                    }
                    className="rounded-lg focus-visible:ring-indigo-300"
                  />
                </div>
              ))}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:opacity-90"
              >
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