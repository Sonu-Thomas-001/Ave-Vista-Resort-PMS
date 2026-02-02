'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/dashboard/HeroSection';
import OccupancyAnalytics from '@/components/dashboard/OccupancyAnalytics';
import LiveOperations from '@/components/dashboard/LiveOperations';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    checkIns: 0,
    checkOuts: 0,
    occupancy: 0,
    revenue: 0,
    availableRooms: 0
  });

  useEffect(() => {
    fetchDashboardData();

    // Optional: Set up real-time subscription here
    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    const today = new Date().toISOString().split('T')[0];

    // Parallel fetching for performance
    const [
      { count: checkInsCount },
      { count: checkOutsCount },
      { data: rooms },
      { data: bookings }
    ] = await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('check_in_date', today),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('check_out_date', today),
      supabase.from('rooms').select('id, status, price_per_night'),
      supabase.from('bookings').select('total_amount').eq('status', 'Checked In') // Proxy for today's revenue logic
    ]);

    const totalRooms = rooms?.length || 0;
    const occupiedRooms = rooms?.filter(r => r.status === 'Occupied').length || 0;
    const available = rooms?.filter(r => r.status === 'Clean').length || 0;
    const calculatedOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Simple revenue sum (mock logic for "Today's Revenue" - typically requires invoice table with dates)
    // For now assuming active bookings contribute to potential revenue or similar.
    // Let's just fetch Total Revenue from Invoices if available, else 0.
    const { data: invoices } = await supabase.from('invoices').select('amount').eq('payment_status', 'Paid'); // Filter by date in real app
    const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

    setMetrics({
      checkIns: checkInsCount || 0,
      checkOuts: checkOutsCount || 0,
      occupancy: calculatedOccupancy,
      revenue: totalRevenue,
      availableRooms: available
    });
  };

  return (
    <>
      <Header title="Resort Overview" />

      <div className={styles.container}>
        {/* 1. Hero KPI Section */}
        <HeroSection
          checkIns={metrics.checkIns}
          checkOuts={metrics.checkOuts} // Not used in Hero yet but good to have
          occupancy={metrics.occupancy}
          revenue={metrics.revenue}
          availableRooms={metrics.availableRooms}
        />

        {/* 2. Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Occupancy and Revenue Analytics */}
          <div className={styles.mainPanel}>
            <OccupancyAnalytics />
          </div>

          {/* Live Operations Feed */}
          <div className={styles.sidePanel}>
            <LiveOperations />
          </div>
        </div>
      </div>
    </>
  );
}
