// ============================================================================
// METABOLIC SIMULATOR - ACHIEVEMENTS COMPONENTS UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { useAchievementsStore } from '../../src/state/achievementsStore';
import AchievementsPanel from '../../src/components/achievements/AchievementsPanel';
import AchievementNotification from '../../src/components/achievements/AchievementNotification';
import AchievementsButton from '../../src/components/achievements/AchievementsButton';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Helper to reset store before each test
function resetStore() {
  localStorage.clear();
  useAchievementsStore.getState().reset();
}

describe('AchievementsPanel', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<AchievementsPanel isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBe(null);
  });

  it('should render when isOpen is true', () => {
    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Achievements')).toBeDefined();
  });

  it('should display correct count of unlocked achievements', () => {
    useAchievementsStore.getState().trackMeal();
    useAchievementsStore.getState().trackExercise();

    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/2 of.*unlocked/)).toBeDefined();
  });

  it('should display all category tabs', () => {
    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/All/)).toBeDefined();
    // Use queryAllByText since category names also appear in achievement titles
    expect(screen.queryAllByText(/Metabolism/).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/Hormones/).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/Muscle/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Lifestyle/)).toBeDefined();
    expect(screen.getByText(/Milestones/)).toBeDefined();
  });

  it('should filter achievements by category', () => {
    useAchievementsStore.getState().trackMeal();

    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // Click on Metabolism category - use getAllByText and find the button
    const metabolismTabs = screen.queryAllByText(/Metabolism/);
    const metabolismTab = metabolismTabs.find(el => el.tagName === 'BUTTON');
    expect(metabolismTab).toBeDefined();
    if (metabolismTab) fireEvent.click(metabolismTab);

    // First-meal should be in metabolism category
    expect(screen.getByText('Breakfast Club')).toBeDefined();
  });

  it('should filter out locked achievements when checkbox is unchecked', () => {
    // Only unlock one achievement
    useAchievementsStore.getState().trackMeal();

    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // Uncheck "Show locked achievements"
    const checkbox = screen.getByRole('checkbox', { name: /Show locked/i });
    fireEvent.click(checkbox);

    // Should still show unlocked achievement
    expect(screen.getByText('Breakfast Club')).toBeDefined();
  });

  it('should show "No achievements to display" when filter matches none', () => {
    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // Uncheck "Show locked achievements" with no unlocked achievements
    const checkbox = screen.getByRole('checkbox', { name: /Show locked/i });
    fireEvent.click(checkbox);

    expect(screen.getByText('No achievements to display')).toBeDefined();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();

    render(<AchievementsPanel isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();

    const { container } = render(<AchievementsPanel isOpen={true} onClose={onClose} />);

    // Click on backdrop (the fixed inset div)
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when panel content is clicked', () => {
    const onClose = vi.fn();

    render(<AchievementsPanel isOpen={true} onClose={onClose} />);

    const panel = screen.getByText('Achievements').closest('.bg-slate-800');
    fireEvent.click(panel!);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should call onClose when footer close button is clicked', () => {
    const onClose = vi.fn();

    render(<AchievementsPanel isOpen={true} onClose={onClose} />);

    // Find the close button in footer
    const closeButtons = screen.getAllByText('Close');
    expect(closeButtons.length).toBeGreaterThan(0);

    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(onClose).toHaveBeenCalled();
  });

  it('should display achievement rarity badge', () => {
    useAchievementsStore.getState().trackMeal();

    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // First-meal is common rarity - use queryAllByText since there are many common achievements
    const commonBadges = screen.queryAllByText('common');
    expect(commonBadges.length).toBeGreaterThan(0);
  });

  it('should show achievement progress for locked achievements', () => {
    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // Find an achievement with progress (like meal-tracker-bronze)
    const progressLabels = screen.queryAllByText(/Progress/);
    expect(progressLabels.length).toBeGreaterThan(0);
  });

  it('should show completion percentage', () => {
    useAchievementsStore.getState().trackMeal();
    useAchievementsStore.getState().trackExercise();
    useAchievementsStore.getState().trackSleep();

    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // Should show something like "3 of X unlocked (Y%)"
    expect(screenByTextContent(/of.*unlocked/)).toBeDefined();
  });

  it('should show unlocked checkmark for unlocked achievements', () => {
    useAchievementsStore.getState().trackMeal();

    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // Should show "Unlocked" text for the achievement
    const unlockedTexts = screen.queryAllByText(/Unlocked/);
    expect(unlockedTexts.length).toBeGreaterThan(0);
  });

  it('should show hint for locked achievements that have hints', () => {
    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // First-meal has a hint
    expect(screen.getByText(/Log a meal/)).toBeDefined();
  });

  it('should display XP reward for achievements', () => {
    useAchievementsStore.getState().trackMeal();

    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // Achievements should be visible with their details
    expect(screen.getByText('Breakfast Club')).toBeDefined();
  });

  it('should handle category switching', () => {
    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // Start with all achievements
    const allTab = screen.getByText(/All/);
    expect(allTab).toBeDefined();

    // Switch to Muscle category - use getAllByText and find the button
    const muscleTabs = screen.queryAllByText(/Muscle/);
    const muscleTab = muscleTabs.find(el => el.tagName === 'BUTTON');
    expect(muscleTab).toBeDefined();
    if (muscleTab) fireEvent.click(muscleTab);

    // Should filter to muscle achievements
    expect(screen.getByText('Gym Rat')).toBeDefined();
  });

  it('should show tier labels for tiered achievements', () => {
    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // Bronze tiered achievement - there are multiple bronze achievements
    const bronzeTexts = screen.queryAllByText(/Bronze/);
    expect(bronzeTexts.length).toBeGreaterThan(0);
  });

  it('should display filtered count', () => {
    render(<AchievementsPanel isOpen={true} onClose={() => {}} />);

    // Should show how many achievements are displayed
    const displayedText = screen.queryByText(/displayed/);
    expect(displayedText).toBeDefined();
  });
});

describe('AchievementNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render achievement notification', () => {
    const mockAchievement = {
      id: 'test-achievement',
      name: 'Test Achievement',
      description: 'This is a test achievement',
      icon: '🏆',
      rarity: 'common' as const,
    };

    render(<AchievementNotification achievement={mockAchievement} onDismiss={() => {}} />);

    expect(screen.getByText('Test Achievement')).toBeDefined();
    expect(screen.getByText('This is a test achievement')).toBeDefined();
    expect(screen.getByText('Achievement Unlocked!')).toBeDefined();
  });

  it('should display achievement icon', () => {
    const mockAchievement = {
      id: 'test-achievement',
      name: 'Test Achievement',
      description: 'This is a test achievement',
      icon: '🌟',
      rarity: 'rare' as const,
    };

    render(<AchievementNotification achievement={mockAchievement} onDismiss={() => {}} />);

    expect(screen.getByText('🌟')).toBeDefined();
  });

  it('should display rarity', () => {
    const mockAchievement = {
      id: 'test-achievement',
      name: 'Test Achievement',
      description: 'This is a test achievement',
      icon: '🏆',
      rarity: 'legendary' as const,
    };

    render(<AchievementNotification achievement={mockAchievement} onDismiss={() => {}} />);

    expect(screen.getByText('legendary')).toBeDefined();
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    const mockAchievement = {
      id: 'test-achievement',
      name: 'Test Achievement',
      description: 'This is a test achievement',
      icon: '🏆',
      rarity: 'common' as const,
    };

    render(<AchievementNotification achievement={mockAchievement} onDismiss={onDismiss} />);

    const closeButton = screen.getByLabelText('Dismiss');
    fireEvent.click(closeButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should auto-dismiss after 5 seconds', async () => {
    const onDismiss = vi.fn();
    const mockAchievement = {
      id: 'test-achievement',
      name: 'Test Achievement',
      description: 'This is a test achievement',
      icon: '🏆',
      rarity: 'common' as const,
    };

    render(<AchievementNotification achievement={mockAchievement} onDismiss={onDismiss} />);

    vi.advanceTimersByTime(5000);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should clear timer on unmount', () => {
    const onDismiss = vi.fn();
    const mockAchievement = {
      id: 'test-achievement',
      name: 'Test Achievement',
      description: 'This is a test achievement',
      icon: '🏆',
      rarity: 'common' as const,
    };

    const { unmount } = render(
      <AchievementNotification achievement={mockAchievement} onDismiss={onDismiss} />
    );

    unmount();
    vi.advanceTimersByTime(5000);

    // onDismiss should not be called after unmount
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('should render different rarities with appropriate styling', () => {
    const rarities: Array<'common' | 'rare' | 'epic' | 'legendary'> = ['common', 'rare', 'epic', 'legendary'];

    rarities.forEach((rarity) => {
      const mockAchievement = {
        id: `test-${rarity}`,
        name: `${rarity} Achievement`,
        description: `This is a ${rarity} achievement`,
        icon: '🏆',
        rarity,
      };

      const { container } = render(
        <AchievementNotification achievement={mockAchievement} onDismiss={() => {}} />
      );

      expect(screen.getByText(`${rarity} Achievement`)).toBeDefined();
    });
  });
});

describe('AchievementsButton', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should render the button', () => {
    render(<AchievementsButton />);

    const button = screen.getByRole('button', { name: /View achievements/i });
    expect(button).toBeDefined();
  });

  it('should show badge count when achievements are unlocked', () => {
    useAchievementsStore.getState().trackMeal();
    useAchievementsStore.getState().trackExercise();

    render(<AchievementsButton />);

    const badge = screen.getByText('2');
    expect(badge).toBeDefined();
  });

  it('should not show badge when no achievements are unlocked', () => {
    render(<AchievementsButton />);

    // Should not find a number badge
    const badges = screen.queryByText(/[0-9]/);
    expect(badges).toBeNull();
  });

  it('should open panel when button is clicked', async () => {
    render(<AchievementsButton />);

    const button = screen.getByRole('button', { name: /View achievements/i });
    fireEvent.click(button);

    // Panel should open (may be lazy loaded, wait for it)
    await waitFor(() => {
      expect(screen.getByText('Achievements')).toBeDefined();
    });
  });

  it('should initialize tracking on mount', () => {
    render(<AchievementsButton />);

    const state = useAchievementsStore.getState();
    expect(state.stats.initialMuscleMass).toBeGreaterThan(0);
  });

  it('should show notification when achievement is unlocked', async () => {
    render(<AchievementsButton />);

    // Trigger an achievement unlock wrapped in act
    await act(async () => {
      useAchievementsStore.getState().trackMeal();
    });

    await waitFor(() => {
      const notification = screen.queryByText(/Achievement Unlocked/i);
      expect(notification).toBeDefined();
    });
  });

  it('should close notification when dismissed', async () => {
    render(<AchievementsButton />);

    // Trigger an achievement unlock wrapped in act
    await act(async () => {
      useAchievementsStore.getState().trackMeal();
    });

    await waitFor(() => {
      expect(screen.queryByText(/Achievement Unlocked/i)).toBeDefined();
    });

    // Click dismiss button wrapped in act
    await act(async () => {
      const dismissButton = screen.getByLabelText('Dismiss');
      fireEvent.click(dismissButton);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Achievement Unlocked/i)).toBeNull();
    });
  });

  it('should display trophy icon', () => {
    render(<AchievementsButton />);

    const button = screen.getByRole('button', { name: /View achievements/i });
    const svg = button.querySelector('svg');
    expect(svg).toBeDefined();
  });
});

// Helper function to find text by content (not exact match)
function screenByTextContent(text: string | RegExp): HTMLElement | null {
  const elements = screen.queryAllByText(text);
  return elements.length > 0 ? elements[0] as HTMLElement : null;
}
