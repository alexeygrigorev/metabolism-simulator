// ============================================================================
// METABOLIC SIMULATOR - SKELETON COMPONENT UNIT TESTS
// ============================================================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Skeleton,
  CardSkeleton,
  ProfileCardSkeleton,
  HormonePanelSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from '../../src/components/ui/Skeleton';

describe('Skeleton Component', () => {
  it('should render with default props', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render multiple skeletons when count is specified', () => {
    render(<Skeleton count={3} />);
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBe(3);
  });

  it('should apply custom className', () => {
    render(<Skeleton className="custom-class" />);
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should render circular variant', () => {
    render(<Skeleton variant="circular" width={40} height={40} />);
    const skeleton = document.querySelector('.rounded-full');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render text variant', () => {
    render(<Skeleton variant="text" />);
    const skeleton = document.querySelector('.h-4');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render rounded variant', () => {
    render(<Skeleton variant="rounded" />);
    const skeleton = document.querySelector('.rounded-lg');
    expect(skeleton).toBeInTheDocument();
  });

  it('should apply custom width and height', () => {
    render(<Skeleton width={100} height={50} />);
    const skeleton = document.querySelector('[style*="width"]');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('CardSkeleton Component', () => {
  it('should render card skeleton structure', () => {
    render(<CardSkeleton />);
    expect(document.querySelector('.bg-slate-800\\/50')).toBeInTheDocument();
  });

  it('should have circular avatar skeleton', () => {
    render(<CardSkeleton />);
    expect(document.querySelector('.rounded-full')).toBeInTheDocument();
  });
});

describe('ProfileCardSkeleton Component', () => {
  it('should render profile card structure', () => {
    render(<ProfileCardSkeleton />);
    expect(document.querySelector('.bg-slate-800')).toBeInTheDocument();
  });

  it('should have multiple row skeletons', () => {
    render(<ProfileCardSkeleton />);
    const rows = document.querySelectorAll('.flex.justify-between');
    expect(rows.length).toBeGreaterThan(0);
  });
});

describe('HormonePanelSkeleton Component', () => {
  it('should render hormone panel structure', () => {
    render(<HormonePanelSkeleton />);
    expect(document.querySelector('.bg-slate-800')).toBeInTheDocument();
  });
});

describe('ChartSkeleton Component', () => {
  it('should render chart structure with bars', () => {
    render(<ChartSkeleton />);
    const bars = document.querySelectorAll('.items-end');
    expect(bars.length).toBe(1);
  });

  it('should render default height', () => {
    render(<ChartSkeleton />);
    const barsContainer = document.querySelector('.h-40');
    expect(barsContainer).toBeInTheDocument();
  });

  it('should render custom height', () => {
    render(<ChartSkeleton height={150} />);
    const barsContainer = document.querySelector('[style*="height"]');
    expect(barsContainer).toBeInTheDocument();
  });
});

describe('TableSkeleton Component', () => {
  it('should render table structure', () => {
    render(<TableSkeleton rows={3} />);
    expect(document.querySelector('.divide-y')).toBeInTheDocument();
  });

  it('should render specified number of rows', () => {
    render(<TableSkeleton rows={5} />);
    const rows = document.querySelectorAll('.p-4.flex.items-center');
    expect(rows.length).toBe(5);
  });

  it('should have circular avatar in each row', () => {
    render(<TableSkeleton rows={3} />);
    const avatars = document.querySelectorAll('.rounded-full');
    expect(avatars.length).toBe(3);
  });
});
