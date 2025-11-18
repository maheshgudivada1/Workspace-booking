import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoomsList from './pages/RoomList'
import GlobalStyles from './styles/GlobalStyle'
import BookingForm from "./pages/BookingForm";
import BookingView from "./pages/BookingView";
import BookingsList from "./pages/BookingsList";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminRooms from "./pages/AdminRooms";

/**
 * Root app. Add other routes later:
 * /rooms/:id/book  -> Booking form
 * /bookings -> Bookings list
 * /admin/analytics -> Analytics
 */
export default function App() {
  return (
    <>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={<Navigate to="/rooms" replace />} />
        <Route path="/rooms" element={<RoomsList />} />
        <Route path="/rooms/:id/book" element={<BookingForm />} />
         <Route path="/bookings" element={<BookingsList />} />
        <Route path="/bookings/:id" element={<BookingView />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/rooms" element={<AdminRooms />} />
        {/* future routes */}
        <Route path="*" element={<div style={{ padding: 24 }}>404 — Page not found</div>} />
      </Routes>
    </>
  );
}
