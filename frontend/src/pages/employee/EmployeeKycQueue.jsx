import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, Button, CircularProgress,
  Alert, Snackbar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import CheckCircleRoundedIcon   from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon        from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import RefreshRoundedIcon       from '@mui/icons-material/RefreshRounded';
import api from '../utils/api';

const ACCENT = '#9FFF98';

export default function EmployeeKycQueue() {
  const [customers,     setCustomers]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [actionLoading, setActionLoading] = useState(null); // customer_id currently being processed
  const [snackbar,      setSnackbar]      = useState({ open: false, message: '', severity: 'success' });

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/kyc/pending');
      setCustomers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch KYC queue. Make sure you are logged in as an employee.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const handleAction = async (customerId, status) => {
    setActionLoading(customerId);
    try {
      await api.put(`/kyc/${customerId}/status`, { status });
      setSnackbar({
        open: true,
        message: `Customer #${customerId} has been ${status === 'verified' ? 'approved ✓' : 'rejected'}.`,
        severity: status === 'verified' ? 'success' : 'warning',
      });
      // Remove from list immediately so the UI feels instant
      setCustomers(prev => prev.filter(c => c.customer_id !== customerId));
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Action failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const closeSnackbar = () => setSnackbar(p => ({ ...p, open: false }));

  return (
    <Box>
      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
            KYC Verification Queue
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>
            Review and process pending customer verification requests
          </Typography>
        </Box>

        <Button
          onClick={fetchQueue}
          startIcon={<RefreshRoundedIcon />}
          disabled={loading}
          sx={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, px: 2.5, py: 1, '&:hover': { background: 'rgba(255,255,255,0.05)', color: '#fff' } }}
        >
          Refresh
        </Button>
      </Box>

      {/* ── Stats Badge ── */}
      {!loading && !error && (
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Box sx={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HourglassEmptyRoundedIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
            <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
              <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 20 }}>{customers.length}</span>
              {' '}pending {customers.length === 1 ? 'application' : 'applications'}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Loading ── */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 10 }}>
          <CircularProgress sx={{ color: ACCENT }} />
        </Box>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 3 }}>{error}</Alert>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && customers.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 64, color: ACCENT, mb: 2, filter: `drop-shadow(0 0 16px ${ACCENT})` }} />
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>All Clear!</Typography>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', mt: 1 }}>
            No pending KYC applications at this time.
          </Typography>
        </Box>
      )}

      {/* ── Table ── */}
      {!loading && !error && customers.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', py: 2, background: 'rgba(255,255,255,0.02)' } }}
              >
                <TableCell>Customer</TableCell>
                <TableCell>CNIC</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {customers.map((c) => (
                <TableRow
                  key={c.customer_id}
                  sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(255,255,255,0.04)', color: '#fff', py: 2.5 }, '&:hover': { background: 'rgba(255,255,255,0.015)' }, transition: 'background 0.15s' }}
                >
                  {/* Name + ID */}
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{c.first_name} {c.last_name}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', mt: 0.3 }}>ID: {c.customer_id}</Typography>
                  </TableCell>

                  {/* CNIC */}
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: 0.5 }}>{c.cnic}</TableCell>

                  {/* Phone */}
                  <TableCell sx={{ fontSize: 13 }}>{c.phone}</TableCell>

                  {/* Address */}
                  <TableCell sx={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', maxWidth: 200 }}>{c.address}</TableCell>

                  {/* Date */}
                  <TableCell sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                    {new Date(c.created_at).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>

                  {/* Status chip */}
                  <TableCell>
                    <Chip
                      label="Pending"
                      size="small"
                      sx={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)', fontWeight: 600, fontSize: 11 }}
                    />
                  </TableCell>

                  {/* Action buttons */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        disabled={actionLoading === c.customer_id}
                        startIcon={
                          actionLoading === c.customer_id
                            ? <CircularProgress size={12} sx={{ color: '#0A0A0A' }} />
                            : <CheckCircleRoundedIcon fontSize="small" />
                        }
                        onClick={() => handleAction(c.customer_id, 'verified')}
                        sx={{ background: ACCENT, color: '#0A0A0A', fontWeight: 700, fontSize: 12, px: 2, py: 0.8, borderRadius: '8px', textTransform: 'none', minWidth: 100, '&:hover': { background: '#7AFF72', boxShadow: `0 0 16px rgba(159,255,152,0.35)` }, '&:disabled': { background: 'rgba(159,255,152,0.25)', color: 'rgba(0,0,0,0.5)' } }}
                      >
                        Approve
                      </Button>

                      <Button
                        size="small"
                        disabled={actionLoading === c.customer_id}
                        startIcon={<CancelRoundedIcon fontSize="small" />}
                        onClick={() => handleAction(c.customer_id, 'rejected')}
                        sx={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', fontWeight: 600, fontSize: 12, px: 2, py: 0.8, borderRadius: '8px', textTransform: 'none', '&:hover': { background: 'rgba(239,68,68,0.08)', borderColor: '#EF4444' }, '&:disabled': { opacity: 0.4 } }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={closeSnackbar}
          sx={{
            background: snackbar.severity === 'success'  ? 'rgba(74,222,128,0.12)'
                      : snackbar.severity === 'warning'  ? 'rgba(245,158,11,0.12)'
                      : 'rgba(239,68,68,0.12)',
            border: `1px solid ${
              snackbar.severity === 'success'  ? 'rgba(74,222,128,0.3)'
            : snackbar.severity === 'warning'  ? 'rgba(245,158,11,0.3)'
            : 'rgba(239,68,68,0.3)'}`,
            color: '#fff',
            borderRadius: '12px',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
