export const BREAKPOINTS = Object.freeze({
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
});

export function getDisplayState() {
  const width = window.innerWidth;
  return {
    width,
    isMobile: width < BREAKPOINTS.sm,
    smAndUp: width >= BREAKPOINTS.sm,
    mdAndUp: width >= BREAKPOINTS.md,
    lgAndUp: width >= BREAKPOINTS.lg,
    xlAndUp: width >= BREAKPOINTS.xl
  };
}

export function onDisplayChange(callback) {
  const handleResize = () => callback(getDisplayState());
  handleResize();
  window.addEventListener('resize', handleResize, { passive: true });
  return () => window.removeEventListener('resize', handleResize);
}
