import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTranslate } from "@/providers/I18n/client";

interface ProgressBarProps {
  current: number;
  target: number;
  tier: "Standard" | "Silver" | "Gold" | "Platinum";
  className?: string;
  animated?: boolean;
}

const tierColors = {
  Standard: "bg-gradient-bronze",
  Silver: "bg-gradient-silver", 
  Gold: "bg-gradient-gold",
  Platinum: "bg-gradient-platinum"
};

export function ProgressBar({ 
  current, 
  target, 
  tier, 
  className,
  animated = true 
}: ProgressBarProps) {
  const { t } = useTranslate();

  const [progress, setProgress] = useState(0);
  const percentage = Math.min((current / target) * 100, 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setProgress(percentage);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setProgress(percentage);
    }
  }, [percentage, animated]);

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between text-sm text-gray-600">
        <span className="text-muted-foreground">{t("userprofile.progressBar.progressToNextTier")}</span>
        <span className="font-medium">{current.toLocaleString()} / {target.toLocaleString()}</span>
      </div>
      
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-3 rounded-full bg-gray-200"
        />
        <div 
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out",
            tierColors[tier]
          )}
          style={{ width: `${progress}%` }}
        />
        
        {/* Shimmer effect */}
        <div 
          className="absolute top-0 left-0 h-full rounded-full overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
      
      <div className="text-center text-xs text-muted-foreground">
        {target - current > 0
          ? t("userprofile.progressBar.pointsToNextTier", {
              points: (target - current).toLocaleString(),
            })
          : t("userprofile.progressBar.tierCompleted")}
      </div>
    </div>
  );
}