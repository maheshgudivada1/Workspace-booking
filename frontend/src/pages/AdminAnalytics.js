import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { fetchAnalytics } from "../services/analyticsApi";

/* --- Styles --- */
const Page = styled(motion.main)`
  padding: 32px;
  max-width: 1100px;
  margin: 0 auto;
  font-family: 'Segoe UI', sans-serif;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 28px;
  color: #111827;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
  font-size: 14px;
`;

/* Filter Section */
const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
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

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  &:focus { outline: none; border-color: #3b82f6; }
`;

const FetchBtn = styled(motion.button)`
  background: #0f172a;
  color: white;
  border: none;
  padding: 10px 24px;
  height: 40px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

/* KPI Cards Grid */
const KPIs = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 32px;
  
  @media(min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(motion.div)`
  padding: 24px;
  border-radius: 16px;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 120px;

  /* Variant styling */
  ${props => props.variant === 'revenue' && `
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  `}
  
  ${props => props.variant === 'hours' && `
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  `}
`;

const StatTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
`;

/* Data Table */
const TableCard = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden; /* Clips corners for table */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  
  th {
    background: #f8fafc;
    padding: 16px;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    font-size: 14px;
  }

  tr:last-child td { border-bottom: none; }
  
  tr:hover td {
    background: #f8fafc;
  }
`;

export default function AdminAnalytics() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const rows = await fetchAnalytics({ from: from || undefined, to: to || undefined });
      setData(rows || []);
    } catch (e) {
      alert(e.message || "Failed to load analytics");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const totals = data.reduce((acc, r) => {
    acc.hours += r.totalHours || 0;
    acc.revenue += r.totalRevenue || 0;
    return acc;
  }, { hours: 0, revenue: 0 });

  return (
    <Page initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header>
        <Title>Performance Overview</Title>
        <Subtitle>Track revenue and occupancy metrics.</Subtitle>
      </Header>

      <FilterBar>
        <FilterGroup>
          <Label>From Date</Label>
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </FilterGroup>
        <FilterGroup>
          <Label>To Date</Label>
          <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </FilterGroup>
        <FetchBtn 
          onClick={load} 
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? "Analyzing..." : "Generate Report"}
        </FetchBtn>
      </FilterBar>

      <KPIs>
        <StatCard 
          variant="revenue"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <StatTitle>Total Revenue</StatTitle>
          <StatValue>₹ {totals.revenue.toLocaleString()}</StatValue>
        </StatCard>

        <StatCard 
          variant="hours"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <StatTitle>Booked Hours</StatTitle>
          <StatValue>{totals.hours} <span style={{fontSize: '20px', opacity: 0.8}}>hrs</span></StatValue>
        </StatCard>
      </KPIs>

      <TableCard>
        <Table>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Room Name</th>
              <th style={{ width: '30%' }}>Total Hours</th>
              <th style={{ width: '30%' }}>Revenue Generated</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No data found for this period.</td></tr>
            ) : (
              data.map((r, idx) => (
                <tr key={r.roomId}>
                  <td style={{ fontWeight: 600 }}>{r.roomName || `Room ${r.roomId}`}</td>
                  <td>{r.totalHours} hrs</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>₹ {r.totalRevenue}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableCard>
    </Page>
  );
}