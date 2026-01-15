import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ShieldOff,
} from "lucide-react";

/* ---------------- BACKEND-ALIGNED TYPES ---------------- */

export type BackendRiskLevel =
  | "Low"
  | "Moderate"
  | "High"
  | "Very High";

interface RiskBadgeProps {
  riskLevel: BackendRiskLevel;
  size?: "sm" | "md" | "lg";
}

/* ---------------- CONFIG MAP ---------------- */

const RISK_CONFIG: Record<
  BackendRiskLevel,
  { icon: React.ElementType; className: string }
> = {
  Low: {
    icon: ShieldCheck,
    className: "bg-risk-low-bg text-risk-low border-risk-low",
  },
  Moderate: {
    icon: ShieldAlert,
    className: "bg-risk-medium-bg text-risk-medium border-risk-medium",
  },
  High: {
    icon: ShieldX,
    className: "bg-risk-high-bg text-risk-high border-risk-high",
  },
  "Very High": {
    icon: ShieldOff,
    className: "bg-risk-high-bg text-risk-high border-risk-high",
  },
};

/* ---------------- COMPONENT ---------------- */

const RiskBadge = ({ riskLevel, size = "md" }: RiskBadgeProps) => {
  const config =
    RISK_CONFIG[riskLevel] ?? RISK_CONFIG["High"]; // safe fallback

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        sizeClasses[size],
        config.className
      )}
    >
      <Icon className={iconSizes[size]} />
      {riskLevel}
    </span>
  );
};

export default RiskBadge;
