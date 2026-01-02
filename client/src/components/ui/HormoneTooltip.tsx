// ============================================================================
// METABOLIC SIMULATOR - HORMONE TOOLTIP COMPONENT
// ============================================================================

import { useState, useRef, useEffect, memo } from 'react';
import { getHormoneEducation, getHormoneStatus, HormoneEducation } from '../../data/hormoneEducation';

interface HormoneTooltipProps {
  hormoneId: string;
  currentValue: number;
  children: React.ReactNode;
  showOnHover?: boolean;
  delay?: number;
}

// Category colors and icons
const getCategoryInfo = (category: string) => {
  switch (category) {
    case 'storage':
      return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '📦' };
    case 'mobilization':
      return { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '⚡' };
    case 'anabolic':
      return { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '💪' };
    case 'catabolic':
      return { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🔥' };
    case 'appetite':
      return { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '🍽️' };
    case 'stress':
      return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '😰' };
    default:
      return { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: '•' };
  }
};

const HormoneTooltip = memo(function HormoneTooltip({
  hormoneId,
  currentValue,
  children,
  showOnHover = true,
  delay = 300
}: HormoneTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipId = `tooltip-${hormoneId}`;

  const education = getHormoneEducation(hormoneId);
  const status = getHormoneStatus(currentValue, hormoneId);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = triggerRect.top - tooltipRect.height - 8;
      let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

      // Adjust if tooltip goes off the top
      if (top < 8) {
        top = triggerRect.bottom + 8;
      }

      // Adjust if tooltip goes off the right
      if (left + tooltipRect.width > viewportWidth - 8) {
        left = viewportWidth - tooltipRect.width - 8;
      }

      // Adjust if tooltip goes off the left
      if (left < 8) {
        left = 8;
      }

      setPosition({ top, left });
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (!showOnHover) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!showOnHover) {
      e.stopPropagation();
      setIsVisible(!isVisible);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsVisible(!isVisible);
    }
    if (e.key === 'Escape' && isVisible) {
      setIsVisible(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'low': return 'text-blue-400';
      case 'high': return 'text-red-400';
      default: return 'text-green-400';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'low': return 'Low';
      case 'high': return 'Elevated';
      default: return 'Optimal';
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'synergistic': return 'text-green-400';
      case 'antagonistic': return 'text-red-400';
      case 'permissive': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  if (!education) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="inline-block cursor-help"
        tabIndex={0}
        role="button"
        aria-label={`View ${education?.name || hormoneId} information`}
        aria-expanded={isVisible}
        aria-controls={tooltipId}
      >
        {children}
      </div>

      {isVisible && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsVisible(false)}
            aria-hidden="true"
          />
          <div
            id={tooltipId}
            ref={tooltipRef}
            role="dialog"
            aria-modal="false"
            aria-label={`${education?.name || hormoneId} information`}
            className="fixed z-50 w-80 max-h-[70vh] overflow-y-auto bg-slate-900 border border-slate-600 rounded-xl shadow-2xl p-4 text-sm"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-700">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white">
                    {education.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    {education.abbreviation}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${getCategoryInfo(education.category).color}`}>
                    {getCategoryInfo(education.category).icon} {education.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs font-medium ${getStatusColor()}`}>
                    {getStatusLabel()} ({currentValue} {education.unit})
                  </span>
                  <span className="text-xs text-slate-500">
                    Normal: {education.normalRange.min}-{education.normalRange.max} {education.unit}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-slate-400 hover:text-white transition-colors ml-2"
                aria-label="Close tooltip"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Description */}
            <p className="text-slate-300 mb-3">{education.description}</p>

            {/* Function */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-blue-400 mb-1">PRIMARY FUNCTION</h4>
              <p className="text-slate-400 text-xs">{education.function}</p>
            </div>

            {/* Factors That Increase/Decrease */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-green-500/10 rounded-lg p-2">
                <h4 className="text-xs font-semibold text-green-400 mb-1">INCREASES</h4>
                <ul className="text-xs text-slate-400 space-y-0.5">
                  {education.factorsThatIncrease.slice(0, 4).map((factor, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-green-500">+</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-500/10 rounded-lg p-2">
                <h4 className="text-xs font-semibold text-red-400 mb-1">DECREASES</h4>
                <ul className="text-xs text-slate-400 space-y-0.5">
                  {education.factorsThatDecrease.slice(0, 4).map((factor, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-red-500">-</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Optimal For */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-green-400 mb-1">OPTIMAL FOR</h4>
              <div className="flex flex-wrap gap-1">
                {education.optimalFor.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Symptoms Section - Expandable */}
            <div className="mb-3">
              <button
                onClick={() => setExpandedSection(expandedSection === 'symptoms' ? null : 'symptoms')}
                className="flex items-center justify-between w-full text-left mb-2"
                aria-expanded={expandedSection === 'symptoms'}
                aria-controls="symptoms-content"
              >
                <h4 className="text-xs font-semibold text-yellow-400">SYMPTOMS OF IMBALANCE</h4>
                <svg
                  className={`w-3 h-3 text-slate-400 transition-transform ${expandedSection === 'symptoms' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedSection === 'symptoms' && (
                <div id="symptoms-content" className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* High Symptoms */}
                  <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/20">
                    <h5 className="text-xs font-semibold text-red-400 mb-1">HIGH LEVELS</h5>
                    <ul className="text-xs text-slate-400 space-y-0.5">
                      {education.symptomsOfHigh.map((symptom, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-red-500">▲</span>
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Low Symptoms */}
                  <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
                    <h5 className="text-xs font-semibold text-blue-400 mb-1">LOW LEVELS</h5>
                    <ul className="text-xs text-slate-400 space-y-0.5">
                      {education.symptomsOfLow.map((symptom, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-blue-500">▼</span>
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Related Hormones */}
            {education.relatedHormones.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-purple-400 mb-1">RELATED HORMONES</h4>
                <div className="space-y-1">
                  {education.relatedHormones.map((rel, i) => (
                    <div key={i} className="text-xs bg-slate-800/50 rounded p-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getRelationshipColor(rel.relationship)}`}>
                          {rel.relationship}
                        </span>
                        <span className="text-white font-medium">{rel.hormone}</span>
                      </div>
                      <p className="text-slate-400 mt-0.5">{rel.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Facts */}
            <div className="flex gap-3 text-xs text-slate-500 border-t border-slate-700 pt-2">
              <div>
                <span className="text-slate-400">Peak:</span> {education.timeToPeak}
              </div>
              <div>
                <span className="text-slate-400">Half-life:</span> {education.halfLife}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
});

export default HormoneTooltip;
