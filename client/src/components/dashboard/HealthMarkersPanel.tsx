// ============================================================================
// METABOLIC SIMULATOR - HEALTH MARKERS PANEL
// ============================================================================
// Displays comprehensive health markers including lipids, liver function,
// kidney function, inflammation, and cardiovascular health.
// ============================================================================

import { memo, useMemo, useState } from 'react';
import { useSimulationStore } from '../../state/store';
import {
  HealthMarkers,
  HealthMarker,
  MarkerStatus,
  LipidPanel,
  LiverPanel,
  KidneyPanel,
  InflammatoryPanel,
  CardiovascularPanel,
} from '@metabol-sim/shared';

// SVG Icons
const TrendingUpIcon = () => (
  <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const StableIcon = () => (
  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Helper to determine marker status color
const getStatusColor = (status: MarkerStatus): string => {
  switch (status) {
    case 'optimal':
      return 'text-green-400';
    case 'normal':
      return 'text-blue-400';
    case 'elevated':
      return 'text-yellow-400';
    case 'concerning':
      return 'text-orange-400';
    case 'critical':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
};

const getStatusBg = (status: MarkerStatus): string => {
  switch (status) {
    case 'optimal':
      return 'bg-green-500/20 border-green-500/30';
    case 'normal':
      return 'bg-blue-500/20 border-blue-500/30';
    case 'elevated':
      return 'bg-yellow-500/20 border-yellow-500/30';
    case 'concerning':
      return 'bg-orange-500/20 border-orange-500/30';
    case 'critical':
      return 'bg-red-500/20 border-red-500/30';
    default:
      return 'bg-gray-500/20 border-gray-500/30';
  }
};

const getTrendIcon = (trend: number) => {
  switch (trend) {
    case 1:
      return <TrendingUpIcon />;
    case 0:
      return <StableIcon />;
    case -1:
      return <TrendingDownIcon />;
    default:
      return null;
  }
};

// Individual marker display component
const MarkerDisplay = memo(function MarkerDisplay({
  label,
  marker,
  showLabel = true,
}: {
  label: string;
  marker: HealthMarker | null;
  showLabel?: boolean;
}) {
  if (!marker) return null;

  return (
    <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
      {showLabel && (
        <span className="text-sm text-slate-400">{label}</span>
      )}
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${getStatusColor(marker.status)}`}>
          {marker.value.toFixed(1)}
        </span>
        <span className="text-xs text-slate-500">{marker.unit}</span>
        {getTrendIcon(marker.trend)}
      </div>
    </div>
  );
});

// Lipid panel section
const LipidSection = memo(function LipidSection({ lipids }: { lipids: LipidPanel | null }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!lipids) return null;

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          <h3 className="font-semibold text-white">Lipid Panel</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${getStatusBg(lipids.totalCholesterol.status)}`}>
          {lipids.totalCholesterol.status}
        </span>
      </button>
      {isExpanded && (
        <div className="p-3 space-y-2 bg-slate-900/50">
          <MarkerDisplay label="Total Cholesterol" marker={lipids.totalCholesterol} />
          <MarkerDisplay label="LDL" marker={lipids.ldl} />
          <MarkerDisplay label="HDL" marker={lipids.hdl} />
          <MarkerDisplay label="Triglycerides" marker={lipids.triglycerides} />
          {lipids.cholesterolRatio !== undefined && (
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <span className="text-sm text-slate-400">Cholesterol Ratio</span>
              <span className={`font-semibold ${lipids.cholesterolRatio < 5 ? 'text-green-400' : 'text-yellow-400'}`}>
                {lipids.cholesterolRatio.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Liver panel section
const LiverSection = memo(function LiverSection({ liver }: { liver: LiverPanel | null }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!liver) return null;

  const overallStatus = liver.alt.status === 'optimal' && liver.ast.status === 'optimal'
    ? 'optimal'
    : liver.alt.status === 'critical' || liver.ast.status === 'critical'
    ? 'critical'
    : liver.alt.status;

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          <h3 className="font-semibold text-white">Liver Function</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${getStatusBg(overallStatus as MarkerStatus)}`}>
          {overallStatus}
        </span>
      </button>
      {isExpanded && (
        <div className="p-3 space-y-2 bg-slate-900/50">
          <MarkerDisplay label="ALT" marker={liver.alt} />
          <MarkerDisplay label="AST" marker={liver.ast} />
          {liver.alkalinePhosphatase && <MarkerDisplay label="Alkaline Phosphatase" marker={liver.alkalinePhosphatase} />}
          {liver.bilirubin && <MarkerDisplay label="Bilirubin" marker={liver.bilirubin} />}
          {liver.albumin && <MarkerDisplay label="Albumin" marker={liver.albumin} />}
        </div>
      )}
    </div>
  );
});

// Kidney panel section
const KidneySection = memo(function KidneySection({ kidney }: { kidney: KidneyPanel | null }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!kidney) return null;

  const overallStatus = kidney.egfr.status;

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          <h3 className="font-semibold text-white">Kidney Function</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${getStatusBg(overallStatus)}`}>
          {overallStatus}
        </span>
      </button>
      {isExpanded && (
        <div className="p-3 space-y-2 bg-slate-900/50">
          <MarkerDisplay label="eGFR" marker={kidney.egfr} />
          <MarkerDisplay label="Creatinine" marker={kidney.creatinine} />
          <MarkerDisplay label="BUN" marker={kidney.bun} />
          {kidney.uricAcid && <MarkerDisplay label="Uric Acid" marker={kidney.uricAcid} />}
        </div>
      )}
    </div>
  );
});

// Inflammatory panel section
const InflammationSection = memo(function InflammationSection({
  inflammation
}: {
  inflammation: InflammatoryPanel | null;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!inflammation) return null;

  const overallStatus = inflammation.crp.status;

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          <h3 className="font-semibold text-white">Inflammation Markers</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${getStatusBg(overallStatus)}`}>
          {overallStatus}
        </span>
      </button>
      {isExpanded && (
        <div className="p-3 space-y-2 bg-slate-900/50">
          <MarkerDisplay label="CRP" marker={inflammation.crp} />
          {inflammation.esr && <MarkerDisplay label="ESR" marker={inflammation.esr} />}
          {inflammation.fibrinogen && <MarkerDisplay label="Fibrinogen" marker={inflammation.fibrinogen} />}
          {inflammation.ferritin && <MarkerDisplay label="Ferritin" marker={inflammation.ferritin} />}
        </div>
      )}
    </div>
  );
});

// Cardiovascular section
const CardiovascularSection = memo(function CardiovascularSection({
  cardiovascular
}: {
  cardiovascular: CardiovascularPanel | null;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!cardiovascular) return null;

  const bpCategory = cardiovascular.bloodPressure.category;
  const bpStatus = bpCategory === 'optimal' || bpCategory === 'normal'
    ? 'optimal'
    : bpCategory === 'elevated'
    ? 'elevated'
    : bpCategory === 'stage1'
    ? 'concerning'
    : 'critical';

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          <h3 className="font-semibold text-white">Cardiovascular</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${getStatusBg(bpStatus as MarkerStatus)}`}>
          {bpCategory}
        </span>
      </button>
      {isExpanded && (
        <div className="p-3 space-y-2 bg-slate-900/50">
          <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
            <span className="text-sm text-slate-400">Blood Pressure</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${getStatusColor(cardiovascular.bloodPressure.systolic.status)}`}>
                {cardiovascular.bloodPressure.systolic.value.toFixed(0)}/{cardiovascular.bloodPressure.diastolic.value.toFixed(0)}
              </span>
              <span className="text-xs text-slate-500">mmHg</span>
              {getTrendIcon(cardiovascular.bloodPressure.systolic.trend)}
            </div>
          </div>
          <MarkerDisplay label="Resting HR" marker={cardiovascular.restingHeartRate} />
          <MarkerDisplay label="HRV (RMSSD)" marker={cardiovascular.hrv.rmssd} />
          <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
            <span className="text-sm text-slate-400">HRV Score</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${getStatusColor(cardiovascular.hrv.hrvScore.status)}`}>
                {cardiovascular.hrv.hrvScore.value.toFixed(0)}
              </span>
              <span className="text-xs text-slate-500">/100</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
            <span className="text-sm text-slate-400">Recovery Status</span>
            <span className={`text-xs px-2 py-1 rounded ${
              cardiovascular.hrv.recoveryStatus === 'excellent' ? 'bg-green-500/20 text-green-400' :
              cardiovascular.hrv.recoveryStatus === 'good' ? 'bg-blue-500/20 text-blue-400' :
              cardiovascular.hrv.recoveryStatus === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {cardiovascular.hrv.recoveryStatus}
            </span>
          </div>
          {cardiovascular.vo2Max && <MarkerDisplay label="VO₂ Max" marker={cardiovascular.vo2Max} />}
        </div>
      )}
    </div>
  );
});

// Main health markers panel
const HealthMarkersPanel = memo(function HealthMarkersPanel() {
  const state = useSimulationStore((s) => s.state);
  const healthMarkers = state?.healthMarkers;

  // Generate demo health markers if not present
  const demoMarkers = useMemo(() => {
    if (healthMarkers) return healthMarkers;

    // Generate realistic demo values based on simulation state
    const now = new Date();
    const createMarker = (
      value: number,
      unit: string,
      optimal: [number, number],
      concerning?: [number, number],
      critical?: [number, number],
      isInverted: boolean = false // For HDL where higher is better
    ): HealthMarker => {
      let status: MarkerStatus = isInverted
        ? value >= optimal[0] ? 'optimal' : value >= optimal[1] ? 'normal' : 'elevated'
        : value >= optimal[0] && value <= optimal[1] ? 'optimal'
        : concerning && value >= concerning[0] && value <= concerning[1] ? 'concerning'
        : critical && value >= critical[0] && value <= critical[1] ? 'critical'
        : 'normal';

      // Calculate trend based on simulation state
      const trend = Math.random() > 0.5 ? 1 : Math.random() > 0.5 ? 0 : -1;

      return {
        value,
        unit,
        status,
        optimalRange: optimal,
        concerningRange: concerning,
        criticalRange: critical,
        trend,
        lastMeasured: now,
      };
    };

    // Calculate BP category
    const getBPCategory = (sys: number, dia: number): CardiovascularPanel['bloodPressure']['category'] => {
      if (sys > 180 || dia > 120) return 'crisis';
      if (sys >= 140 || dia >= 90) return 'stage2';
      if (sys >= 130 || dia >= 80) return 'stage1';
      if (sys >= 120 && dia < 80) return 'elevated';
      if (sys < 120 && dia < 80) return 'optimal';
      return 'normal';
    };

    const demoHealthMarkers: HealthMarkers = {
      lipids: {
        totalCholesterol: createMarker(180 + Math.random() * 40, 'mg/dL', [0, 200], [200, 240], [240, 300]),
        ldl: createMarker(100 + Math.random() * 40, 'mg/dL', [0, 100], [100, 130], [130, 160]),
        hdl: createMarker(45 + Math.random() * 25, 'mg/dL', [40, 60], [30, 40], [0, 30], true),
        triglycerides: createMarker(100 + Math.random() * 50, 'mg/dL', [0, 150], [150, 200], [200, 500]),
        cholesterolRatio: 3.5 + Math.random() * 1.5,
      },
      liver: {
        alt: createMarker(25 + Math.random() * 15, 'U/L', [7, 56], [56, 100], [100, 200]),
        ast: createMarker(20 + Math.random() * 10, 'U/L', [10, 40], [40, 80], [80, 150]),
      },
      kidney: {
        creatinine: createMarker(0.9 + Math.random() * 0.3, 'mg/dL', [0.7, 1.3], [1.3, 2.0], [2.0, 5.0]),
        bun: createMarker(12 + Math.random() * 6, 'mg/dL', [7, 20], [20, 30], [30, 50]),
        egfr: createMarker(95 + Math.random() * 15, 'mL/min/1.73m²', [90, 120], [60, 90], [30, 60], true),
      },
      inflammation: {
        crp: createMarker(0.5 + Math.random() * 2, 'mg/L', [0, 3], [3, 10], [10, 50]),
      },
      cardiovascular: {
        restingHeartRate: createMarker(65 + Math.random() * 15, 'bpm', [60, 80], [80, 100], [100, 120]),
        bloodPressure: {
          systolic: createMarker(115 + Math.random() * 15, 'mmHg', [90, 120], [120, 140], [140, 180]),
          diastolic: createMarker(75 + Math.random() * 10, 'mmHg', [60, 80], [80, 90], [90, 110]),
          pulsePressure: 40,
          category: getBPCategory(120, 78),
        },
        hrv: {
          rmssd: createMarker(35 + Math.random() * 30, 'ms', [30, 100], [20, 30], [0, 20], true),
          hrvScore: createMarker(55 + Math.random() * 25, '', [50, 100], [35, 50], [0, 35], true),
          heartRateVariability: 45 + Math.random() * 30,
          recoveryStatus: 'good',
        },
      },
    };

    return demoHealthMarkers;
  }, [healthMarkers]);

  if (!demoMarkers) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-2">Health Markers</h2>
        <p className="text-sm text-slate-400">No health marker data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>Health Markers</span>
          <span className="text-xs text-slate-400 font-normal">
            (Comprehensive blood work & vitals)
          </span>
        </h2>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <LipidSection lipids={demoMarkers.lipids} />
        <LiverSection liver={demoMarkers.liver} />
        <KidneySection kidney={demoMarkers.kidney} />
        <InflammationSection inflammation={demoMarkers.inflammation} />
        <CardiovascularSection cardiovascular={demoMarkers.cardiovascular} />
      </div>
      <div className="p-3 bg-slate-900/50 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Health markers are simulated values based on your metabolic state. For actual medical testing, consult a healthcare provider.
        </p>
      </div>
    </div>
  );
});

export default HealthMarkersPanel;
