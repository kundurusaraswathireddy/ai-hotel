import React from 'react';
import { RiskTier } from '../types';

interface RiskBadgeProps {
  tier: RiskTier;
  probability?: number;
  showProb?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ tier, probability, showProb = false }) => {
  const styles: Record<RiskTier, { bg: string; text: string; border: string; label: string }> = {
    LOW: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-400',
      border: 'border-emerald-700/60',
      label: 'LOW RISK'
    },
    MODERATE: {
      bg: 'bg-amber-950/60',
      text: 'text-amber-400',
      border: 'border-amber-700/60',
      label: 'MODERATE'
    },
    HIGH: {
      bg: 'bg-orange-950/60',
      text: 'text-orange-400',
      border: 'border-orange-700/60',
      label: 'HIGH RISK'
    },
    CRITICAL: {
      bg: 'bg-rose-950/70',
      text: 'text-rose-400',
      border: 'border-rose-700/70',
      label: 'CRITICAL'
    }
  };

  const style = styles[tier] || styles.LOW;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
      <span className="h-1.5 w-1.5 rounded-full animate-pulse bg-current"></span>
      {style.label}
      {showProb && probability !== undefined && (
        <span className="opacity-80 font-normal">({(probability * 100).toFixed(1)}%)</span>
      )}
    </span>
  );
};
