import { useLocation, Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/* ---------------- BACKEND-ALIGNED TYPE ---------------- */

interface RiskEvaluationResult {
  decision: "Approve" | "Reject" | "Manual Review";
  risk_level: "Low" | "Moderate" | "High" | "Very High";
  default_probability: number;
  risk_score: number;
  reasons: string[];
  profile_message: string;
}

const RiskResult = () => {
  const location = useLocation();

  // ✅ Backend response is passed DIRECTLY as navigation state
  const result = location.state as RiskEvaluationResult | null;

  // ✅ If user refreshes or navigates directly
  if (!result) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Assessment Result
          </h1>
          <p className="text-muted-foreground mt-1">
            Authoritative decision from centralized risk engine
          </p>
        </div>

        {/* Decision Summary */}
        <Card className="bg-muted/40 border-2 shadow-sm">
          <CardHeader>
            <CardTitle>Credit Decision</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">
                Decision
              </p>
              <p className="text-2xl font-bold mt-1">
                {result.decision}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">
                Risk Level
              </p>
              <p className="text-2xl font-bold mt-1">
                {result.risk_level}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">
                Risk Score
              </p>
              <p className="text-xl font-semibold mt-1">
                {result.risk_score}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">
                Default Probability
              </p>
              <p className="text-xl font-semibold mt-1">
                {`${result.default_probability}%`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Message */}
        <Card className="border-l-4 border-primary">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-2">Analysis Summary</h4>
            <p className="text-muted-foreground leading-relaxed">
              {result.profile_message}
            </p>
          </CardContent>
        </Card>

        {/* Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Key Factors</CardTitle>
          </CardHeader>
          <CardContent>
            {result.reasons.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {result.reasons.map((reason, index) => (
                  <li key={index} className="text-muted-foreground">
                    {reason}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific risk factors cited.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Risk Visualization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Risk Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0% (Safe)</span>
                <span>100% (High Risk)</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${result.default_probability}%`,
                    backgroundColor:
                      result.default_probability < 20
                        ? "#22c55e"
                        : result.default_probability < 50
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center pt-4">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Submit New Application
            </Link>
          </Button>
        </div>

      </div>
    </Layout>
  );
};

export default RiskResult;
