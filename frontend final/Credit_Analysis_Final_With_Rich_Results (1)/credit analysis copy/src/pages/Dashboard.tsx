import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Plus, Search, FileText } from "lucide-react";
import type { ApplicationHistory } from "@/lib/api";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Layout from "@/components/layout/Layout";
import RiskBadge from "@/components/RiskBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getApplicationHistory } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/* ---------------- BACKEND-ALIGNED TYPE ---------------- */



const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [applications, setApplications] = useState<ApplicationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  /* ---------------- FETCH FROM BACKEND ---------------- */

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const data = await getApplicationHistory();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setApplications([]);
      toast({
        title: "Connection Error",
        description: "Could not retrieve application history from the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  /* ---------------- FILTERING ---------------- */

  const filteredApplications = applications.filter(
    (app) =>
      app.application_id.toString().includes(searchQuery) ||
      app.business_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ---------------- FORMATTERS ---------------- */

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ---------------- STATS ---------------- */

  const stats = {
    total: applications.length,
    lowRisk: applications.filter((a) => a.risk_level === "Low").length,
    moderateRisk: applications.filter((a) => a.risk_level === "Moderate").length,
    highRisk: applications.filter(
      (a) => a.risk_level === "High" || a.risk_level === "Very High"
    ).length,
  };

  return (
    <Layout>
      <div className="animate-fade-in space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-text">
              Underwriter Dashboard
            </h1>
            <p className="mt-1 text-brand-muted">
              Review and manage loan applications
            </p>
          </div>

          <Button
            onClick={() => navigate("/")}
            className="
              gap-2 rounded-xl
              bg-gradient-to-r from-brand-primary to-brand-secondary
              text-white shadow-prominent
            "
          >
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/70 backdrop-blur shadow-card">
            <CardContent className="p-6">
              <p className="text-sm text-brand-muted">Total Applications</p>
              <p className="text-2xl font-bold text-brand-text">
                {stats.total}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur shadow-card">
            <CardContent className="p-6">
              <p className="text-sm text-brand-muted">Low Risk</p>
              <p className="text-2xl font-bold text-risk-low">
                {stats.lowRisk}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur shadow-card">
            <CardContent className="p-6">
              <p className="text-sm text-brand-muted">Moderate Risk</p>
              <p className="text-2xl font-bold text-risk-medium">
                {stats.moderateRisk}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur shadow-card">
            <CardContent className="p-6">
              <p className="text-sm text-brand-muted">
                High / Very High Risk
              </p>
              <p className="text-2xl font-bold text-risk-high">
                {stats.highRisk}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-white/70 backdrop-blur shadow-elevated">
          <CardHeader className="border-b border-border/50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-brand-text">
                  Application History
                </CardTitle>
                <CardDescription className="text-brand-muted">
                  Real-time data from backend database
                </CardDescription>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                  <Input
                    placeholder="Search applications..."
                    className="h-10 w-64 pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchApplications}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <FileText className="mb-4 h-12 w-12 text-brand-muted/50" />
                <p className="text-brand-muted">No applications found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Business Type</TableHead>
                    <TableHead className="text-right">
                      Loan Amount
                    </TableHead>
                    <TableHead className="text-center">
                      Credit Score
                    </TableHead>
                    <TableHead className="text-center">
                      Risk Level
                    </TableHead>
                    <TableHead>Date</TableHead>
					<TableHead className="text-center">Report</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.application_id}>
                      <TableCell className="font-mono">
                        {app.application_id}
                      </TableCell>
                      <TableCell>{app.business_type}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(app.loan_amount_requested)}
                      </TableCell>
                      <TableCell className="text-center">
                        {app.credit_score}
                      </TableCell>
                      <TableCell className="text-center">
                        <RiskBadge riskLevel={app.risk_level} />
                      </TableCell>
                      <TableCell>
                        {formatDate(app.created_at)}
                      </TableCell>
					  <TableCell className="text-center">
						  <Button
							size="sm"
							variant="outline"
							onClick={() => navigate(`/report/${app.application_id}`)}
						  >
							View AI Report
						  </Button>
						</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-brand-muted">
          Risk assessments are AI-generated recommendations. Final approval
          requires human review.
        </p>
      </div>
    </Layout>
  );
};

export default Dashboard;
