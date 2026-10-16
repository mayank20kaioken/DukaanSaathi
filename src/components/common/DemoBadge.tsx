import React from 'react';
import { Sparkles, Info } from 'lucide-react';

interface DemoBadgeProps {
  label?: string;
  tooltip?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ 
  label = "Simulated Demo Records", 
  tooltip = "This record is demo data calibrated for authentic Indian Kirana business workflows." 
}) => {
  return (
    <span 
      title={tooltip}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      <span>{label}</span>
    </span>
  );
};

export const AiPoweredBadge: React.FC<{ label?: string }> = ({ label = "AI Copilot" }) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-lime-soft text-lime-accent border border-lime-accent/25">
      <Sparkles className="w-3.5 h-3.5 text-lime-accent" />
      <span>{label}</span>
    </span>
  );
};
