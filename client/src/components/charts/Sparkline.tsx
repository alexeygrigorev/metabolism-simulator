// ============================================================================
// METABOLIC SIMULATOR - SPARKLINE CHART COMPONENT
// ============================================================================

import { memo, useMemo } from 'react';

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

const Sparkline = memo(function Sparkline({ data, color, width = 60, height = 20 }: SparklineProps) {
  if (data.length < 2) return null;

  // Memoize points calculation to avoid recalculation on every render
  const points = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    return data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
  }, [data, width, height]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

export default Sparkline;
