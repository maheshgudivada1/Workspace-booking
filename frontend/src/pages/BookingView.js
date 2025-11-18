import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getBookingById, cancelBooking } from "../services/bookingsApi";
import { isoToDisplay } from "../utils/time";
import { fetchRooms } from "../services/roomsApi";

const Page = styled(motion.main)`
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Segoe UI', sans-serif;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  text-decoration: none;
  margin-bottom: 24px;
  font-weight: 500;
  &:hover { color: #0f172a; }
`;

/* The "Ticket" Card */
const TicketCard = styled.div`
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  border: 1px solid #f1f5f9;
`;

const TicketHeader = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  color: white;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TicketBody = styled.div`
  padding: 32px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  
  @media(max-width: 500px){ grid-template-columns: 1fr; }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 1px;
  color: #94a3b8;
  font-weight: 700;
`;

const Value = styled.span`
  font-size: 16px;
  color: #1e293b;
  font-weight: 500;
`;

/* Status Badge */
const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  
  ${props => props.status === 'CONFIRMED' && `
    background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;
  `}
  ${props => props.status === 'CANCELLED' && `
    background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;
  `}
`;

const ActionRow = styled.div`
  border-top: 1px solid #f1f5f9;
  padding-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 14px;
  transition: opacity 0.2s;
  
  &.secondary {
    background: #f1f5f9;
    color: #475569;
    &:hover { background: #e2e8f0; }
  }
  
  &.danger {
    background: #fff1f2;
    color: #e11d48;
    border: 1px solid #fecdd3;
    &:hover { background: #ffe4e6; }
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function BookingView() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const b = await getBookingById(id);
        if (!m) return;
        setBooking(b);
        const rs = await fetchRooms();
        setRooms(rs);
      } catch (e) {
        setError(e.message || "Failed to load booking");
      } finally { if (m) setLoading(false); }
    })();
    return () => (m = false);
  }, [id]);

  if (loading) return <Page>Loading booking...</Page>;
  if (error) return <Page>Error: {error}</Page>;
  if (!booking) return <Page>Booking not found</Page>;

  const start = new Date(booking.startTime);
  const canCancel = (() => {
    const now = new Date();
    const diffMs = start.getTime() - now.getTime();
    return diffMs > 2 * 60 * 60 * 1000; // > 2 hours
  })();

  async function onCancel() {
    if (!canCancel) return;
    if(!window.confirm("Are you sure you want to cancel this booking?")) return;
    setProcessing(true);
    try {
      await cancelBooking(booking.bookingId || booking.id);
      const refreshed = await getBookingById(booking.bookingId || booking.id).catch(() => null);
      if (refreshed) setBooking(refreshed);
      else setBooking({ ...booking, status: "CANCELLED" });
    } catch (e) {
      alert(e.message || "Cancel failed");
    } finally {
      setProcessing(false);
    }
  }

  const room = rooms.find(r => String(r.id) === String(booking.roomId)) || { name: booking.roomName || booking.roomId };
  const status = booking.status || "CONFIRMED";

  return (
    <Page initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}}>
      <BackLink to="/bookings">← Back to My Bookings</BackLink>
      
      <TicketCard>
        <TicketHeader>
          <div>
            <div style={{opacity:0.8, fontSize:'13px'}}>Booking Reference</div>
            <div style={{fontSize:'24px', fontWeight:'700', fontFamily:'monospace'}}>
              #{booking.bookingId || booking.id}
            </div>
          </div>
          <StatusBadge status={status}>{status}</StatusBadge>
        </TicketHeader>

        <TicketBody>
          <Grid>
            <InfoItem>
              <Label>Guest Name</Label>
              <Value>{booking.userName}</Value>
            </InfoItem>
            <InfoItem>
              <Label>Room</Label>
              <Value>{room.name}</Value>
            </InfoItem>
            <InfoItem>
              <Label>Start Time</Label>
              <Value>{isoToDisplay(booking.startTime)}</Value>
            </InfoItem>
            <InfoItem>
              <Label>End Time</Label>
              <Value>{isoToDisplay(booking.endTime)}</Value>
            </InfoItem>
            <InfoItem>
              <Label>Total Paid</Label>
              <Value style={{fontSize:'20px', fontWeight:'700'}}>₹ {booking.totalPrice ?? "-"}</Value>
            </InfoItem>
          </Grid>

          <ActionRow>
            <Button className="secondary" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
              Copy Link
            </Button>
            
            {status !== "CANCELLED" && (
              <Button 
                className="danger" 
                onClick={onCancel} 
                disabled={!canCancel || processing}
                title={!canCancel ? "Cancellation allowed only > 2 hours before start" : ""}
              >
                {processing ? "Cancelling..." : "Cancel Booking"}
              </Button>
            )}
          </ActionRow>

          {!canCancel && status !== "CANCELLED" && (
             <div style={{marginTop:'16px', fontSize:'12px', color:'#b45309', background:'#fffbeb', padding:'10px', borderRadius:'8px'}}>
               ⚠️ Bookings cannot be cancelled within 2 hours of the start time.
             </div>
          )}
        </TicketBody>
      </TicketCard>
    </Page>
  );
}