'use client';

import { useAuth } from '@/context/AuthContext';
import LandingView from '@/components/LandingView';
import DashboardView from '@/components/DashboardView';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { currentUser, isLoading } = useAuth();

  // Show a loading state if the auth status is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // If no user is logged in, show the public landing page
  if (!currentUser) {
    return <LandingView />;
  }

  // If user is logged in, show the internal dashboard
  return <DashboardView />;
}
