// ============================================================================
// METABOLIC SIMULATOR - LAZY LOAD COMPONENT
// ============================================================================

import { memo, useEffect, useRef, useState, ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
}

/**
 * Component that defers rendering of its children until they enter the viewport.
 * Uses IntersectionObserver for efficient viewport detection.
 */
const LazyLoad = memo(function LazyLoad({
  children,
  fallback = null,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true,
  className = '',
}: LazyLoadProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || (triggerOnce && hasIntersected)) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          setHasIntersected(true);

          // Disconnect after first intersection if triggerOnce is true
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce, hasIntersected]);

  return (
    <div ref={rootRef} className={className}>
      {isIntersecting ? children : fallback}
    </div>
  );
});

export default LazyLoad;

/**
 * HOC to wrap a component with lazy loading
 */
export function withLazyLoad<P extends object>(
  Component: React.ComponentType<P>,
  options?: { rootMargin?: string; threshold?: number; fallback?: ReactNode }
) {
  return memo(function LazyLoadedComponent(props: P) {
    return (
      <LazyLoad rootMargin={options?.rootMargin} threshold={options?.threshold} fallback={options?.fallback}>
        <Component {...props} />
      </LazyLoad>
    );
  });
}

/**
 * Component that staggers rendering of children for better perceived performance
 */
interface StaggeredRenderProps {
  children: ReactNode[];
  staggerMs?: number;
  className?: string;
}

export function StaggeredRender({ children, staggerMs = 50, className = '' }: StaggeredRenderProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const childrenArray = Array.isArray(children) ? children : [children];

    if (visibleCount < childrenArray.length) {
      const timeout = setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + 1, childrenArray.length));
      }, staggerMs);

      return () => clearTimeout(timeout);
    }
  }, [visibleCount, children, staggerMs]);

  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {childrenArray.slice(0, visibleCount)}
    </div>
  );
}

/**
 * Component that renders content only when the window is idle
 */
interface RenderOnIdleProps {
  children: ReactNode;
  fallback?: ReactNode;
  timeout?: number;
}

export function RenderOnIdle({ children, fallback = null, timeout = 200 }: RenderOnIdleProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Use requestIdleCallback if available, otherwise fallback to setTimeout
    const startRender = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => setShouldRender(true));
      } else {
        setTimeout(() => setShouldRender(true), timeout);
      }
    };

    const timeoutId = setTimeout(startRender, timeout);
    return () => clearTimeout(timeoutId);
  }, [timeout]);

  return <>{shouldRender ? children : fallback}</>;
}
