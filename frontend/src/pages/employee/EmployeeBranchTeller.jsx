import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, Snackbar } from '@mui/material';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import api from '../../utils/api';

const ACCENT = '#9FFF98';
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff', borderRadius: '12px', background: 'rgba(255,255,255,0.04)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(159,255,152,0.3)' },
    '&.Mui-focused fieldset': { borderColor: ACCENT },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
};

export default function EmployeeBranchTeller() {
  const [type, setType] = useState('deposit');
  const [form, setForm] = useState({ accountId: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.accountId || !form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid account ID and amount.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/branch/transaction', {
        accountId: Number(form.accountId),
        type,
        amount: parseFloat(form.amount),
      });
      setSnackbar({ open: true, message: `${data.message} (TX #${data.transaction_id})` });
      setForm({ accountId: '', amount: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>Branch Teller</Typography>
        <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>Process cash deposits and withdrawals for walk-in customers</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 420px', maxWidth: 520, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', p: 4 }}>

          {/* Deposit / Withdraw toggle */}
          <Box sx={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', p: 0.5, mb: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
            {['deposit', 'withdraw'].map(t => (
              <Box key={t} onClick={() => setType(t)} sx={{
                flex: 1, textAlign: 'center', py: 1.4, borderRadius: '10px', cursor: 'pointer', textTransform: 'capitalize', fontWeight: type === t ? 600 : 400, fontSize: 14, transition: 'all 0.2s',
                background: type === t ? (t === 'deposit' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)') : 'transparent',
                color: type === t ? (t === 'deposit' ? '#4ADE80' : '#F87171') : 'rgba(255,255,255,0.4)',
                border: type === t ? `1px solid ${t === 'deposit' ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}` : '1px solid transparent',
              }}>{t}</Box>
            ))}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fff' }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Account ID" name="accountId" value={form.accountId} onChange={handleChange} type="number" fullWidth sx={fieldSx} helperText="The account_id of the customer's account" />
            <TextField label="Amount (PKR)" name="amount" value={form.amount} onChange={handleChange} type="number" fullWidth sx={fieldSx} />

            <Button
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} sx={{ color: '#0A0A0A' }} /> : <PointOfSaleRoundedIcon />}
              sx={{
                mt: 1, py: 1.6, borderRadius: '12px', fontWeight: 700, fontSize: 15, textTransform: 'none', transition: 'all 0.25s',
                background: type === 'deposit' ? '#4ADE80' : '#F87171',
                color: '#0A0A0A',
                '&:hover': { background: type === 'deposit' ? '#22c55e' : '#ef4444', boxShadow: `0 0 28px ${type === 'deposit' ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}` },
                '&:disabled': { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' },
              }}
            >
              {loading ? 'Processing…' : `Process ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </Button>
          </Box>
        </Box>

        {/* Info panel */}
        <Box sx={{ flex: '0 1 260px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '16px', p: 3 }}>
          <Typography sx={{ fontSize: 12, color: '#F59E0B', fontWeight: 600, mb: 1.5 }}>⚠ Teller Guidelines</Typography>
          {[
            'Verify customer identity before processing',
            'Deposit: funds added to account immediately',
            'Withdraw: ensure sufficient balance exists',
            'All transactions are audit-logged with your ID',
          ].map((s, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.1 }}>
                <Typography sx={{ fontSize: 9, color: '#F59E0B', fontWeight: 700 }}>{i + 1}</Typography>
              </Box>
              <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{s}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSnackbar(p => ({ ...p, open: false }))} sx={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#fff', borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}