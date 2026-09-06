# Ave Vista Resort PMS

A modern, nature-inspired Property Management System for Ave Vista Resort.
Built with Next.js 14+ and Vanilla CSS.

## Getting Started

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Dashboard**: Real-time overview of occupancy and revenue.
- **Bookings**: Visual Availability Calendar and Booking Management.
- **Rooms**: Housekeeping and Room Status tracking.
- **Guests**: Guest profiles and history.

## Project Structure

- `/src`: Application source code (pages, components, lib, hooks, services).
- `/supabase`: Database assets
  - `/schemas`: Base table schemas, RLS policies, and RPC definitions.
  - `/migrations`: Incremental migration and alter scripts.
  - `/seeds`: Room and expense seed/dummy data.
  - `/queries`: Diagnostic and test SQL queries.
  - `/functions`: Supabase Edge Functions.
- `/scripts`: Verification, test, and utility scripts.
- `/docs`: Technical specifications and feature documentation.
- `/public`: Static web assets and icons.

