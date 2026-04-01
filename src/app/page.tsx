import Header from '@/components/Header';
import HeroSection from '@/components/dashboard/HeroSection';
import OccupancyAnalytics from '@/components/dashboard/OccupancyAnalytics';
import LiveOperations from '@/components/dashboard/LiveOperations';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RoomStatusChart from '@/components/dashboard/RoomStatusChart';
import CheckInOutChart from '@/components/dashboard/CheckInOutChart';
import QuickStats from '@/components/dashboard/QuickStats';
import DashboardClientWrapper from '@/components/dashboard/DashboardClientWrapper';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { ROOM_STATUS_COLORS, INVOICE_STATUS, ROOM_STATUS } from '@/lib/constants';
import { DashboardMetrics, Booking, Invoice } from '@/types/dashboard';

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

// Next.js Server Component
export default async function Dashboard() {
  const today = new Date().toISOString().split('T')[0];
  const last7Days = getLast7Days();
  const startDate = last7Days[0].date;
  const endDate = last7Days[6].date;

  // Parallel server fetching
  const [
    { data: rpcMetrics, error: rpcError },
    { data: rangeBookings },
    { data: recentInvoices },
    { data: allRooms },
    { data: allBookings },
    { data: paidInvoices }
  ] = await Promise.all([
    // 1. Fetch aggregated scalars via RPC
    (supabase.rpc('get_dashboard_metrics', { target_date: today }) as unknown as Promise<{ data: DashboardMetrics | null, error: any }>),
    
    // 2. Fetch specific bookings for chart trends (last 7 days)
    (supabase
      .from('bookings')
      .select('check_in_date, check_out_date')
      .or(`check_in_date.lte.${endDate},check_out_date.gte.${startDate}`) as unknown as Promise<{ data: Pick<Booking, 'check_in_date' | 'check_out_date'>[] | null }>),
      
    // 3. Fetch recent paid invoices for revenue trend chart
    (supabase
      .from('invoices')
      .select('paid_amount, created_at, status')
      .in('status', [INVOICE_STATUS.PAID, INVOICE_STATUS.PARTIAL])
      .gte('created_at', startDate) as unknown as Promise<{ data: Pick<Invoice, 'paid_amount' | 'created_at' | 'status'>[] | null }>),

    // 4. Fetch all room statuses for occupancy and room distribution fallback
    (supabase
      .from('rooms')
      .select('status') as unknown as Promise<{ data: { status: string | null }[] | null }>),

    // 5. Fetch bookings for quick stats fallback
    (supabase
      .from('bookings')
      .select('check_in_date, check_out_date, guests_count, total_amount') as unknown as Promise<{
        data: Pick<Booking, 'check_in_date' | 'check_out_date' | 'guests_count' | 'total_amount'>[] | null
      }>),

    // 6. Fetch paid/partial invoices for total revenue fallback
    (supabase
      .from('invoices')
      .select('paid_amount, status')
      .in('status', [INVOICE_STATUS.PAID, INVOICE_STATUS.PARTIAL]) as unknown as Promise<{
        data: Pick<Invoice, 'paid_amount' | 'status'>[] | null
      }>)
  ]);

  if (rpcError && rpcError.code !== 'PGRST202') {
    console.error('Error fetching dashboard metrics RPC:', {
      message: rpcError.message,
      details: rpcError.details,
      hint: rpcError.hint,
      code: rpcError.code
    });
  }

  const fallbackRoomStatusCounts = (allRooms || []).reduce<Record<string, number>>((acc, room) => {
    const status = room.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const fallbackTotalRooms = (allRooms || []).length;
  const fallbackOccupiedRooms = fallbackRoomStatusCounts[ROOM_STATUS.OCCUPIED] || 0;
  const fallbackAvailableRooms = fallbackRoomStatusCounts[ROOM_STATUS.CLEAN] || 0;
  const fallbackOccupancy = fallbackTotalRooms > 0
    ? Math.round((fallbackOccupiedRooms / fallbackTotalRooms) * 100)
    : 0;

  const fallbackCheckIns = (allBookings || []).filter((b) => b.check_in_date === today).length;
  const fallbackCheckOuts = (allBookings || []).filter((b) => b.check_out_date === today).length;
  const fallbackTotalBookings = (allBookings || []).length;
  const fallbackTotalGuests = (allBookings || []).reduce((sum, b) => sum + Number(b.guests_count || 0), 0);

  const validStayBookings = (allBookings || []).filter(
    (b) => b.check_out_date > b.check_in_date
  );

  const stayDurations = validStayBookings.map((b) => {
    const checkIn = new Date(`${b.check_in_date}T00:00:00Z`);
    const checkOut = new Date(`${b.check_out_date}T00:00:00Z`);
    return Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  });

  const fallbackAvgStayDuration = stayDurations.length > 0
    ? Math.round(stayDurations.reduce((sum, days) => sum + days, 0) / stayDurations.length)
    : 0;

  const adrValues = validStayBookings
    .map((b) => {
      const checkIn = new Date(`${b.check_in_date}T00:00:00Z`);
      const checkOut = new Date(`${b.check_out_date}T00:00:00Z`);
      const nights = Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
      return nights > 0 ? Number(b.total_amount || 0) / nights : 0;
    })
    .filter((v) => v > 0);

  const fallbackAvgDailyRate = adrValues.length > 0
    ? Math.round(adrValues.reduce((sum, value) => sum + value, 0) / adrValues.length)
    : 0;

  const fallbackRevenue = (paidInvoices || []).reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);

  const metrics: DashboardMetrics = rpcMetrics || {
    checkIns: fallbackCheckIns,
    checkOuts: fallbackCheckOuts,
    occupancy: fallbackOccupancy,
    revenue: fallbackRevenue,
    availableRooms: fallbackAvailableRooms,
    roomStatusCounts: fallbackRoomStatusCounts,
    totalBookings: fallbackTotalBookings,
    totalGuests: fallbackTotalGuests,
    avgStayDuration: fallbackAvgStayDuration,
    avgDailyRate: fallbackAvgDailyRate
  };

  const totalRooms = fallbackTotalRooms;

  // --- Calculate Chart Arrays on the Server ---
  
  // Room Status Chart Data mapping
  const roomChartData = Object.keys(metrics.roomStatusCounts || {}).map((status) => ({
    name: status,
    value: (metrics.roomStatusCounts as Record<string, number>)[status],
    color: ROOM_STATUS_COLORS[status as keyof typeof ROOM_STATUS_COLORS] || '#94a3b8'
  }));

  // Revenue Trend (Last 7 Days)
  const revenueData = last7Days.map(dayObj => {
    const dayTotal = (recentInvoices || [])
      .filter(inv => inv.created_at && inv.created_at.startsWith(dayObj.date))
      .reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);
    return {
      date: dayObj.day,
      value: dayTotal
    };
  });

  // Occupancy Trend (Last 7 Days)
  const occupancyData = last7Days.map(dayObj => {
    const activeCount = (rangeBookings || []).filter(b =>
      b.check_in_date <= dayObj.date && b.check_out_date > dayObj.date
    ).length || 0;

    const percentage = totalRooms > 0 ? Math.round((activeCount / totalRooms) * 100) : 0;
    return { day: dayObj.day, value: percentage };
  });

  // Check-ins vs Check-outs (Last 7 Days)
  const checkInOutData = last7Days.map(dayObj => {
    const checkInsCount = (rangeBookings || []).filter(b => b.check_in_date === dayObj.date).length || 0;
    const checkOutsCount = (rangeBookings || []).filter(b => b.check_out_date === dayObj.date).length || 0;
    return { date: dayObj.day, checkIns: checkInsCount, checkOuts: checkOutsCount };
  });

  // Quick Stats object
  const quickStats = {
    totalBookings: metrics.totalBookings || 0,
    totalGuests: metrics.totalGuests || 0,
    avgStayDuration: metrics.avgStayDuration || 0,
    avgDailyRate: metrics.avgDailyRate || 0
  };

  return (
    <>
      {/* Client component wrapper handling realtime subscriptions without blocking SSR */}
      <DashboardClientWrapper />
      
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
          <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column' }}>
            <RevenueChart data={revenueData} />
          </div>
          <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column' }}>
            <RoomStatusChart data={roomChartData} />
          </div>
          <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column' }}>
            <CheckInOutChart data={checkInOutData} />
          </div>
          <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column' }}>
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
