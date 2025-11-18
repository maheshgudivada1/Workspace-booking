import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchRooms } from "../services/roomsApi";
import { estimatePrice } from "../services/pricing";
import { createBooking } from "../services/bookingsApi";

/* --- Layout Components --- */
const Page = styled(motion.main)`
  padding: 32px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: 'Segoe UI', sans-serif;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
`;

const BackLink = styled(Link)`
  font-size: 14px;
  color: #6b7280;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  &:hover { color: #111827; }
`;

const Title = styled.h1`
  font-size: 28px;
  margin: 0;
  color: #111827;
`;

/* Grid Layout for Form & Sidebar */
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  
  @media(min-width: 900px) {
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }
`;

const Card = styled(motion.div)`
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #f3f4f6;
`;

/* Form Inputs */
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  font-size: 15px;
  transition: all 0.2s;
  
  &:focus { 
    outline: none;
    border-color: #3b82f6;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
  }
  
  &[aria-invalid="true"] {
    border-color: #ef4444;
    background: #fef2f2;
  }
`;

/* Sidebar Specifics */
const StickySidebar = styled.aside`
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PriceCard = styled(Card)`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 24px;
`;

const TotalPrice = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin: 8px 0;
  letter-spacing: -1px;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #64748b;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child { border-bottom: none; }
  strong { color: #334155; font-weight: 600; }
`;

const SubmitBtn = styled(motion.button)`
  background: #111827;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const ErrorMsg = styled(motion.div)`
  color: #b91c1c;
  font-size: 13px;
  background: #fef2f2;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

/* Animations */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [roomsLoaded, setRoomsLoaded] = useState(false);
  const [userName, setUserName] = useState("");
  const [startLocal, setStartLocal] = useState(""); 
  const [endLocal, setEndLocal] = useState("");
  const [errors, setErrors] = useState({});
  const [est, setEst] = useState({ total: 0, breakdown: [] });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // --- Logic remains exactly as provided ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rooms = await fetchRooms();
        if (!mounted) return;
        const r = rooms.find((x) => String(x.id) === String(id)) || rooms[0] || null;
        setRoom(r);
        setRoomsLoaded(true);
      } catch (e) {
        console.error(e);
        setRoomsLoaded(true);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  useEffect(() => {
    if (!room) return;
    setServerError(null);
    const validation = validateInputs({ userName, startLocal, endLocal, room });
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      try {
        const { total, breakdown } = estimatePrice({
          baseHourlyRate: room.base_hourly_rate,
          startLocal,
          endLocal
        });
        setEst({ total, breakdown });
      } catch (e) {
        setEst({ total: 0, breakdown: [] });
      }
    } else {
      setEst({ total: 0, breakdown: [] });
    }
  }, [userName, startLocal, endLocal, room]);

  function validateInputs({ userName, startLocal, endLocal, room }) {
    const err = {};
    if (!userName || userName.trim().length < 2) err.userName = "Please enter your name";
    if (!startLocal) err.startLocal = "Select start time";
    if (!endLocal) err.endLocal = "Select end time";
    if (startLocal && endLocal) {
      const startISO = localToIstISO(startLocal);
      const endISO = localToIstISO(endLocal);
      const s = new Date(startISO);
      const e = new Date(endISO);
      if (!(s < e)) err.range = "Start time must be before end time";
      const durationMs = e - s;
      const hours = durationMs / (1000 * 60 * 60);
      if (hours > 12) err.range = "Maximum booking duration is 12 hours";
      const now = new Date();
      if (s.getTime() <= now.getTime()) err.startLocal = "Start time must be in the future";
    }
    return err;
  }

  function localToIstISO(localDateTimeStr) {
    if (!localDateTimeStr) return null;
    const [datePart, timePart] = localDateTimeStr.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm] = timePart.split(":").map(Number);
    const istMillis = Date.UTC(y, m - 1, d, hh, mm); 
    const offset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; 
    const utcMillis = istMillis - offset;
    const dUtc = new Date(utcMillis);
    return dUtc.toISOString();
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    if (!room) return;
    setServerError(null);
    const validation = validateInputs({ userName, startLocal, endLocal, room });
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setSubmitting(true);

    const payload = {
      roomId: room.id,
      userName: userName.trim(),
      startTime: localToIstISO(startLocal),
      endTime: localToIstISO(endLocal)
    };

    try {
      const res = await createBooking(payload);
      navigate(`/bookings/${res.bookingId}`); // Direct navigation for better UX
    } catch (err) {
      console.error(err);
      if (err && err.message) setServerError(err.message);
      else setServerError("Failed to create booking. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!roomsLoaded) return <Page>Loading room details...</Page>;
  if (!room) return <Page>Room not found.</Page>;

  return (
    <Page variants={pageVariants} initial="initial" animate="animate">
      <Header>
        <BackLink to="/rooms">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Rooms
        </BackLink>
        <Title>Book {room.name}</Title>
        <div style={{color: '#6b7280'}}>Capacity: {room.capacity} persons • Base Rate: ₹{room.base_hourly_rate}/hr</div>
      </Header>

      <Container>
        {/* Left Side: Form */}
        <Card>
          <form onSubmit={onSubmit}>
            <FormGroup>
              <Label>
                Full Name
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. John Doe"
                  aria-invalid={!!errors.userName}
                />
                {errors.userName && <ErrorMsg initial={{opacity:0}} animate={{opacity:1}}>{errors.userName}</ErrorMsg>}
              </Label>

              <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <Label>
                  Start Time (IST)
                  <Input
                    type="datetime-local"
                    value={startLocal}
                    onChange={(e) => setStartLocal(e.target.value)}
                    aria-invalid={!!errors.startLocal || !!errors.range}
                  />
                  {errors.startLocal && <ErrorMsg>{errors.startLocal}</ErrorMsg>}
                </Label>

                <Label>
                  End Time (IST)
                  <Input
                    type="datetime-local"
                    value={endLocal}
                    onChange={(e) => setEndLocal(e.target.value)}
                    aria-invalid={!!errors.endLocal || !!errors.range}
                  />
                  {errors.endLocal && <ErrorMsg>{errors.endLocal}</ErrorMsg>}
                </Label>
              </div>
              
              {errors.range && <ErrorMsg>{errors.range}</ErrorMsg>}
              {serverError && <ErrorMsg>{serverError}</ErrorMsg>}
            </FormGroup>
          </form>
        </Card>

        {/* Right Side: Pricing Sidebar */}
        <StickySidebar>
          <PriceCard>
            <h3 style={{margin: '0 0 16px 0', fontSize:'16px', color:'#64748b', textTransform:'uppercase', letterSpacing:'1px'}}>Estimated Cost</h3>
            
            {est.breakdown.length > 0 ? (
              <>
                <div>
                  {est.breakdown.map((b, idx) => (
                    <BreakdownItem key={idx}>
                      <span>{b.label} <small>({b.minutes}m)</small></span>
                      <strong>₹{b.amount.toFixed(2)}</strong>
                    </BreakdownItem>
                  ))}
                </div>
                <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '2px dashed #cbd5e1'}}>
                  <div style={{fontSize:'14px', color:'#64748b'}}>Total Payable</div>
                  <TotalPrice>₹ {est.total.toFixed(2)}</TotalPrice>
                </div>
              </>
            ) : (
              <div style={{textAlign:'center', color:'#94a3b8', padding:'20px 0'}}>
                Select dates to see price estimation
              </div>
            )}
            
            <SubmitBtn 
              onClick={onSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting || Object.keys(errors).length > 0}
            >
              {submitting ? "Processing..." : "Confirm Booking"}
            </SubmitBtn>

            <div style={{marginTop: '16px', fontSize:'12px', color:'#94a3b8', lineHeight:'1.5'}}>
              <strong>Peak Hours (1.5x):</strong> Mon–Fri 10–13 & 16–19.
            </div>
          </PriceCard>
        </StickySidebar>
      </Container>
    </Page>
  );
}