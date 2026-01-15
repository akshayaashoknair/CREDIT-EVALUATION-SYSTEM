import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  riskLevel: 'Low' | 'Medium' | 'High';
  probability: number;
}

const RiskGauge = ({ riskLevel, probability }: RiskGaugeProps) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'Low':
        return {
          color: 'text-risk-low',
          bgColor: 'bg-risk-low',
          lightBg: 'bg-risk-low-bg',
          rotation: -60,
          label: 'Low Risk',
        };
      case 'Medium':
        return {
          color: 'text-risk-medium',
          bgColor: 'bg-risk-medium',
          lightBg: 'bg-risk-medium-bg',
          rotation: 0,
          label: 'Medium Risk',
        };
      case 'High':
        return {
          color: 'text-risk-high',
          bgColor: 'bg-risk-high',
          lightBg: 'bg-risk-high-bg',
          rotation: 60,
          label: 'High Risk',
        };
    }
  };

  const config = getRiskConfig();

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Gauge Container */}
      <div className="relative h-48 w-80">
        {/* Gauge Background Arc */}
        <svg
          viewBox="0 0 200 120"
          className="h-full w-full"
        >
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Low risk segment */}
          <path
            d="M 20 100 A 80 80 0 0 1 66 34"
            fill="none"
            stroke="hsl(var(--risk-low))"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Medium risk segment */}
          <path
            d="M 66 34 A 80 80 0 0 1 134 34"
            fill="none"
            stroke="hsl(var(--risk-medium))"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* High risk segment */}
          <path
            d="M 134 34 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--risk-high))"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>

        {/* Needle */}
        <div
          className="absolute left-1/2 top-[100px] h-16 w-1 origin-bottom rounded-full transition-transform duration-1000 ease-out"
          style={{
            transform: `translateX(-50%) rotate(${animated ? config.rotation : -90}deg)`,
            background: `linear-gradient(to top, hsl(var(--foreground)), hsl(var(--foreground) / 0.6))`,
          }}
        />

        {/* Center dot */}
        <div className="absolute left-1/2 top-[100px] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-lg" />

        {/* Labels */}
        <div className="absolute bottom-0 left-4 text-xs font-medium text-risk-low">Low</div>
        <div className="absolute left-1/2 top-2 -translate-x-1/2 text-xs font-medium text-risk-medium">Medium</div>
        <div className="absolute bottom-0 right-4 text-xs font-medium text-risk-high">High</div>
      </div>

      {/* Risk Level Badge */}
      <div
        className={cn(
          "flex flex-col items-center gap-2 rounded-2xl border-2 px-8 py-4 transition-all duration-500",
          animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          riskLevel === 'Low' && "border-risk-low bg-risk-low-bg",
          riskLevel === 'Medium' && "border-risk-medium bg-risk-medium-bg",
          riskLevel === 'High' && "border-risk-high bg-risk-high-bg"
        )}
      >
        <span className={cn("text-2xl font-bold", config.color)}>
          {config.label}
        </span>
        <span className="text-sm text-muted-foreground">
          Risk Assessment Result
        </span>
      </div>
    </div>
  );
};

export default RiskGauge;
