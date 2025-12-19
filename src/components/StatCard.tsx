import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: string;
  subtitle?: string;
}

export const StatCard = ({ icon: Icon, label, value, color, subtitle }: StatCardProps) => (
  <div
    className={`bg-gradient-to-br ${color} rounded-xl p-4 shadow-lg transform hover:scale-105 transition-transform cursor-default`}
  >
    <Icon className="w-7 h-7 text-white mb-2 opacity-80" />
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-sm text-white/80">{label}</div>
    {subtitle && <div className="text-xs text-white/60 mt-1">{subtitle}</div>}
  </div>
);
