import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom"; // Added Link for navigation
import RoomCard from "../components/RoomCard";
import { fetchRooms } from "../services/roomsApi";

// --- Animations ---
const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// --- Styled Components ---
const Page = styled.main`
  padding: 32px;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  
  @media(max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin: 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.span`
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap; /* Ensures buttons wrap on very small screens */
`;

/* Secondary Button (Refresh) */
const RefreshBtn = styled(motion.button)`
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #111827;
  }
`;

/* Primary Admin Button */
const AdminLink = styled(Link)`
  background: #111827;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: background 0.2s, transform 0.1s;

  &:hover {
    background: #1f2937;
  }
  &:active {
    transform: scale(0.98);
  }
`;

/* Grid Layout */
const Grid = styled(motion.section)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;

  @media(min-width: 640px){
    grid-template-columns: repeat(2, 1fr);
  }
  @media(min-width: 1024px){
    grid-template-columns: repeat(3, 1fr);
  }
  @media(min-width: 1440px){
    grid-template-columns: repeat(4, 1fr);
  }
  @media(min-width: 1920px){
    grid-template-columns: repeat(5, 1fr);
  }
`;

const StatusBox = styled(motion.div)`
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  background: ${props => props.error ? '#fef2f2' : '#ffffff'};
  border: 1px solid ${props => props.error ? '#fecaca' : '#e5e7eb'};
  color: ${props => props.error ? '#991b1b' : '#4b5563'};
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  font-weight: 500;
  max-width: 600px;
  margin: 40px auto;
`;

const SkeletonCard = styled.div`
  height: 280px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
    background-repeat: no-repeat;
    background-size: 1000px 100%;
    animation: ${shimmer} 1.5s infinite linear;
  }
`;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  async function loadRooms() {
    setLoading(true);
    setError(undefined);
    try {
      const rs = await fetchRooms();
      setRooms(rs);
    } catch (err) {
      console.error("Failed to fetch rooms", err);
      setError("Failed to load rooms. Showing demo rooms.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <Page>
      <Header>
        <TitleGroup>
          <Title>Workspace Booking</Title>
          <Subtitle>Asia/Kolkata • {new Date().toLocaleDateString()}</Subtitle>
        </TitleGroup>
        
        <Controls>
          {/* NEW ADMIN BUTTON */}
          <AdminLink to="/admin/rooms">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M12 8v4"/>
              <path d="M12 16h.01"/>
            </svg>
            Admin Panel
          </AdminLink>

          <RefreshBtn 
            onClick={loadRooms} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Refresh
          </RefreshBtn>
        </Controls>
      </Header>

      {loading ? (
        <Grid>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
             <SkeletonCard key={n} />
          ))}
        </Grid>
      ) : (
        <AnimatePresence mode="wait">
          {error ? (
            <StatusBox 
              error 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </StatusBox>
          ) : rooms.length === 0 ? (
            <StatusBox
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
            >
              No rooms available at the moment.
            </StatusBox>
          ) : (
            <Grid
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {rooms.map((r) => (
                <RoomCard key={r.id} room={r} />
              ))}
            </Grid>
          )}
        </AnimatePresence>
      )}
    </Page>
  );
}