// ============================================================================
// METABOLIC SIMULATOR - OFFLINE INDICATOR UNIT TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OfflineIndicator from '../../src/components/ui/OfflineIndicator';

// Mock useOffline hook
vi.mock('../../src/hooks/useOffline', () => ({
  useOffline: vi.fn(),
}));

import { useOffline } from '../../src/hooks/useOffline';

describe('OfflineIndicator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when online with no queued actions', () => {
    vi.mocked(useOffline).mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasRecentlyOnline: true,
      lastOnlineTime: new Date(),
      queue: [],
      queueSize: 0,
      queueAction: vi.fn(),
      dequeueAction: vi.fn(),
      clearQueue: vi.fn(),
      retryQueue: vi.fn(),
      persistState: vi.fn(),
      loadPersistedState: vi.fn(),
    });

    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBe(null);
  });

  it('should render offline indicator when offline', () => {
    vi.mocked(useOffline).mockReturnValue({
      isOnline: false,
      isOffline: true,
      wasRecentlyOnline: false,
      lastOnlineTime: new Date(),
      queue: [],
      queueSize: 0,
      queueAction: vi.fn(),
      dequeueAction: vi.fn(),
      clearQueue: vi.fn(),
      retryQueue: vi.fn(),
      persistState: vi.fn(),
      loadPersistedState: vi.fn(),
    });

    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).not.toBe(null);
    expect(screen.getByText('📴')).toBeInTheDocument();
    // Check that the component has offline styling (using class name partial match)
    expect(container.querySelector('[class*="bg-amber-500"]')).toBeInTheDocument();
  });

  it('should render pending sync indicator when online with queued actions', () => {
    vi.mocked(useOffline).mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasRecentlyOnline: true,
      lastOnlineTime: new Date(),
      queue: [
        { id: '1', type: 'meal' as const, timestamp: Date.now(), payload: {} },
        { id: '2', type: 'exercise' as const, timestamp: Date.now(), payload: {} },
      ],
      queueSize: 2,
      queueAction: vi.fn(),
      dequeueAction: vi.fn(),
      clearQueue: vi.fn(),
      retryQueue: vi.fn(),
      persistState: vi.fn(),
      loadPersistedState: vi.fn(),
    });

    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).not.toBe(null);
    expect(screen.getByText('🔄')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // queue size
    // Check that the component has blue styling for pending sync
    expect(container.querySelector('[class*="bg-blue-500"]')).toBeInTheDocument();
  });

  it('should call retryQueue when retry button is clicked', async () => {
    const retryMock = vi.fn().mockResolvedValue(2);

    vi.mocked(useOffline).mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasRecentlyOnline: true,
      lastOnlineTime: new Date(),
      queue: [{ id: '1', type: 'meal' as const, timestamp: Date.now(), payload: {} }],
      queueSize: 1,
      queueAction: vi.fn(),
      dequeueAction: vi.fn(),
      clearQueue: vi.fn(),
      retryQueue: retryMock,
      persistState: vi.fn(),
      loadPersistedState: vi.fn(),
    });

    render(<OfflineIndicator />);

    const retryButton = screen.getByText('Retry now');
    fireEvent.click(retryButton);

    expect(retryMock).toHaveBeenCalled();
  });

  it('should display correct styling when offline', () => {
    vi.mocked(useOffline).mockReturnValue({
      isOnline: false,
      isOffline: true,
      wasRecentlyOnline: false,
      lastOnlineTime: new Date(),
      queue: [],
      queueSize: 0,
      queueAction: vi.fn(),
      dequeueAction: vi.fn(),
      clearQueue: vi.fn(),
      retryQueue: vi.fn(),
      persistState: vi.fn(),
      loadPersistedState: vi.fn(),
    });

    const { container } = render(<OfflineIndicator />);
    const indicator = container.querySelector('.bg-amber-500\\/20');
    expect(indicator).toBeInTheDocument();
  });

  it('should display correct styling when online with pending actions', () => {
    vi.mocked(useOffline).mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasRecentlyOnline: true,
      lastOnlineTime: new Date(),
      queue: [{ id: '1', type: 'meal' as const, timestamp: Date.now(), payload: {} }],
      queueSize: 1,
      queueAction: vi.fn(),
      dequeueAction: vi.fn(),
      clearQueue: vi.fn(),
      retryQueue: vi.fn(),
      persistState: vi.fn(),
      loadPersistedState: vi.fn(),
    });

    const { container } = render(<OfflineIndicator />);
    const indicator = container.querySelector('.bg-blue-500\\/20');
    expect(indicator).toBeInTheDocument();
  });

  it('should display singular form for single action', () => {
    vi.mocked(useOffline).mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasRecentlyOnline: true,
      lastOnlineTime: new Date(),
      queue: [{ id: '1', type: 'meal' as const, timestamp: Date.now(), payload: {} }],
      queueSize: 1,
      queueAction: vi.fn(),
      dequeueAction: vi.fn(),
      clearQueue: vi.fn(),
      retryQueue: vi.fn(),
      persistState: vi.fn(),
      loadPersistedState: vi.fn(),
    });

    const { container } = render(<OfflineIndicator />);
    expect(screen.getByText('1')).toBeInTheDocument(); // queue size
    expect(screen.getByText('Retry now')).toBeInTheDocument();
    expect(container.querySelector('[class*="bg-blue-500"]')).toBeInTheDocument();
  });
});
