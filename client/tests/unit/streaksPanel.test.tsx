// ============================================================================
// METABOLIC SIMULATOR - STREAKS PANEL TESTS
// ============================================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import StreaksPanel from '../../src/components/dashboard/StreaksPanel';
import { useAchievementsStore } from '../../src/state/achievementsStore';

describe('StreaksPanel', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAchievementsStore.getState().reset();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render the streaks panel', () => {
      render(<StreaksPanel />);
      expect(screen.getByTestId('streaks-panel')).toBeVisible();
    });

    it('should display the panel header with fire icon', () => {
      render(<StreaksPanel />);
      expect(screen.getByText('Current Streaks')).toBeVisible();
    });

    it('should show empty state when no active streaks', () => {
      render(<StreaksPanel />);
      expect(screen.getByText(/Start tracking to build your streaks!/i)).toBeVisible();
    });

    it('should display supplement streak', () => {
      const { stats } = useAchievementsStore.getState();
      useAchievementsStore.setState({
        stats: { ...stats, supplementsStreak: 3, lastSupplementDate: new Date().toDateString() }
      });

      render(<StreaksPanel />);
      expect(screen.getByText('Supplements')).toBeVisible();
      expect(screen.getByText('3 days')).toBeVisible();
    });

    it('should display hydration streak', () => {
      const { stats } = useAchievementsStore.getState();
      useAchievementsStore.setState({
        stats: { ...stats, waterGoalDays: 5, lastActiveDate: new Date().toDateString() }
      });

      render(<StreaksPanel />);
      expect(screen.getByText('Hydration')).toBeVisible();
      expect(screen.getByText('5 days')).toBeVisible();
    });

    it('should display protein streak', () => {
      const { stats } = useAchievementsStore.getState();
      useAchievementsStore.setState({
        stats: { ...stats, proteinStreak: 2 }
      });

      render(<StreaksPanel />);
      expect(screen.getByText('Protein Target')).toBeVisible();
      expect(screen.getByText('2 times')).toBeVisible();
    });
  });

  describe('Streak Status', () => {
    it('should show "On fire!" when streak target is reached', () => {
      const { stats } = useAchievementsStore.getState();
      useAchievementsStore.setState({
        stats: {
          ...stats,
          supplementsStreak: 10,
          lastSupplementDate: new Date().toDateString(),
          waterGoalDays: 8,
          lastActiveDate: new Date().toDateString()
        }
      });

      render(<StreaksPanel />);
      expect(screen.getAllByText(/On fire!/i)).toHaveLength(2);
    });

    it('should show "Keep going!" for good progress', () => {
      const { stats } = useAchievementsStore.getState();
      useAchievementsStore.setState({
        stats: {
          ...stats,
          supplementsStreak: 4,
          lastSupplementDate: new Date().toDateString()
        }
      });

      render(<StreaksPanel />);
      expect(screen.getByText(/Keep going!/i)).toBeVisible();
    });

    it('should show "Building..." for started streaks', () => {
      const { stats } = useAchievementsStore.getState();
      useAchievementsStore.setState({
        stats: {
          ...stats,
          waterGoalDays: 2,
          lastActiveDate: new Date().toDateString()
        }
      });

      render(<StreaksPanel />);
      expect(screen.getByText(/Building.../i)).toBeVisible();
    });
  });

  describe('Progress Bars', () => {
    it('should show correct progress percentage', () => {
      const { stats } = useAchievementsStore.getState();
      useAchievementsStore.setState({
        stats: {
          ...stats,
          supplementsStreak: 5,
          lastSupplementDate: new Date().toDateString()
        }
      });

      const { container } = render(<StreaksPanel />);
      // Progress should be approximately 71% (5/7 * 100)
      const progressBars = container.querySelectorAll('.h-2.bg-slate-700 > div');
      expect(progressBars.length).toBeGreaterThan(0);
      // First progress bar (supplements) should be approximately 71%
      const firstBar = progressBars[0] as HTMLElement;
      expect(firstBar.style.width).toContain('%');
      expect(parseFloat(firstBar.style.width)).toBeCloseTo(71.4, 0);
    });

    it('should show milestone indicators', () => {
      const { stats } = useAchievementsStore.getState();
      useAchievementsStore.setState({
        stats: {
          ...stats,
          supplementsStreak: 5,
          lastSupplementDate: new Date().toDateString()
        }
      });

      render(<StreaksPanel />);
      // Should have milestone dots for the supplement streak
      const milestoneDots = screen.getAllByTitle(/0|25|50|75|100/);
      expect(milestoneDots.length).toBeGreaterThan(0);
    });
  });

  describe('Motivational Messages', () => {
    it('should show excellent message for multiple completed streaks', () => {
      const { stats } = useAchievementsStore.getState();
      useAchievementsStore.setState({
        stats: {
          ...stats,
          supplementsStreak: 10,
          lastSupplementDate: new Date().toDateString(),
          waterGoalDays: 10,
          lastActiveDate: new Date().toDateString()
        }
      });

      render(<StreaksPanel />);
      expect(screen.getByText(/Amazing work!/i)).toBeVisible();
    });

    it('should show great progress message for one completed streak', () => {
      const { stats } = useAchievementsStore.getState();
      useAchievementsStore.setState({
        stats: {
          ...stats,
          supplementsStreak: 8,
          lastSupplementDate: new Date().toDateString()
        }
      });

      render(<StreaksPanel />);
      expect(screen.getByText(/Great progress!/i)).toBeVisible();
    });

    it('should show encouragement message for started streaks', () => {
      const { stats } = useAchievementsStore.getState();
      useAchievementsStore.setState({
        stats: {
          ...stats,
          supplementsStreak: 2,
          lastSupplementDate: new Date().toDateString()
        }
      });

      render(<StreaksPanel />);
      expect(screen.getByText(/Every day counts/i)).toBeVisible();
    });

    it('should not show motivational tip when no active streaks', () => {
      render(<StreaksPanel />);
      // The empty state message is different from the motivational tip
      expect(screen.queryByText(/Amazing work!/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Great progress!/i)).not.toBeInTheDocument();
    });
  });

  describe('Streak Inactivity', () => {
    it('should show streaks as "Not started" when inactive', () => {
      const { stats } = useAchievementsStore.getState();
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toDateString();
      useAchievementsStore.setState({
        stats: {
          ...stats,
          supplementsStreak: 5,
          lastSupplementDate: twoDaysAgo,
          waterGoalDays: 3,
          lastActiveDate: twoDaysAgo,
          proteinStreak: 2
        }
      });

      render(<StreaksPanel />);
      // Should show "Not started" for inactive streaks (supplements and hydration)
      expect(screen.getAllByText('Not started')).toHaveLength(2);
      expect(screen.getByText('Supplements')).toBeVisible();
    });

    it('should maintain active streak when logged today', () => {
      const { stats } = useAchievementsStore.getState();
      const today = new Date().toDateString();
      useAchievementsStore.setState({
        stats: {
          ...stats,
          supplementsStreak: 5,
          lastSupplementDate: today
        }
      });

      render(<StreaksPanel />);
      expect(screen.getByText('5 days')).toBeVisible();
    });

    it('should maintain active streak when logged yesterday', () => {
      const { stats } = useAchievementsStore.getState();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      useAchievementsStore.setState({
        stats: {
          ...stats,
          supplementsStreak: 5,
          lastSupplementDate: yesterday
        }
      });

      render(<StreaksPanel />);
      expect(screen.getByText('5 days')).toBeVisible();
    });
  });
});
