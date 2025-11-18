// src/pages/AdminRooms.js
import React, { useEffect, useState } from "react"; 
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom"; // Import Link for navigation
import { fetchRooms, createRoom, updateRoom, seedRooms, deleteRoom } from "../services/roomsApi";

/* --- Styles --- */
const Page = styled(motion.main)`
  padding: 40px;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  min-height: 100vh;
  background-color: #f8f9fa; /* Light background for full width */
  font-family: 'Segoe UI', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;

  @media(max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: 28px;
  color: #111827;
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 4px 0 0 0;
  font-size: 14px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

/* Generic Button Styles */
const buttonStyles = `
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
  box-sizing: border-box;
`;

const Button = styled(motion.button)`
  ${buttonStyles}

  &.primary {
    background: #111827;
    color: white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    &:hover { background: #1f2937; transform: translateY(-1px); }
  }

  &.secondary {
    background: #ffffff;
    color: #374151;
    border: 1px solid #d1d5db;
    &:hover { background: #f9fafb; border-color: #9ca3af; color: #111827; }
  }

  &.danger {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    &:hover { background: #fecaca; }
  }

  &.danger-solid {
    background: #dc2626;
    color: white;
    &:hover { background: #b91c1c; }
  }
`;

/* Styled Link looking like a button */
const StyledLink = styled(Link)`
  ${buttonStyles}
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  &:hover { background: #f9fafb; border-color: #9ca3af; color: #111827; }
`;

/* --- Modal Styles --- */
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 32px;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 22px;
  color: #111827;
  font-weight: 700;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

/* Form Styles inside Modal */
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s;
  &:focus { 
    outline: none; 
    border-color: #3b82f6; 
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1); 
    background: #fff;
  }
`;

/* List Styles */
const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RoomRow = styled(motion.div)`
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: border-color 0.2s;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  
  @media(min-width: 640px) {
    grid-template-columns: 2fr 1fr auto;
  }
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RoomName = styled.div`
  font-weight: 700;
  font-size: 18px;
  color: #1f2937;
`;

const RoomMeta = styled.div`
  font-size: 14px;
  color: #6b7280;
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Pill = styled.span`
  background: #eff6ff;
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
`;

/* Animation Variants */
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.4 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for "Create Room" Modal
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", base_hourly_rate: 0, capacity: 2 });

  // State for "Delete Room" Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const rs = await fetchRooms();
      setRooms(rs || []);
    } catch (e) { alert(e.message || "Failed"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    try {
      await createRoom(newRoom);
      setNewRoom({ name: "", base_hourly_rate: 0, capacity: 2 });
      setCreateOpen(false);
      load();
    } catch (e) { alert(e.message || "Create failed"); }
  }

  async function onConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRoom(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      console.error(e);
      alert(e.message || "Delete failed");
    }
  }

  async function onSeed() {
    try {
      await seedRooms();
      load();
    } catch (e) { alert(e.message || "Seed failed"); }
  }

  return (
    <Page initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header>
        <TitleGroup>
          <Title>Room Management</Title>
          <Subtitle>Manage your workspace inventory and pricing.</Subtitle>
        </TitleGroup>
        
        <HeaderActions>
          {/* NEW ANALYTICS BUTTON */}
          <StyledLink to="/admin/analytics">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
            </svg>
            View Analytics
          </StyledLink>

          <Button className="secondary" onClick={onSeed} whileTap={{ scale: 0.95 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
               <path d="M21 3v5h-5" />
            </svg>
            Reset Data
          </Button>
          
          <Button className="primary" onClick={() => setCreateOpen(true)} whileTap={{ scale: 0.95 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <line x1="12" y1="5" x2="12" y2="19"></line>
               <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Room
          </Button>
        </HeaderActions>
      </Header>

      {/* Room List - Full Width */}
      <ListContainer>
        <AnimatePresence>
          {rooms.length === 0 ? (
             <div style={{ textAlign: 'center', color: '#9ca3af', padding: '60px' }}>No rooms found. Add one to get started.</div>
          ) : rooms.map((r, i) => (
            <RoomRow 
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RoomInfo>
                <RoomName>{r.name}</RoomName>
                <RoomMeta>
                  <Pill>{r.capacity} Persons</Pill>
                  <span>ID: {r.id}</span>
                </RoomMeta>
              </RoomInfo>

              <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                 ₹ {r.base_hourly_rate ?? r.baseHourlyRate} <span style={{fontSize:'13px', fontWeight:'400', color:'#9ca3af'}}>/ hr</span>
              </div>
              
              <div style={{ display: "flex", gap: 8, justifyContent: 'flex-end' }}>
                <Button 
                  className="secondary" 
                  style={{ height: 38, fontSize: 13 }}
                  onClick={() => {
                    const newRate = prompt("Enter new hourly rate for " + r.name, String(r.base_hourly_rate ?? r.baseHourlyRate));
                    if (newRate != null) {
                      updateRoom(r.id, { ...r, base_hourly_rate: Number(newRate)})
                        .then(() => load())
                        .catch(e => alert(e.message || "Failed"));
                    }
                  }}
                >
                  Edit Rate
                </Button>

                <Button
                  className="danger"
                  style={{ height: 38, fontSize: 13 }}
                  onClick={() => setDeleteTarget(r)}
                >
                  Delete
                </Button>
              </div>
            </RoomRow>
          ))}
        </AnimatePresence>
      </ListContainer>

      {/* --- CREATE ROOM MODAL (CENTERED) --- */}
      <AnimatePresence>
        {isCreateOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCreateOpen(false)}
          >
            <ModalContent
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} 
            >
              <ModalTitle>Add New Workspace</ModalTitle>
              <Form onSubmit={onCreate}>
                <InputGroup>
                  <Label>Room Name</Label>
                  <Input 
                    autoFocus
                    placeholder="e.g. Executive Suite" 
                    value={newRoom.name} 
                    onChange={e => setNewRoom({...newRoom, name: e.target.value})} 
                    required
                  />
                </InputGroup>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <InputGroup>
                    <Label>Hourly Rate (₹)</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={newRoom.base_hourly_rate} 
                      onChange={e => setNewRoom({...newRoom, base_hourly_rate: Number(e.target.value)})} 
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label>Capacity</Label>
                    <Input 
                      type="number" 
                      placeholder="2" 
                      value={newRoom.capacity} 
                      onChange={e => setNewRoom({...newRoom, capacity: Number(e.target.value)})} 
                      required
                    />
                  </InputGroup>
                </div>
                
                <ModalFooter>
                  <Button type="button" className="secondary" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="primary">
                    Create Room
                  </Button>
                </ModalFooter>
              </Form>
            </ModalContent>
          </Overlay>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL (CENTERED) --- */}
      <AnimatePresence>
        {deleteTarget && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
          >
            <ModalContent
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '400px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '50%', color: '#dc2626' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </div>
                <ModalTitle>Delete {deleteTarget.name}?</ModalTitle>
                <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.5' }}>
                  Are you sure you want to delete this room? This action cannot be undone and will remove all associated bookings.
                </p>
              </div>
              
              <ModalFooter style={{ justifyContent: 'center', width: '100%' }}>
                <Button className="secondary" onClick={() => setDeleteTarget(null)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button className="danger-solid" onClick={onConfirmDelete} style={{ flex: 1 }}>
                  Yes, Delete
                </Button>
              </ModalFooter>
            </ModalContent>
          </Overlay>
        )}
      </AnimatePresence>
    </Page>
  );
}