import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress,
  Alert, Chip, Tooltip, Snackbar,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Slider,
} from '@mui/material';
import WarningAmberRoundedIcon  from '@mui/icons-material/WarningAmberRounded';
import AcUnitRoundedIcon        from '@mui/icons-material/AcUnitRounded';
import LockOpenRoundedIcon      from '@mui/icons-material/LockOpenRounded';
import RefreshRoundedIcon       from '@mui/icons-material/RefreshRounded';
import ErrorOutlineRoundedIcon  from '@mui/icons-material/ErrorOutlineRounded';
import api from '../utils/api';

const ACCENT     = '#9FFF98';
const DANGER     = '#EF4444';
const WARN       = '#F59E0B';

const cellSx = {
  color: 'rgba(255,255,255,0.75)',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  fontSize: 13,
  py: 1.8,
};

const headCellSx = {
  color: 'rgba(255,255,255,0.35)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.8,
  py: 1.5,
};

export default function EmployeeDelinquent() {
  const [accounts,  setAccounts]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [threshold, setThreshold] = useState(1);
  const [freezing,   setFreezing]   = useState(null);
  const [unfreezing, setUnfreezing] = useState(null);
  const [snackbar,  setSnackbar]  = useState({ open: false, message: '', severity: 'success' });

  const fetchDelinquent = useCallback(async (t = threshold) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/delinquent?threshold=${t}`);
      setAccounts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load delinquent accounts.');
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    fetchDelinquent(threshold);
  }, []); 

  const handleThresholdChange = (_, val) => setThreshold(val);
  const handleThresholdCommit = (_, val) => fetchDelinquent(val);

  const handleFreeze = async (accountId) => {
    setFreezing(accountId);
    try {
      await api.patch(`/delinquent/${accountId}/freeze`);
      setSnackbar({ open: true, message: `Account #${accountId} frozen successfully.`, severity: 'success' });
      
      setAccounts(prev =>
        prev.map(a => a.account_id === accountId ? { ...a, account_status: 'frozen' } : a)
      );
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || `Failed to freeze account #${accountId}.`,
        severity: 'error',
      });
    } finally {
      setFreezing(null);
    }
  };

  const handleUnfreeze = async (accountId) => {
    setUnfreezing(accountId);
    try {
      await api.patch(`/delinquent/${accountId}/unfreeze`);
      setSnackbar({ open: true, message: `Account #${accountId} unfrozen successfully.`, severity: 'success' });
      setAccounts(prev =>
        prev.map(a => a.account_id === accountId ? { ...a, account_status: 'active' } : a)
      );
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || `Failed to unfreeze account #${accountId}.`,
        severity: 'error',
      });
    } finally {
      setUnfreezing(null);
    }
  };


  const overdueColor = (count) => {
    if (count >= 5) return DANGER;
    if (count >= 3) return WARN;
    return 'rgba(255,255,255,0.6)';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <WarningAmberRoundedIcon sx={{ color: WARN, fontSize: 28 }} />
            <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
              Delinquent Accounts
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            Customers with overdue installments — refresh to sync latest due dates
          </Typography>
        </Box>

        <Button
          onClick={() => fetchDelinquent(threshold)}
          startIcon={loading ? <CircularProgress size={14} sx={{ color: ACCENT }} /> : <RefreshRoundedIcon />}
          disabled={loading}
          sx={{ color: ACCENT, border: `1px solid rgba(159,255,152,0.2)`, background: 'rgba(159,255,152,0.05)', textTransform: 'none', fontWeight: 600, fontSize: 13, px: 2.5, py: 1, borderRadius: '10px', '&:hover': { background: 'rgba(159,255,152,0.1)' } }}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </Box>

      {/* Threshold control */}
      <Box sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', p: 3, mb: 3, maxWidth: 480 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            Minimum overdue installments
          </Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: WARN }}>
            {threshold}
          </Typography>
        </Box>
        <Slider
          value={threshold}
          onChange={handleThresholdChange}
          onChangeCommitted={handleThresholdCommit}
          min={1}
          max={12}
          step={1}
          marks
          sx={{
            color: WARN,
            '& .MuiSlider-thumb': { width: 16, height: 16 },
            '& .MuiSlider-mark': { background: 'rgba(255,255,255,0.15)' },
          }}
        />
        <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', mt: 0.5 }}>
          Showing accounts with {threshold}+ overdue installment{threshold > 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fff' }}>
          {error}
        </Alert>
      )}

      {/* Stats row */}
      {!loading && accounts.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Delinquent Accounts', value: accounts.length, color: WARN },
            { label: 'Already Frozen',      value: accounts.filter(a => a.account_status === 'frozen').length, color: '#60A5FA' },
            { label: 'Total Overdue Amount', value: `PKR ${accounts.reduce((s, a) => s + parseFloat(a.total_overdue_amount), 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`, color: DANGER },
          ].map(stat => (
            <Box key={stat.label} sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', px: 3, py: 2, minWidth: 180 }}>
              <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.5 }}>{stat.label}</Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Table */}
      <Box sx={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, gap: 2 }}>
            <CircularProgress size={24} sx={{ color: ACCENT }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Syncing overdue installments…</Typography>
          </Box>
        ) : accounts.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <ErrorOutlineRoundedIcon sx={{ color: 'rgba(255,255,255,0.15)', fontSize: 40 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
              No accounts with {threshold}+ overdue installment{threshold > 1 ? 's' : ''} found
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Account ID', 'Customer', 'CNIC', 'Phone', 'Overdue Count', 'Total Overdue (PKR)', 'Earliest Overdue', 'Balance (PKR)', 'Status', 'Action'].map(h => (
                    <TableCell key={h} sx={headCellSx}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((row) => {
                  const isFrozen   = row.account_status === 'frozen';
                  const isBeingFrozen   = freezing   === row.account_id;
                  const isBeingUnfrozen = unfreezing === row.account_id;
                  return (
                    <TableRow
                      key={row.account_id}
                      sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' }, opacity: isFrozen ? 0.6 : 1 }}
                    >
                      <TableCell sx={cellSx}>
                        <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>#{row.account_id}</Typography>
                      </TableCell>

                      <TableCell sx={cellSx}>
                        {row.first_name} {row.last_name}
                      </TableCell>

                      <TableCell sx={{ ...cellSx, fontFamily: 'monospace', letterSpacing: 0.5 }}>
                        {row.cnic}
                      </TableCell>

                      <TableCell sx={cellSx}>{row.phone}</TableCell>

                      <TableCell sx={cellSx}>
                        <Chip
                          label={row.overdue_count}
                          size="small"
                          sx={{
                            background: `${overdueColor(row.overdue_count)}18`,
                            color: overdueColor(row.overdue_count),
                            border: `1px solid ${overdueColor(row.overdue_count)}33`,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ ...cellSx, color: DANGER, fontWeight: 600 }}>
                        {parseFloat(row.total_overdue_amount).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </TableCell>

                      <TableCell sx={cellSx}>
                        {new Date(row.earliest_overdue_date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>

                      <TableCell sx={cellSx}>
                        {parseFloat(row.balance).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </TableCell>

                      <TableCell sx={cellSx}>
                        <Chip
                          label={isFrozen ? 'Frozen' : 'Active'}
                          size="small"
                          sx={{
                            background: isFrozen ? 'rgba(96,165,250,0.1)' : 'rgba(74,222,128,0.1)',
                            color:      isFrozen ? '#60A5FA' : '#4ADE80',
                            border:     `1px solid ${isFrozen ? 'rgba(96,165,250,0.25)' : 'rgba(74,222,128,0.25)'}`,
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={cellSx}>
                        {isFrozen ? (
                          <Tooltip title="Restore account to active — customer can transact again" arrow>
                            <span>
                              <Button
                                onClick={() => handleUnfreeze(row.account_id)}
                                disabled={isBeingUnfrozen}
                                startIcon={isBeingUnfrozen
                                  ? <CircularProgress size={12} sx={{ color: '#fff' }} />
                                  : <LockOpenRoundedIcon sx={{ fontSize: 14 }} />
                                }
                                size="small"
                                sx={{
                                  background: 'rgba(96,165,250,0.1)',
                                  color: '#60A5FA',
                                  border: '1px solid rgba(96,165,250,0.25)',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  px: 1.5,
                                  borderRadius: '8px',
                                  '&:hover': { background: '#60A5FA', color: '#fff', boxShadow: '0 0 16px rgba(96,165,250,0.4)' },
                                  '&:disabled': { opacity: 0.5 },
                                }}
                              >
                                {isBeingUnfrozen ? 'Unfreezing…' : 'Unfreeze'}
                              </Button>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Freeze this account — customer will be unable to transact" arrow>
                            <span>
                              <Button
                                onClick={() => handleFreeze(row.account_id)}
                                disabled={isBeingFrozen}
                                startIcon={isBeingFrozen
                                  ? <CircularProgress size={12} sx={{ color: '#fff' }} />
                                  : <AcUnitRoundedIcon sx={{ fontSize: 14 }} />
                                }
                                size="small"
                                sx={{
                                  background: 'rgba(239,68,68,0.1)',
                                  color: DANGER,
                                  border: `1px solid rgba(239,68,68,0.25)`,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  px: 1.5,
                                  borderRadius: '8px',
                                  '&:hover': { background: DANGER, color: '#fff', boxShadow: `0 0 16px rgba(239,68,68,0.4)` },
                                  '&:disabled': { opacity: 0.5 },
                                }}
                              >
                                {isBeingFrozen ? 'Freezing…' : 'Freeze'}
                              </Button>
                            </span>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(p => ({ ...p, open: false }))}
          sx={{ background: snackbar.severity === 'success' ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${snackbar.severity === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`, color: '#fff', borderRadius: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
