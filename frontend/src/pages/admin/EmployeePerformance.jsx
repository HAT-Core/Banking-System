import { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import api from '../utils/api'; 

export default function EmployeePerformance() {
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const { data } = await api.get('/admin/dashboard/performance');
        setPerformanceData(data);
      } 
      catch (error) {
        console.error("Failed to fetch performance data", error);
      }
    };
    
    fetchPerformance();
  }, []);

  return (
    <Box sx={{ p: { xs: 3, md: 5 }, minHeight: '100vh', background: '#0A0A0A' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <QueryStatsRoundedIcon sx={{ color: '#60A5FA', fontSize: 28 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
            Employee Performance
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            Track KYC verifications, account openings, and loan approvals for each employee.
          </Typography>
        </Box>
      </Box>

      <TableContainer sx={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ background: 'rgba(0,0,0,0.4)' }}>
            <TableRow>
              <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Employee ID</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Employee Name</TableCell>
              <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>KYC Verified</TableCell>
              <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Accounts Opened</TableCell>
              <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Loans Approved</TableCell>
              <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Total Loan Volume</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {performanceData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: 'rgba(255,255,255,0.4)', py: 6, borderBottom: 'none' }}>
                  No staff performance data available.
                </TableCell>
              </TableRow>
            ) : (
              performanceData.map((staff) => (
                <TableRow key={staff.employee_id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>#{staff.employee_id}</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    {staff.employee_name}
                    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 400, mt: 0.5 }}>{staff.job_title}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>{staff.total_kyc_verified}</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>{staff.total_accounts_opened}</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>{staff.total_loans_approved}</TableCell>
                  <TableCell align="right" sx={{ color: '#60A5FA', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    PKR {staff.total_loan_value.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}