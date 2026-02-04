'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/dashboard/HeroSection';
import OccupancyAnalytics from '@/components/dashboard/OccupancyAnalytics';
import LiveOperations from '@/components/dashboard/LiveOperations';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RoomStatusChart from '@/components/dashboard/RoomStatusChart';
import CheckInOutChart from '@/components/dashboard/CheckInOutChart';
import QuickStats from '@/components/dashboard/QuickStats';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';

// Helper to get last 7 days short names (Mon, Tue, etc.)
const getLast7Days = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      date: d.toISOString().split('T')[0],
      day: days[d.getDay()],
      fullDate: d
    });
  }
  return result;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    checkIns: 0,
    checkOuts: 0,
    occupancy: 0,
    revenue: 0,
    availableRooms: 0
  });

  const [occupancyData, setOccupancyData] = useState<{ day: string; value: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ date: string; value: number }[]>([]);
  const [roomStatusData, setRoomStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [checkInOutData, setCheckInOutData] = useState<{ date: string; checkIns: number; checkOuts: number }[]>([]);
  const [quickStats, setQuickStats] = useState({
    totalBookings: 0,
    totalGuests: 0,
    avgStayDuration: 0,
    avgDailyRate: 0
  });

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscription
    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const last7Days = getLast7Days();

    // Parallel fetching
    const [
      { count: checkInsCount },
      { count: checkOutsCount },
      { data: rooms },
      { data: invoices },
      { data: weeklyBookings }
    ] = await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('check_in_date', today),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('check_out_date', today),
      supabase.from('rooms').select('id, status, price_per_night'),
      supabase.from('invoices').select('paid_amount, created_at, status'),
      supabase.from('bookings').select('check_in_date, check_out_date, status').in('status', ['Checked In', 'Confirmed'])
      // Note: For accurate historical occupancy we'd need more complex query, 
      // but for now we'll estimate based on check-ins in range or just current snapshot if easier.
      // Actually, let's just do a proper range query for the last 7 days? 
      // Simpler for now: "Occupancy Trends" usually means future or past. 
      // Let's Mock specific historical data logic or use a simple heuristic for this MVP.
      // Heuristic: Count active bookings per day.
    ]);

    // 1. Metrics Calculation
    const totalRooms = rooms?.length || 0;
    const occupiedRooms = rooms?.filter(r => r.status === 'Occupied').length || 0;
    const available = rooms?.filter(r => r.status === 'Clean').length || 0;
    const calculatedOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Filter paid invoices for today's revenue (or total "current" revenue context)
    // "Total Revenue" on dashboard usually implies a period. Let's say "This Month" or just "Total Paid". 
    // The previous code did a full sum. Let's stick to that or refine to "Today" if the card says "Today's Revenue".
    // Card says "Total Revenue". Stick to global sum.
    const paidInvoices = invoices?.filter(i => i.status === 'Paid') || [];
    const totalRevenueAmount = paidInvoices.reduce((sum, inv) => sum + Number(inv.paid_amount), 0);

    setMetrics({
      checkIns: checkInsCount || 0,
      checkOuts: checkOutsCount || 0,
      occupancy: calculatedOccupancy,
      revenue: totalRevenueAmount,
      availableRooms: available
    });

    // 2. Room Status Chart Data
    const statusCounts = rooms?.reduce((acc: any, room: any) => {
      acc[room.status] = (acc[room.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Define colors for statuses
    const statusColors: any = {
      'Occupied': '#3b82f6', // blue
      'Clean': '#10b981',    // green
      'Dirty': '#ef4444',    // red
      'Maintenance': '#f59e0b', // orange
      'Cleaning': '#6366f1'  // indigo
    };

    const roomChartData = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status],
      color: statusColors[status] || '#94a3b8'
    }));
    setRoomStatusData(roomChartData);


    // 3. Revenue Trend (Last 7 Days)
    // Aggregate paid invoices by day
    const revenueByDay = last7Days.map(dayObj => {
      const dayTotal = paidInvoices
        .filter(inv => inv.created_at.startsWith(dayObj.date))
        .reduce((sum, inv) => sum + Number(inv.paid_amount), 0);
      return {
        date: dayObj.day, // 'Mon', 'Tue'
        value: dayTotal
      };
    });
    setRevenueData(revenueByDay);


    // 4. Occupancy Trend (Last 7 Days) - Simplified Logic
    // Accessing `rooms` and `weeklyBookings`? No, simpler to just "Start with current and mock history" 
    // OR try to rebuild history. 
    // REAL APPROACH: Query bookings that overlap each day.
    // For MVP transparency: I will calculate "Active Bookings" per day for the last 7 days.

    // Ensure we have bookings data to work with.
    // Actually, let's fetch all bookings that overlap the last 7 days range to be accurate.
    const startDate = last7Days[0].date;
    const endDate = last7Days[6].date;
    const { data: rangeBookings } = await supabase
      .from('bookings')
      .select('check_in_date, check_out_date')
      .or(`check_in_date.lte.${endDate},check_out_date.gte.${startDate}`);

    const occupancyTrend = last7Days.map(dayObj => {
      // Count bookings where (check_in <= day) AND (check_out > day)
      const activeCount = rangeBookings?.filter(b =>
        b.check_in_date <= dayObj.date && b.check_out_date > dayObj.date
      ).length || 0;

      // Calculate percentage (assuming total rooms constant)
      const percentage = totalRooms > 0 ? Math.round((activeCount / totalRooms) * 100) : 0;

      return {
        day: dayObj.day,
        value: percentage
      };
    });
    setOccupancyData(occupancyTrend);

    // 5. Check-ins vs Check-outs (Last 7 Days)
    const checkInOutTrend = last7Days.map(dayObj => {
      const checkInsCount = rangeBookings?.filter(b => b.check_in_date === dayObj.date).length || 0;
      const checkOutsCount = rangeBookings?.filter(b => b.check_out_date === dayObj.date).length || 0;

      return {
        date: dayObj.day,
        checkIns: checkInsCount,
        checkOuts: checkOutsCount
      };
    });
    setCheckInOutData(checkInOutTrend);

    // 6. Quick Stats
    const { data: allBookings } = await supabase
      .from('bookings')
      .select('check_in_date, check_out_date, total_amount, guests_count');

    const totalBookings = allBookings?.length || 0;
    const totalGuests = allBookings?.reduce((sum, b) => sum + (b.guests_count || 1), 0) || 0;

    // Calculate average stay duration
    const avgStay = allBookings?.reduce((sum, b) => {
      const checkIn = new Date(b.check_in_date);
      const checkOut = new Date(b.check_out_date);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0) || 0;
    const avgStayDuration = totalBookings > 0 ? Math.round(avgStay / totalBookings) : 0;

    // Calculate average daily rate
    const totalRevenue = allBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
    const totalNights = avgStay;
    const avgDailyRate = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0;

    setQuickStats({
      totalBookings,
      totalGuests,
      avgStayDuration,
      avgDailyRate
    });
  };

  return (
    <>
      <Header title="Resort Overview" />

      <div className={styles.container}>
        {/* 1. Hero KPI Section */}
        <HeroSection
          checkIns={metrics.checkIns}
          checkOuts={metrics.checkOuts}
          occupancy={metrics.occupancy}
          revenue={metrics.revenue}
          availableRooms={metrics.availableRooms}
        />

        {/* 2. Main Analytics Grid */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <RevenueChart data={revenueData} />
          </div>
          <div className={styles.chartCard}>
            <RoomStatusChart data={roomStatusData} />
          </div>
          <div className={styles.chartCard}>
            <CheckInOutChart data={checkInOutData} />
          </div>
          <div className={styles.chartCard}>
            <QuickStats stats={quickStats} />
          </div>
        </div>

        {/* 3. Detailed Operations */}
        <div className={styles.contentGrid}>
          {/* Detailed Occupancy (Existing Bar Chart) */}
          <div className={styles.mainPanel}>
            <OccupancyAnalytics data={occupancyData} />
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
