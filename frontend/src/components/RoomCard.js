import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } }
};

const Card = styled(motion.article)`
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: box-shadow 0.3s ease;
  height: 100%; /* Vital for grid alignment */
  box-sizing: border-box;

  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: rgba(59, 130, 246, 0.3);
    z-index: 1; /* Ensure it floats above others if scaling */
  }
`;

const TopAccent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Name = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const Description = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagsRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: 12px;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  
  &.capacity {
    background: #eff6ff;
    color: #2563eb;
  }
`;

const Footer = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
`;

const PriceBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  font-size: 11px;
  text-transform: uppercase;
  color: #9ca3af;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const Rate = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  
  span {
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
  }
`;

const BookBtn = styled(motion.button)`
  background: #111827;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  white-space: nowrap;
`;

export default function RoomCard({ room }) {
  const navigate = useNavigate();
  const { id, name, base_hourly_rate, capacity, description } = room;

  function onBook() {
    navigate(`/rooms/${id}/book`);
  }

  return (
    <Card 
      variants={itemVariants}
      layout
      whileHover={{ y: -8 }}
      role="article"
    >
      <TopAccent />
      
      <HeaderRow>
        <div>
          <Name>{name}</Name>
          <Description>
            {description || "A professional space equipped with high-speed Wi-Fi, ergonomic seating, and modern AV tools."}
          </Description>
        </div>
      </HeaderRow>

      <TagsRow>
        <Pill className="capacity">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
             <circle cx="9" cy="7" r="4"></circle>
             <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
             <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
           </svg>
           {capacity} Persons
        </Pill>
      </TagsRow>

      <Footer>
        <PriceBlock>
          <Label>Rate per hour</Label>
          <Rate>₹{base_hourly_rate}<span>/hr</span></Rate>
        </PriceBlock>

        <BookBtn 
          onClick={onBook}
          whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
          whileTap={{ scale: 0.95 }}
        >
          Book Now
        </BookBtn>
      </Footer>
    </Card>
  );
}