'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useHasHydrated } from '@/lib/hooks/useHasHydrated';

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  /**
   * The content to render if the user is authenticated
   */
  children: React.ReactNode;
  
  /**
   * The path to redirect to if the user is not authenticated
   * @default '/login'
   */
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * A wrapper component that guards routes requiring authentication.
 * It checks if the user is authenticated and redirects to the login page if not.
 * 
 * Features:
 * - Waits for Zustand store hydration to prevent SSR mismatches
 * - Shows nothing during hydration to prevent content flashing
 * - Redirects unauthenticated users to login page
 * - Renders children only when authenticated
 * 
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <DashboardContent />
 * </ProtectedRoute>
 * ```
 * 
 * @example
 * ```tsx
 * <ProtectedRoute redirectTo="/signin">
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const hasHydrated = useHasHydrated();
  const { isAuthenticated, _hasHydrated: storeHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for both component hydration and store hydration
    if (hasHydrated && storeHydrated) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push(redirectTo);
      }
    }
  }, [hasHydrated, storeHydrated, isAuthenticated, router, redirectTo]);

  // Don't render anything until hydration is complete
  // This prevents content flashing and SSR mismatches
  if (!hasHydrated || !storeHydrated) {
    return null;
  }

  // Don't render children if not authenticated
  // The redirect will happen via useEffect
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}

