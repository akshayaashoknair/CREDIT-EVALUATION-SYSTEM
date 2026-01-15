import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProbabilityBarProps {
  probability: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

const ProbabilityBar = ({ probability, riskLevel }: ProbabilityBarProps) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getBarColor = () => {
    switch (riskLevel) {
      case 'Low':
        return 'bg-risk-low';
      case 'Medium':
        return 'bg-risk-medium';
      case 'High':
        return 'bg-risk-high';
    }
  };

  const getLightBg = () => {
    switch (riskLevel) {
      case 'Low':
        return 'bg-risk-low-bg';
      case 'Medium':
        return 'bg-risk-medium-bg';
      case 'High':
        return 'bg-risk-high-bg';
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Default Probability</span>
        <span
          className={cn(
            "text-2xl font-bold transition-all duration-700",
            animated ? "opacity-100" : "opacity-0",
            riskLevel === 'Low' && "text-risk-low",
            riskLevel === 'Medium' && "text-risk-medium",
            riskLevel === 'High' && "text-risk-high"
          )}
        >
          {probability.toFixed(1)}%
        </span>
      </div>
      
      <div className={cn("h-4 w-full overflow-hidden rounded-full", getLightBg())}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            getBarColor()
          )}
          style={{
            width: animated ? `${probability}%` : '0%',
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default ProbabilityBar;
