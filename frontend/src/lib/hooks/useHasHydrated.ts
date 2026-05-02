import { useState, useEffect } from 'react';

/**
 * Hook to track whether the component has hydrated on the client.
 * Returns false during SSR and true once the component has mounted on the client.
 */
export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}
