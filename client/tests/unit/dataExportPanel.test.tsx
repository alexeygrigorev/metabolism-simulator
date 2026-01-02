// ============================================================================
// METABOLIC SIMULATOR - DATA EXPORT PANEL COMPONENT UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataExportPanel from '../../src/components/dashboard/DataExportPanel';
import { useDataExport } from '../../src/hooks/useDataExport';
import { useSimulationStore } from '../../src/state/store';

// Mock the hooks
vi.mock('../../src/hooks/useDataExport');
vi.mock('../../src/state/store');

const mockUseDataExport = vi.mocked(useDataExport);
const mockUseSimulationStore = vi.mocked(useSimulationStore);

describe('DataExportPanel Component', () => {
  const mockExportData = vi.fn();
  const mockExportToClipboard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for useDataExport
    mockUseDataExport.mockReturnValue({
      exportData: mockExportData,
      exportToClipboard: mockExportToClipboard,
      hasData: true,
    });

    // Default mock for simulation store
    mockUseSimulationStore.mockReturnValue({
      state: {
        user: { age: 30, weight: 70, height: 175, bodyFatPercentage: 0.15, activityLevel: 1.2 },
        recentMeals: [{ name: 'Test Meal', totalMacros: { carbohydrates: 50, proteins: 30, fats: 10 } }],
        recentExercises: [{ name: 'Test Exercise' }],
        recentSleep: [{ duration: 8 }],
      },
    } as unknown as ReturnType<typeof useSimulationStore>);
  });

  describe('Rendering', () => {
    it('should render the data export panel', () => {
      const { container } = render(<DataExportPanel />);
      expect(screen.getByText('Data Export')).toBeInTheDocument();
    });

    it('should show available data counts', () => {
      render(<DataExportPanel />);
      expect(screen.getByText(/1 meals/)).toBeInTheDocument();
      expect(screen.getByText(/1 exercises/)).toBeInTheDocument();
      expect(screen.getByText(/1 sleep logs/)).toBeInTheDocument();
    });

    it('should render all scope options', () => {
      render(<DataExportPanel />);
      expect(screen.getByText('All Data')).toBeInTheDocument();
      expect(screen.getByText('Meals')).toBeInTheDocument();
      expect(screen.getByText('Exercises')).toBeInTheDocument();
      expect(screen.getByText('Sleep')).toBeInTheDocument();
      expect(screen.getByText('Hormones')).toBeInTheDocument();
      expect(screen.getByText('Energy')).toBeInTheDocument();
    });

    it('should render format options', () => {
      render(<DataExportPanel />);
      expect(screen.getByText('JSON')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    it('should render date range presets', () => {
      render(<DataExportPanel />);
      expect(screen.getByText('All Time')).toBeInTheDocument();
      expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
      expect(screen.getByText('Last 90 Days')).toBeInTheDocument();
    });

    it('should render export button', () => {
      render(<DataExportPanel />);
      expect(screen.getByText('Download JSON')).toBeInTheDocument();
    });

    it('should render copy to clipboard button', () => {
      const { container } = render(<DataExportPanel />);
      expect(container.textContent).toContain('📋');
    });
  });

  describe('Scope Selection', () => {
    it('should select scope option on click', () => {
      render(<DataExportPanel />);

      const mealsButton = screen.getByText('Meals').closest('button');
      fireEvent.click(mealsButton!);

      expect(screen.getByText('Meals').closest('button')).toHaveClass('border-blue-500');
    });

    it('should highlight selected scope', () => {
      render(<DataExportPanel />);

      const allDataButton = screen.getByText('All Data').closest('button');
      expect(allDataButton).toHaveClass('border-blue-500');
    });
  });

  describe('Format Selection', () => {
    it('should select format option on click', () => {
      render(<DataExportPanel />);

      const csvButton = screen.getByText('CSV').closest('button');
      fireEvent.click(csvButton!);

      expect(csvButton).toHaveClass('border-blue-500');
      expect(screen.getByText('Download CSV')).toBeInTheDocument();
    });

    it('should update download button text when format changes', () => {
      render(<DataExportPanel />);

      const csvButton = screen.getByText('CSV').closest('button');
      fireEvent.click(csvButton!);

      expect(screen.getByText('Download CSV')).toBeInTheDocument();
    });
  });

  describe('Date Range Selection', () => {
    it('should select date preset on click', () => {
      render(<DataExportPanel />);

      const sevenDaysButton = screen.getByText('Last 7 Days');
      fireEvent.click(sevenDaysButton);

      expect(sevenDaysButton.closest('button')).toHaveClass('border-blue-500');
    });

    it('should show All Time as default', () => {
      render(<DataExportPanel />);

      const allTimeButton = screen.getByText('All Time').closest('button');
      expect(allTimeButton).toHaveClass('border-blue-500');
    });
  });

  describe('Export Functionality', () => {
    it('should call exportData when download button is clicked', async () => {
      render(<DataExportPanel />);

      const downloadButton = screen.getByText('Download JSON');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith({
          format: 'json',
          scope: 'all',
          startDate: undefined,
          endDate: expect.any(Date),
        });
      });
    });

    it('should show loading state while exporting', async () => {
      mockExportData.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<DataExportPanel />);

      const downloadButton = screen.getByText('Download JSON');
      fireEvent.click(downloadButton);

      expect(screen.getByText('Exporting...')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByText('Exporting...')).not.toBeInTheDocument();
      });
    });

    it('should show success message after export', async () => {
      mockExportData.mockResolvedValue(undefined);

      render(<DataExportPanel />);

      const downloadButton = screen.getByText('Download JSON');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText('Export successful!')).toBeInTheDocument();
      });
    });

    it('should respect selected date range when exporting', async () => {
      render(<DataExportPanel />);

      const sevenDaysButton = screen.getByText('Last 7 Days');
      fireEvent.click(sevenDaysButton);

      const downloadButton = screen.getByText('Download JSON');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith({
          format: 'json',
          scope: 'all',
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        });
      });
    });

    it('should respect selected scope when exporting', async () => {
      render(<DataExportPanel />);

      const mealsButton = screen.getByText('Meals').closest('button');
      fireEvent.click(mealsButton!);

      const downloadButton = screen.getByText('Download JSON');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith(
          expect.objectContaining({
            scope: 'meals',
          })
        );
      });
    });
  });

  describe('Copy to Clipboard', () => {
    it('should call exportToClipboard when copy button is clicked', async () => {
      mockExportToClipboard.mockResolvedValue(undefined);

      render(<DataExportPanel />);

      const copyButton = screen.getByTitle('Copy to clipboard');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockExportToClipboard).toHaveBeenCalled();
      });
    });

    it('should show success indicator after copy', async () => {
      mockExportToClipboard.mockResolvedValue(undefined);

      render(<DataExportPanel />);

      const copyButton = screen.getByTitle('Copy to clipboard');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Export successful!')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not render when no state exists', () => {
      mockUseSimulationStore.mockReturnValue({
        state: null,
      } as unknown as ReturnType<typeof useSimulationStore>);

      const { container } = render(<DataExportPanel />);
      expect(container.firstChild).toBeNull();
    });

    it('should disable buttons when hasData is false', () => {
      mockUseDataExport.mockReturnValue({
        exportData: mockExportData,
        exportToClipboard: mockExportToClipboard,
        hasData: false,
      });

      render(<DataExportPanel />);

      const downloadButton = screen.getByText('Download JSON').closest('button');
      expect(downloadButton).toBeDisabled();
    });

    it('should handle export errors gracefully', async () => {
      mockExportData.mockRejectedValue(new Error('Export failed'));

      render(<DataExportPanel />);

      const downloadButton = screen.getByText('Download JSON');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.queryByText('Exporting...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<DataExportPanel />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Data Export');
    });

    it('should have accessible labels for scope selection', () => {
      render(<DataExportPanel />);
      expect(screen.getByText('What to Export')).toBeInTheDocument();
    });

    it('should have accessible labels for format selection', () => {
      render(<DataExportPanel />);
      expect(screen.getByText('Format')).toBeInTheDocument();
    });

    it('should have accessible labels for date range', () => {
      render(<DataExportPanel />);
      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });
  });
});
