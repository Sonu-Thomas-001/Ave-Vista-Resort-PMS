'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardClientWrapper() {
  const router = useRouter();

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        router.refresh(); // Triggers a re-fetch of Server Components
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        router.refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null; // This is a logic-only wrapper, it does not render any UI
}
