// ============================================================================
// METABOLIC SIMULATOR - SHARED DATA CARD COMPONENT
// ============================================================================

import { memo, ReactNode, HTMLAttributes } from 'react';

interface DataCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  titleAction?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'warning' | 'danger' | 'success' | 'info';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  className?: string;
}

const cardVariantClasses = {
  default: 'border-slate-700',
  elevated: 'border-slate-600 shadow-lg',
  warning: 'border-yellow-500/50 shadow-yellow-500/10',
  danger: 'border-red-500/50 shadow-red-500/10',
  success: 'border-green-500/50 shadow-green-500/10',
  info: 'border-blue-500/50 shadow-blue-500/10',
};

const cardPaddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
  xl: 'p-6',
};

const DataCard = memo(function DataCard({
  title,
  titleAction,
  icon,
  footer,
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  className = '',
  ...props
}: DataCardProps) {
  const baseClasses = 'bg-slate-800 rounded-lg border transition-all duration-200';
  const variantClass = cardVariantClasses[variant];
  const paddingClass = cardPaddingClasses[padding];
  const interactiveClass = interactive ? 'hover:border-slate-600 hover:shadow-md cursor-pointer' : '';

  return (
    <div className={`${baseClasses} ${variantClass} ${paddingClass} ${interactiveClass} ${className}`} {...props}>
      {(title || icon || titleAction) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            {title && <h3 className="font-semibold text-white">{title}</h3>}
          </div>
          {titleAction && <div>{titleAction}</div>}
        </div>
      )}
      {children}
      {footer && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          {footer}
        </div>
      )}
    </div>
  );
});

export default DataCard;

// Stat display component for numerical data
interface StatDisplayProps {
  value: number | string;
  label?: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const statSizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

export const StatDisplay = memo(function StatDisplay({
  value,
  label,
  unit,
  trend,
  trendValue,
  color = 'text-white',
  size = 'md',
}: StatDisplayProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={`${statSizeClasses[size]} font-bold ${color}`}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
        {trend && (
          <span className={`text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            {trendValue !== undefined && ` ${trendValue > 0 ? '+' : ''}${trendValue.toFixed(0)}%`}
          </span>
        )}
      </div>
      {label && <p className="text-sm text-slate-400 mt-1">{label}</p>}
    </div>
  );
});

// Progress bar component
interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const progressHeightClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const ProgressBar = memo(function ProgressBar({
  value,
  max,
  color = '#3b82f6',
  label,
  showValue = false,
  height = 'md',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span className="text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-slate-300">
              {value.toFixed(0)} / {max.toFixed(0)}
            </span>
          )}
        </div>
      )}
      <div className={`${progressHeightClasses[height]} bg-slate-900 rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
});

// Status badge component
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: ReactNode;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const statusBadgeClasses = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  neutral: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const statusSizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export const StatusBadge = memo(function StatusBadge({
  status,
  children,
  size = 'sm',
  pulse = false,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${statusBadgeClasses[status]} ${statusSizeClasses[size]} ${pulse ? 'animate-pulse' : ''}`}
    >
      {children}
    </span>
  );
});
