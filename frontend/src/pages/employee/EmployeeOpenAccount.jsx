import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Modal, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert,
  Snackbar, CircularProgress, Chip,
} from '@mui/material';
import AddCardRoundedIcon    from '@mui/icons-material/AddCardRounded';
import RefreshRoundedIcon    from '@mui/icons-material/RefreshRounded';
import CloseRoundedIcon      from '@mui/icons-material/CloseRounded';
import api from '../utils/api';

const ACCENT = '#9FFF98';

const modalSx = {
  position: 'absolute', top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 460, background: '#111',
  border: '1px solid rgba(159,255,152,0.15)',
  borderRadius: '20px', p: 4,
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff', borderRadius: '12px', background: 'rgba(255,255,255,0.04)',
    '& fieldset':             { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset':       { borderColor: 'rgba(159,255,152,0.3)' },
    '&.Mui-focused fieldset': { borderColor: ACCENT },
  },
  '& .MuiInputLabel-root':             { color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
};

const kycChip = (status) => {
  const map = {
    verified: { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)'  },
    pending:  { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
    rejected: { color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  };
  const s = map[status] || map.pending;
  return (
    <Chip label={status} size="small"
      sx={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontWeight: 700, fontSize: 11, textTransform: 'capitalize' }} />
  );
};

export default function EmployeeOpenAccount() {
  const [customers,    setCustomers]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [selected,     setSelected]     = useState(null);
  const [open,         setOpen]         = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [formError,    setFormError]    = useState('');
  const [snackbar,     setSnackbar]     = useState({ open: false, message: '', severity: 'success' });
  const [form,         setForm]         = useState({ accountType: 'savings', initialDeposit: '' });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/account-opening/customers');
      setCustomers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleOpen = (customer) => {
    setSelected(customer);
    setForm({ accountType: 'savings', initialDeposit: '' });
    setFormError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!form.accountType) { setFormError('Please select an account type.'); return; }
    if (form.initialDeposit && isNaN(parseFloat(form.initialDeposit))) {
      setFormError('Initial deposit must be a number.'); return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/account-opening/open', {
        customerId:     selected.customer_id,
        accountType:    form.accountType,
        initialDeposit: parseFloat(form.initialDeposit) || 0,
      });
      setSnackbar({ open: true, message: `Account #${data.account_id} opened successfully.`, severity: 'success' });
      setOpen(false);
      fetchCustomers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to open account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>Open Bank Account</Typography>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>Create a bank account for a registered customer</Typography>
        </Box>
        <Button onClick={fetchCustomers} startIcon={<RefreshRoundedIcon />} disabled={loading}
          sx={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, px: 2.5, py: 1, '&:hover': { background: 'rgba(255,255,255,0.05)', color: '#fff' } }}>
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress sx={{ color: ACCENT }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', py: 2, background: 'rgba(255,255,255,0.02)' } }}>
                <TableCell>Customer</TableCell>
                <TableCell>CNIC</TableCell>
                <TableCell>KYC</TableCell>
                <TableCell>Accounts</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map(c => (
                <TableRow key={c.customer_id} sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(255,255,255,0.04)', color: '#fff', py: 2 }, '&:hover': { background: 'rgba(255,255,255,0.015)' } }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{c.first_name} {c.last_name}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', mt: 0.3 }}>@{c.username} · #{c.customer_id}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{c.cnic}</TableCell>
                  <TableCell>{kycChip(c.kyc_status)}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: c.active_accounts > 0 ? '#4ADE80' : 'rgba(255,255,255,0.4)' }}>
                      {c.active_accounts} active / {c.account_count} total
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      disabled={c.kyc_status !== 'verified'}
                      startIcon={<AddCardRoundedIcon fontSize="small" />}
                      onClick={() => handleOpen(c)}
                      sx={{ background: c.kyc_status === 'verified' ? ACCENT : 'rgba(255,255,255,0.05)', color: c.kyc_status === 'verified' ? '#0A0A0A' : 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 12, px: 2, py: 0.8, borderRadius: '8px', textTransform: 'none', '&:hover': { background: '#7AFF72' }, '&:disabled': { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' } }}
                    >
                      Open Account
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalSx}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Open New Account</Typography>
            <CloseRoundedIcon onClick={() => setOpen(false)} sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', '&:hover': { color: '#fff' } }} />
          </Box>

          {selected && (
            <Box sx={{ background: 'rgba(159,255,152,0.05)', border: '1px solid rgba(159,255,152,0.12)', borderRadius: '12px', px: 2.5, py: 2, mb: 3 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{selected.first_name} {selected.last_name}</Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mt: 0.3 }}>Customer #{selected.customer_id} · {selected.cnic}</Typography>
            </Box>
          )}

          {formError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fff' }}>{formError}</Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel>Account Type</InputLabel>
              <Select value={form.accountType} label="Account Type"
                onChange={e => setForm(p => ({ ...p, accountType: e.target.value }))}
                sx={{ color: '#fff' }} MenuProps={{ PaperProps: { sx: { bgcolor: '#1A1A1A', color: '#fff' } } }}>
                <MenuItem value="savings">Savings</MenuItem>
                <MenuItem value="current">Current</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Initial Deposit (PKR) — optional"
              value={form.initialDeposit}
              onChange={e => setForm(p => ({ ...p, initialDeposit: e.target.value }))}
              type="number" fullWidth size="small" sx={fieldSx}
              helperText="Leave blank or 0 to open with zero balance"
              FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.3)' } }}
            />

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={15} sx={{ color: '#0A0A0A' }} /> : <AddCardRoundedIcon />}
              sx={{ background: ACCENT, color: '#0A0A0A', fontWeight: 700, py: 1.5, borderRadius: '12px', textTransform: 'none', mt: 1,
                '&:hover': { background: '#7AFF72' }, '&:disabled': { background: 'rgba(159,255,152,0.25)', color: 'rgba(0,0,0,0.4)' } }}
            >
              {submitting ? 'Opening Account…' : 'Confirm & Open Account'}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}
          sx={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#fff', borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}