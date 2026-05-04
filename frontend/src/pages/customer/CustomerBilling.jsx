import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, Button, CircularProgress,
  Alert, Snackbar, Skeleton, TextField, Switch,
  FormControlLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider,
} from '@mui/material';
import PaymentsRoundedIcon      from '@mui/icons-material/PaymentsRounded';
import AddRoundedIcon           from '@mui/icons-material/AddRounded';
import ReceiptRoundedIcon       from '@mui/icons-material/ReceiptRounded';
import BusinessRoundedIcon      from '@mui/icons-material/BusinessRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import api from '../utils/api';

const ACCENT = '#9FFF98';
const fmt     = (n) => `PKR ${parseFloat(n).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff', borderRadius: '10px', background: 'rgba(255,255,255,0.04)',
    '& fieldset':             { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset':       { borderColor: 'rgba(159,255,152,0.3)' },
    '&.Mui-focused fieldset': { borderColor: ACCENT },
  },
  '& .MuiInputLabel-root':             { color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
};

// Subscribe dialog 
function SubscribeDialog({ open, biller, onClose, onSuccess }) {
  const [form, setForm] = useState({ accountId: '', referenceNumber: '', billingDay: '', amount: '', autoPay: true });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    const { accountId, referenceNumber, billingDay, amount } = form;
    if (!accountId || !referenceNumber || !billingDay || !amount) { setError('All fields are required.'); return; }
    if (Number(billingDay) < 1 || Number(billingDay) > 28) { setError('Billing day must be between 1 and 28.'); return; }

    setLoading(true);
    try {
      await api.post('/bills/subscribe', {
        accountId:       Number(accountId),
        billerId:        biller.biller_id,
        referenceNumber,
        billingDay:      Number(billingDay),
        amount:          parseFloat(amount),
        autoPay:         form.autoPay,
      });
      onSuccess(`Subscribed to ${biller.name} successfully!`);
      onClose();
      setForm({ accountId: '', referenceNumber: '', billingDay: '', amount: '', autoPay: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', minWidth: 440 } }}
    >
      <DialogTitle sx={{ color: '#fff', fontWeight: 800, fontSize: 20, pb: 1 }}>
        Subscribe to {biller?.name}
        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 400, mt: 0.3 }}>
          Set up automatic billing for this utility
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
        {error && <Alert severity="error" sx={{ borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fff' }}>{error}</Alert>}

        <TextField label="Your Account ID" name="accountId" value={form.accountId} onChange={handleChange} type="number" fullWidth size="small" sx={fieldSx} helperText={<span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>The account that will be charged</span>} />
        <TextField label="Reference Number" name="referenceNumber" value={form.referenceNumber} onChange={handleChange} fullWidth size="small" sx={fieldSx} helperText={<span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Your consumer/reference number from the biller</span>} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Billing Day" name="billingDay" value={form.billingDay} onChange={handleChange} type="number" fullWidth size="small" sx={fieldSx} helperText={<span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Day of month (1–28)</span>} />
          <TextField label="Monthly Amount (PKR)" name="amount" value={form.amount} onChange={handleChange} type="number" fullWidth size="small" sx={fieldSx} />
        </Box>
        <FormControlLabel
          control={<Switch checked={form.autoPay} onChange={(e) => setForm(p => ({ ...p, autoPay: e.target.checked }))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT } }} />}
          label={<Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Enable Auto-Pay</Typography>}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none', fontWeight: 600, borderRadius: '10px', px: 2 }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} sx={{ color: '#0A0A0A' }} /> : <AddRoundedIcon />}
          sx={{ background: ACCENT, color: '#0A0A0A', fontWeight: 700, textTransform: 'none', borderRadius: '10px', px: 3, '&:hover': { background: '#7AFF72' }, '&:disabled': { background: 'rgba(159,255,152,0.2)', color: 'rgba(0,0,0,0.4)' } }}
        >
          {loading ? 'Subscribing…' : 'Confirm Subscription'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Main Page 
export default function CustomerBilling() {
  const [tab,          setTab]          = useState('billers');   // 'billers' | 'pending'
  const [billers,      setBillers]      = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [payingId,     setPayingId]     = useState(null);
  const [dialogBiller, setDialogBiller] = useState(null);
  const [snackbar,     setSnackbar]     = useState({ open: false, message: '', severity: 'success' });

  const fetchBillers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bills/billers');
      setBillers(res.data);
    } catch {
      setError('Failed to load billers.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bills/pending');
      setPendingBills(res.data);
    } catch {
      setError('Failed to load pending bills.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'billers') fetchBillers();
    else                   fetchPending();
  }, [tab, fetchBillers, fetchPending]);

  const handlePayBill = async (billId, amount) => {
    setPayingId(billId);
    try {
      await api.post(`/bills/${billId}/pay`);
      setSnackbar({ open: true, message: `Bill of ${fmt(amount)} paid successfully!`, severity: 'success' });
      setPendingBills(p => p.filter(b => b.bill_id !== billId));
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Payment failed.', severity: 'error' });
    } finally {
      setPayingId(null);
    }
  };

  const closeSnackbar = () => setSnackbar(p => ({ ...p, open: false }));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: -1, mb: 0.5 }}>Billing</Typography>
        <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>
          Manage your utility subscriptions and pay outstanding bills
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', p: 0.7, width: 'fit-content' }}>
        {[
          { key: 'billers', label: 'Biller Directory', icon: <BusinessRoundedIcon fontSize="small" /> },
          { key: 'pending', label: `Pending Bills${pendingBills.length > 0 ? ` (${pendingBills.length})` : ''}`, icon: <ReceiptRoundedIcon fontSize="small" /> },
        ].map(t => (
          <Button
            key={t.key}
            onClick={() => setTab(t.key)}
            startIcon={t.icon}
            sx={{
              color: tab === t.key ? '#0A0A0A' : 'rgba(255,255,255,0.5)',
              background: tab === t.key ? ACCENT : 'transparent',
              fontWeight: tab === t.key ? 700 : 500,
              textTransform: 'none', borderRadius: '10px', px: 2.5, py: 1, fontSize: 14,
              transition: 'all 0.2s',
              '&:hover': { background: tab === t.key ? ACCENT : 'rgba(255,255,255,0.04)', color: tab === t.key ? '#0A0A0A' : '#fff' },
            }}
          >
            {t.label}
          </Button>
        ))}
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" width={260} height={130} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)' }} />)}
        </Box>
      )}

      {/* Error */}
      {!loading && error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}

      {/*Biller Directory*/}
      {!loading && !error && tab === 'billers' && (
        <>
          {billers.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <BusinessRoundedIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>No billers available yet.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {billers.map(b => (
                <Box
                  key={b.biller_id}
                  sx={{ width: 260, background: 'rgba(20,20,20,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', p: 3, display: 'flex', flexDirection: 'column', gap: 2, transition: 'all 0.2s', '&:hover': { borderColor: 'rgba(159,255,152,0.2)', transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(159,255,152,0.08)', border: '1px solid rgba(159,255,152,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PaymentsRoundedIcon sx={{ color: ACCENT, fontSize: 22 }} />
                    </Box>
                    <Chip
                      label={b.category}
                      size="small"
                      sx={{ background: b.category === 'government' ? 'rgba(96,165,250,0.1)' : 'rgba(192,132,252,0.1)', color: b.category === 'government' ? '#60A5FA' : '#C084FC', border: `1px solid ${b.category === 'government' ? 'rgba(96,165,250,0.25)' : 'rgba(192,132,252,0.25)'}`, fontWeight: 600, fontSize: 10, textTransform: 'capitalize' }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16, mb: 0.3 }}>{b.name}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>ID: {b.biller_id}</Typography>
                  </Box>

                  <Button
                    onClick={() => setDialogBiller(b)}
                    startIcon={<AddRoundedIcon fontSize="small" />}
                    fullWidth
                    sx={{ background: 'rgba(159,255,152,0.08)', color: ACCENT, border: '1px solid rgba(159,255,152,0.2)', borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, py: 1, '&:hover': { background: ACCENT, color: '#0A0A0A' } }}
                  >
                    Subscribe
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}

      {/*Pending Bills*/}
      {!loading && !error && tab === 'pending' && (
        <>
          {pendingBills.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <ReceiptRoundedIcon sx={{ fontSize: 64, color: ACCENT, mb: 2, filter: `drop-shadow(0 0 16px ${ACCENT})` }} />
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>All Caught Up!</Typography>
              <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', mt: 1 }}>You have no pending bills at this time.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pendingBills.map(bill => (
                <Box
                  key={bill.bill_id}
                  sx={{ background: 'rgba(20,20,20,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, transition: 'border-color 0.2s', '&:hover': { borderColor: 'rgba(255,255,255,0.12)' } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 46, height: 46, borderRadius: '13px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AccountBalanceRoundedIcon sx={{ color: '#FBBF24', fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{bill.biller_name}</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, mt: 0.2 }}>
                        Ref: {bill.reference_number} · Account #{bill.account_id}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Amount Due</Typography>
                      <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#FBBF24', letterSpacing: -0.5 }}>{fmt(bill.amount)}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Due Date</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{fmtDate(bill.due_date)}</Typography>
                    </Box>

                    <Button
                      disabled={payingId === bill.bill_id}
                      startIcon={payingId === bill.bill_id ? <CircularProgress size={14} sx={{ color: '#0A0A0A' }} /> : <PaymentsRoundedIcon fontSize="small" />}
                      onClick={() => handlePayBill(bill.bill_id, bill.amount)}
                      sx={{ background: ACCENT, color: '#0A0A0A', fontWeight: 700, fontSize: 14, px: 3, py: 1.2, borderRadius: '12px', textTransform: 'none', whiteSpace: 'nowrap', '&:hover': { background: '#7AFF72', boxShadow: '0 0 20px rgba(159,255,152,0.3)' }, '&:disabled': { background: 'rgba(159,255,152,0.2)', color: 'rgba(0,0,0,0.4)' } }}
                    >
                      {payingId === bill.bill_id ? 'Paying…' : 'Pay Bill'}
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Subscribe Dialog */}
      <SubscribeDialog
        open={Boolean(dialogBiller)}
        biller={dialogBiller}
        onClose={() => setDialogBiller(null)}
        onSuccess={(msg) => setSnackbar({ open: true, message: msg, severity: 'success' })}
      />

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert
          severity={snackbar.severity}
          onClose={closeSnackbar}
          sx={{ background: snackbar.severity === 'success' ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${snackbar.severity === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`, color: '#fff', borderRadius: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
