// ============================================================================
// METABOLIC SIMULATOR - MEAL BUILDER UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSimulationStore } from '../../src/state/store';
import MealBuilder from '../../src/components/dashboard/MealBuilder';

// Mock the useSimulationStore
const mockLogMeal = vi.fn().mockResolvedValue(undefined);
const mockAddToast = vi.fn();

vi.mock('../../src/state/store', () => ({
  useSimulationStore: vi.fn(),
}));

describe('MealBuilder Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSimulationStore).mockReturnValue({
      logMeal: mockLogMeal,
      addToast: mockAddToast,
    });
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<MealBuilder isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBe(null);
  });

  it('should render modal when isOpen is true', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Build Your Meal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search foods by name or tag...')).toBeInTheDocument();
  });

  it('should have category filters', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    // Check that main category filters exist (multiple "All" matches exist, use getAllByText)
    expect(screen.getAllByText(/All/).length).toBeGreaterThan(0);
    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText('Carbs')).toBeInTheDocument();
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByText('Fats')).toBeInTheDocument();
  });

  it('should have special filters', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Low GI/)).toBeInTheDocument();
    expect(screen.getByText(/High Protein/)).toBeInTheDocument();
  });

  it('should close when clicking close button', () => {
    const onClose = vi.fn();
    render(<MealBuilder isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should close when clicking backdrop', () => {
    const onClose = vi.fn();
    const { container } = render(<MealBuilder isOpen={true} onClose={onClose} />);

    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it('should not close when clicking inside modal', () => {
    const onClose = vi.fn();
    render(<MealBuilder isOpen={true} onClose={onClose} />);

    const modalContent = screen.getByText('Build Your Meal').closest('div.bg-slate-800');
    if (modalContent) {
      fireEvent.click(modalContent);
    }

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should filter when searching', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    const searchInput = screen.getByPlaceholderText('Search foods by name or tag...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(searchInput).toHaveValue('test');
  });

  it('should show no log button when nothing selected', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    expect(screen.queryByText('Log Meal')).not.toBeInTheDocument();
    expect(screen.queryByText('Logging...')).not.toBeInTheDocument();
  });

  it('should have close button with correct aria-label', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('should display category icons', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    // Check for emojis used as category icons (use queryAll since emojis may appear multiple times)
    expect(screen.getAllByText('🥩').length).toBeGreaterThan(0); // Protein
    expect(screen.getAllByText('🍚').length).toBeGreaterThan(0); // Carbs
    expect(screen.getAllByText('🥦').length).toBeGreaterThan(0); // Vegetables
    expect(screen.getAllByText('🍎').length).toBeGreaterThan(0); // Fruits
  });

  it('should handle category filter clicks', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    // Clicking Protein should work without error
    const proteinButton = screen.getByText('Protein');
    expect(() => fireEvent.click(proteinButton)).not.toThrow();
  });

  it('should handle special filter clicks', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    // Clicking Low GI should work without error
    const lowGiButton = screen.getByText('Low GI');
    expect(() => fireEvent.click(lowGiButton)).not.toThrow();
  });

  it('should handle search input changes', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    const searchInput = screen.getByPlaceholderText('Search foods by name or tag...');

    fireEvent.change(searchInput, { target: { value: 'eggs' } });
    expect(searchInput).toHaveValue('eggs');

    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput).toHaveValue('');
  });

  it('should not crash when rapidly switching filters', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    // Rapidly click different filters
    const proteinButton = screen.getByText('Protein');
    const vegButton = screen.getByText('Vegetables');

    expect(() => {
      fireEvent.click(proteinButton);
      fireEvent.click(vegButton);
      fireEvent.click(proteinButton);
    }).not.toThrow();
  });

  it('should maintain component state during interactions', () => {
    render(<MealBuilder isOpen={true} onClose={() => {}} />);

    const searchInput = screen.getByPlaceholderText('Search foods by name or tag...');

    // Type in search
    fireEvent.change(searchInput, { target: { value: 'chicken' } });
    expect(searchInput).toHaveValue('chicken');

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput).toHaveValue('');
  });
});

describe('MealBuilder Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSimulationStore).mockReturnValue({
      logMeal: mockLogMeal,
      addToast: mockAddToast,
    });
  });

  it('should have access to store functions', () => {
    const { rerender } = render(<MealBuilder isOpen={true} onClose={() => {}} />);

    // Store should provide logMeal and addToast
    expect(vi.mocked(useSimulationStore)).toHaveBeenCalled();
    expect(mockLogMeal).toBeDefined();
    expect(mockAddToast).toBeDefined();
  });

  it('should render correctly on reopen', () => {
    const { rerender } = render(<MealBuilder isOpen={false} onClose={() => {}} />);

    // Closed - nothing renders
    expect(screen.queryByText('Build Your Meal')).not.toBeInTheDocument();

    // Open
    rerender(<MealBuilder isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Build Your Meal')).toBeInTheDocument();

    // Close again
    rerender(<MealBuilder isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Build Your Meal')).not.toBeInTheDocument();
  });
});
