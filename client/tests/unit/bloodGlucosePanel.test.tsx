// ============================================================================
// METABOLIC SIMULATOR - BLOOD GLUCOSE PANEL UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BloodGlucosePanel from '../../src/components/dashboard/BloodGlucosePanel';
import type { BloodGlucoseData } from '@metabol-sim/shared';

// Mock the store module
vi.mock('../../src/state/store', () => ({
  useSimulationStore: vi.fn(),
}));

// Import after mocking
import { useSimulationStore } from '../../src/state/store';

describe('BloodGlucosePanel Component', () => {
  const defaultBloodGlucose: BloodGlucoseData = {
    currentValue: 85,
    baseline: 85,
    peak: 85,
    trough: 85,
    trend: 0,
    sensitivity: 1,
    lastMealTime: undefined,
    lastMealGlycemicLoad: 0,
    units: 'mg/dL',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to mock the store with proper selector support
  function mockStoreWithBloodGlucose(bloodGlucose: BloodGlucoseData | undefined) {
    vi.mocked(useSimulationStore).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        // Simulate the selector being called with mock state
        const mockState = {
          state: {
            energy: {
              bloodGlucose,
            },
          },
        };
        return selector(mockState);
      }
      return bloodGlucose;
    });
  }

  it('should render no data message when blood glucose is undefined', () => {
    mockStoreWithBloodGlucose(undefined);

    const { container } = render(<BloodGlucosePanel />);

    expect(screen.getByText('No glucose data available')).toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });

  it('should display the blood glucose value', () => {
    mockStoreWithBloodGlucose(defaultBloodGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('should display baseline value', () => {
    mockStoreWithBloodGlucose(defaultBloodGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText(/Baseline: 85/)).toBeInTheDocument();
  });

  it('should show normal status when value is between 70 and 100', () => {
    mockStoreWithBloodGlucose(defaultBloodGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Normal')).toBeInTheDocument();
    // The educational text contains "Optimal range"
    expect(screen.getByText((content) => content.includes('Optimal range'))).toBeInTheDocument();
  });

  it('should show hypoglycemia status when value is below 70', () => {
    const lowGlucose: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 55 };
    mockStoreWithBloodGlucose(lowGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Hypoglycemia')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Low blood sugar'))).toBeInTheDocument();
  });

  it('should show elevated status when value is between 100 and 140', () => {
    const elevatedGlucose: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 120 };
    mockStoreWithBloodGlucose(elevatedGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Elevated')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Above optimal'))).toBeInTheDocument();
  });

  it('should show high status when value is between 140 and 200', () => {
    const highGlucose: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 160 };
    mockStoreWithBloodGlucose(highGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Impaired fasting glucose'))).toBeInTheDocument();
  });

  it('should show very high status when value is above 200', () => {
    const veryHighGlucose: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 250 };
    mockStoreWithBloodGlucose(veryHighGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Very High')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Diabetic range'))).toBeInTheDocument();
  });

  it('should display rising trend icon when trend is 1', () => {
    const risingGlucose: BloodGlucoseData = { ...defaultBloodGlucose, trend: 1 };
    mockStoreWithBloodGlucose(risingGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Rising')).toBeInTheDocument();
    expect(screen.getByText('↗')).toBeInTheDocument();
  });

  it('should display falling trend icon when trend is -1', () => {
    const fallingGlucose: BloodGlucoseData = { ...defaultBloodGlucose, trend: -1 };
    mockStoreWithBloodGlucose(fallingGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Falling')).toBeInTheDocument();
    expect(screen.getByText('↘')).toBeInTheDocument();
  });

  it('should display stable trend when trend is 0', () => {
    mockStoreWithBloodGlucose(defaultBloodGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  it('should show last meal information when available', () => {
    const withMeal: BloodGlucoseData = {
      ...defaultBloodGlucose,
      lastMealTime: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
      lastMealGlycemicLoad: 25,
    };
    mockStoreWithBloodGlucose(withMeal);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Last Meal')).toBeInTheDocument();
    expect(screen.getByText('30m ago')).toBeInTheDocument();
    expect(screen.getByText('Glycemic Load')).toBeInTheDocument();
  });

  it('should show hours ago for meals over 60 minutes', () => {
    const withMeal: BloodGlucoseData = {
      ...defaultBloodGlucose,
      lastMealTime: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
      lastMealGlycemicLoad: 25,
    };
    mockStoreWithBloodGlucose(withMeal);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('should color glycemic load based on value - high', () => {
    const highLoad: BloodGlucoseData = {
      ...defaultBloodGlucose,
      lastMealTime: new Date().toISOString(),
      lastMealGlycemicLoad: 35,
    };
    mockStoreWithBloodGlucose(highLoad);

    render(<BloodGlucosePanel />);

    const loadElement = screen.getByText('35');
    expect(loadElement).toHaveClass('text-orange-400');
  });

  it('should color glycemic load based on value - medium', () => {
    const mediumLoad: BloodGlucoseData = {
      ...defaultBloodGlucose,
      lastMealTime: new Date().toISOString(),
      lastMealGlycemicLoad: 20,
    };
    mockStoreWithBloodGlucose(mediumLoad);

    render(<BloodGlucosePanel />);

    const loadElement = screen.getByText('20');
    expect(loadElement).toHaveClass('text-yellow-400');
  });

  it('should color glycemic load based on value - low', () => {
    const lowLoad: BloodGlucoseData = {
      ...defaultBloodGlucose,
      lastMealTime: new Date().toISOString(),
      lastMealGlycemicLoad: 10,
    };
    mockStoreWithBloodGlucose(lowLoad);

    render(<BloodGlucosePanel />);

    const loadElement = screen.getByText('10');
    expect(loadElement).toHaveClass('text-green-400');
  });

  it('should show appropriate educational message for normal zone', () => {
    mockStoreWithBloodGlucose(defaultBloodGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText(/Maintaining stable blood sugar/)).toBeInTheDocument();
  });

  it('should show appropriate educational message for elevated zone', () => {
    const elevatedGlucose: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 120 };
    mockStoreWithBloodGlucose(elevatedGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText(/lower glycemic index foods/)).toBeInTheDocument();
  });

  it('should show appropriate educational message for hypoglycemia', () => {
    const lowGlucose: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 55 };
    mockStoreWithBloodGlucose(lowGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText(/balanced snack to restore energy/)).toBeInTheDocument();
  });

  it('should show appropriate educational message for high zone', () => {
    const highGlucose: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 160 };
    mockStoreWithBloodGlucose(highGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText(/activity to help normalize levels/)).toBeInTheDocument();
  });

  it('should render the glucose zones visualization bar', () => {
    mockStoreWithBloodGlucose(defaultBloodGlucose);

    render(<BloodGlucosePanel />);

    // Check for scale markers
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('should display the component title', () => {
    mockStoreWithBloodGlucose(defaultBloodGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Blood Glucose')).toBeInTheDocument();
  });

  it('should display units', () => {
    mockStoreWithBloodGlucose(defaultBloodGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('mg/dL')).toBeInTheDocument();
  });
});

describe('BloodGlucosePanel Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockStoreWithBloodGlucose(bloodGlucose: BloodGlucoseData | undefined) {
    vi.mocked(useSimulationStore).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const mockState = {
          state: {
            energy: {
              bloodGlucose,
            },
          },
        };
        return selector(mockState);
      }
      return bloodGlucose;
    });
  }

  const defaultBloodGlucose: BloodGlucoseData = {
    currentValue: 85,
    baseline: 85,
    peak: 85,
    trough: 85,
    trend: 0,
    sensitivity: 1,
    lastMealTime: undefined,
    lastMealGlycemicLoad: 0,
    units: 'mg/dL',
  };

  it('should handle extreme low values gracefully', () => {
    const extremeLow: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 20 };
    mockStoreWithBloodGlucose(extremeLow);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Hypoglycemia')).toBeInTheDocument();
  });

  it('should handle extreme high values gracefully', () => {
    const extremeHigh: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 500 };
    mockStoreWithBloodGlucose(extremeHigh);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Very High')).toBeInTheDocument();
  });

  it('should handle boundary values between zones - 70', () => {
    const boundaryGlucose: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 70 };
    mockStoreWithBloodGlucose(boundaryGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('should handle boundary values between zones - 100', () => {
    const boundaryGlucose: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 100 };
    mockStoreWithBloodGlucose(boundaryGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Elevated')).toBeInTheDocument();
  });

  it('should handle boundary values between zones - 140', () => {
    const boundaryGlucose: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 140 };
    mockStoreWithBloodGlucose(boundaryGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should handle boundary values between zones - 200', () => {
    const boundaryGlucose: BloodGlucoseData = { ...defaultBloodGlucose, currentValue: 200 };
    mockStoreWithBloodGlucose(boundaryGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.getByText('Very High')).toBeInTheDocument();
  });

  it('should not show meal info when lastMealTime is undefined', () => {
    mockStoreWithBloodGlucose(defaultBloodGlucose);

    render(<BloodGlucosePanel />);

    expect(screen.queryByText('Last Meal')).not.toBeInTheDocument();
  });
});
