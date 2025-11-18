import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { fetchBookings, cancelBooking } from "../services/bookingsApi";
import { isoToDisplay } from "../utils/time";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* Styles */
const Page = styled.main`
  padding: 32px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: 'Segoe UI', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 28px;
  color: #111827;
  margin: 0;
`;

const Nav = styled.nav`
  display: flex;
  gap: 12px;
  
  a {
    text-decoration: none;
    color: #4b5563;
    font-weight: 600;
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background 0.2s;
    &:hover { background: #e5e7eb; color: #111827; }
  }
`;

/* Filter Bar */
const FilterBar = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
`;

const DateInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  &:focus { outline-color: #3b82f6; }
`;

const FilterBtn = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  height: 40px;
  &:disabled { opacity: 0.7; }
`;

/* Booking List Container */
const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/* Individual Booking Row */
const BookingRow = styled(motion.div)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: border-color 0.2s;

  &:hover {
    border-color: #3b82f6;
  }

  @media(min-width: 768px) {
    grid-template-columns: 2fr 2fr 1fr auto;
  }
`;

const Cell = styled.div`
  display: flex;
  flex-direction: column;
`;

const RoomName = styled(Link)`
  font-weight: 700;
  font-size: 16px;
  color: #111827;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const Meta = styled.span`
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
`;

const Price = styled.div`
  font-weight: 700;
  color: #111827;
  font-size: 16px;
`;

const StatusPill = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  
  background: ${props => props.status === 'CANCELLED' ? '#fef2f2' : '#ecfdf5'};
  color: ${props => props.status === 'CANCELLED' ? '#b91c1c' : '#047857'};
`;

const CancelBtn = styled.button`
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  &:hover { border-color: #ef4444; color: #ef4444; background: #fff1f2; }
`;

export default function BookingsList() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchBookings({ from: from || undefined, to: to || undefined });
      setBookings(res || []);
    } catch (e) {
      alert(e.message || "Failed to load");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function onCancel(bid) {
    if (!window.confirm("Cancel booking?")) return;
    try {
      await cancelBooking(bid);
      setBookings((s) => s.map(b => (b.bookingId === bid || b.id === bid ? { ...b, status: "CANCELLED" } : b)));
    } catch (e) {
      alert(e.message || "Cancel failed");
    }
  }

  return (
    <Page>
      <Header>
        <Title>Bookings Dashboard</Title>
        <Nav>
          <Link to="/admin/rooms">Manage Rooms</Link>
          <Link to="/admin/analytics">Analytics</Link>
        </Nav>
      </Header>

      <FilterBar>
        <FilterGroup>
          <Label>From Date</Label>
          <DateInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </FilterGroup>
        <FilterGroup>
          <Label>To Date</Label>
          <DateInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </FilterGroup>
        <FilterBtn onClick={load} disabled={loading}>
          {loading ? "Updating..." : "Apply Filter"}
        </FilterBtn>
      </FilterBar>

      <ListContainer>
        <AnimatePresence>
          {bookings.length === 0 ? (
            <div style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>
              No bookings found for this period.
            </div>
          ) : bookings.map(b => (
            <BookingRow 
              key={b.bookingId || b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Col 1: Info */}
              <Cell>
                <RoomName to={`/bookings/${b.bookingId || b.id}`}>
                  {b.roomName || `Room ${b.roomId}`}
                </RoomName>
                <Meta>User: {b.userName}</Meta>
              </Cell>

              {/* Col 2: Time */}
              <Cell>
                <div style={{fontSize:'14px', color:'#374151'}}>
                  {isoToDisplay(b.startTime)} 
                </div>
                <Meta>to {isoToDisplay(b.endTime)}</Meta>
              </Cell>

              {/* Col 3: Price & Status */}
              <Cell>
                <Price>₹ {b.totalPrice ?? "-"}</Price>
                <div><StatusPill status={b.status}>{b.status || "CONFIRMED"}</StatusPill></div>
              </Cell>

              {/* Col 4: Actions */}
              <div>
                 {b.status !== "CANCELLED" && (
                   <CancelBtn onClick={() => onCancel(b.bookingId || b.id)}>Cancel</CancelBtn>
                 )}
              </div>
            </BookingRow>
          ))}
        </AnimatePresence>
      </ListContainer>
    </Page>
  );
}