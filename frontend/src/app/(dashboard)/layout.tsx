import ProtectedRoute from '@/components/auth/ProtectedRoute';

/**
 * Dashboard Layout
 * 
 * This layout wraps all routes under the (dashboard) route group.
 * It uses the ProtectedRoute component to ensure only authenticated users
 * can access dashboard pages (workspace, algorithms, history, etc.).
 * 
 * Any route placed under app/(dashboard)/ will automatically be protected.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}

