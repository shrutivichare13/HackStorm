/**
 * Trust Badge Component
 * Shows verification trust level with visual indicator.
 */

import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface TrustBadgeProps {
  score: number;
  showLabel?: boolean;
}

export default function TrustBadge({ score, showLabel = true }: TrustBadgeProps) {
  const getLevel = () => {
    if (score >= 80) return { label: 'High Trust', color: 'text-green-600', Icon: ShieldCheck };
    if (score >= 50) return { label: 'Medium Trust', color: 'text-yellow-600', Icon: Shield };
    return { label: 'Low Trust', color: 'text-red-600', Icon: ShieldAlert };
  };

  const { label, color, Icon } = getLevel();

  return (
    <div className={`inline-flex items-center gap-1 ${color}`}>
      <Icon className="h-4 w-4" />
      {showLabel && <span className="text-xs font-medium">{label} ({score})</span>}
    </div>
  );
}
