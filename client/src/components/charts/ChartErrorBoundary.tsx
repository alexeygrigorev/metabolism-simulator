// ============================================================================
// METABOLIC SIMULATOR - CHART ERROR BOUNDARY
// ============================================================================

import { Component, ErrorInfo, ReactNode } from 'react';

interface ChartErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  chartName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically for chart components.
 * Displays a graceful fallback UI when a chart fails to render.
 */
export class ChartErrorBoundary extends Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ChartErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(`Chart Error Boundary caught an error (${this.props.chartName || 'Unknown Chart'}):`, error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Call error callback if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Chart Unavailable
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            {this.props.chartName
              ? `The ${this.props.chartName} chart encountered an error.`
              : 'This chart encountered an error and could not be displayed.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with chart error boundary
 */
export function withChartErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  chartName?: string
) {
  const WrappedComponent = (props: P) => (
    <ChartErrorBoundary chartName={chartName}>
      <Component {...props} />
    </ChartErrorBoundary>
  );

  WrappedComponent.displayName = `withChartErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ChartErrorBoundary;
