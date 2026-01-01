// ============================================================================
// METABOLIC SIMULATOR - SKELETON LOADING COMPONENT
// ============================================================================

import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  count?: number;
}

// Animation keyframes defined as CSS class
const shimmerAnimation = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const Skeleton = memo(function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%]';

  const variantClasses: Record<typeof variant, string> = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    rounded: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={Object.keys(style).length > 0 ? style : undefined}
      aria-hidden="true"
    />
  ));

  return (
    <>
      <style>{shimmerAnimation}</style>
      {skeletons.length === 1 ? skeletons[0] : <div className="space-y-2">{skeletons}</div>}
    </>
  );
});

// Pre-built skeleton patterns for common layouts
export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} />
        </div>
      </div>
      <Skeleton count={3} height={16} className="mt-4" />
    </div>
  );
});

export const ProfileCardSkeleton = memo(function ProfileCardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <Skeleton width={120} height={24} className="mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton width="40%" height={16} />
            <Skeleton width={80} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
});

export const HormonePanelSkeleton = memo(function HormonePanelSkeleton() {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={100} height={20} />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      <Skeleton width="100%" height={8} className="mb-2" />
      <Skeleton width="70%" height={8} />
    </div>
  );
});

export const ChartSkeleton = memo(function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
      <Skeleton width={150} height={20} className="mb-4" />
      <div className="flex items-end justify-between gap-2 h-40" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            className="flex-1"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
});

export const TableSkeleton = memo(function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <Skeleton width={150} height={24} />
      </div>
      <div className="divide-y divide-slate-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton width="40%" height={16} />
              <Skeleton width="60%" height={14} />
            </div>
            <Skeleton width={80} height={32} variant="rounded" />
          </div>
        ))}
      </div>
    </div>
  );
});

export { Skeleton };
export default Skeleton;
