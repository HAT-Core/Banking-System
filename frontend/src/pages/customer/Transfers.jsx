import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress,
         MenuItem, Select, FormControl, InputLabel, Tabs, Tab } from '@mui/material';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import api from '../utils/api';

// Shared input style 
const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff', fontSize: 15, borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
    '&:hover fieldset': { borderColor: 'rgba(159,255,152,0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#9FFF98', borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.35)', fontSize: 14 },
  '& .MuiInputLabel-root.Mui-focused': { color: '#9FFF98' },
  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.4)' },
  '& input[type="datetime-local"]': { colorScheme: 'dark', color: 'rgba(255,255,255,0.8)' },
};

const fmt = (n) => `PKR ${parseFloat(n).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;

// Section wrapper 
const Section = ({ label, children }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
      {label}
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</Box>
  </Box>
);

// Success state 
const SuccessCard = ({ message, onReset }) => (
  <Box sx={{ textAlign: 'center', py: 6 }}>
    <CheckCircleRoundedIcon sx={{ fontSize: 56, color: '#4ADE80', mb: 2 }} />
    <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#fff', mb: 1 }}>{message}</Typography>
    <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', mb: 4 }}>
      Your transaction has been submitted successfully.
    </Typography>
    <Button onClick={onReset} sx={{ color: '#9FFF98', border: '1px solid rgba(159,255,152,0.3)',
      borderRadius: '10px', px: 4, py: 1.2, textTransform: 'none', fontWeight: 600,
      '&:hover': { background: 'rgba(159,255,152,0.08)' } }}>
      Make Another Transfer
    </Button>
  </Box>
);

// Submit button 
const SubmitBtn = ({ loading, label }) => (
  <Button type="submit" variant="contained" fullWidth disabled={loading}
    sx={{ background: loading ? 'rgba(159,255,152,0.4)' : '#9FFF98', color: '#0E0E0E',
      fontWeight: 700, fontSize: 15, py: 1.7, borderRadius: '12px', textTransform: 'none',
      boxShadow: loading ? 'none' : '0 0 24px rgba(159,255,152,0.3)', transition: 'all 0.3s',
      '&:hover': { background: '#b8ffb3', boxShadow: '0 0 40px rgba(159,255,152,0.5)' },
      '&.Mui-disabled': { color: '#0E0E0E' },
    }}>
    {loading ? <CircularProgress size={20} sx={{ color: '#0E0E0E' }} /> : label}
  </Button>
);

// TAB 0 — Intra-bank transfer
function IntraForm({ accountId, balance }) {
  const [form, setForm]     = useState({ toAccountId: '', amount: '' });
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState('');
  const [success, setOk]    = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.toAccountId || !form.amount) return setError('All fields are required.');
    if (parseFloat(form.amount) <= 0)      return setError('Amount must be greater than zero.');
    if (parseFloat(form.amount) > balance) return setError('Insufficient funds.');

    setLoad(true);
    try {
      await api.post('/transfer/intra', {
        fromAccountId: accountId,
        toAccountId:   parseInt(form.toAccountId),
        amount:        parseFloat(form.amount),
      });
      setOk(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed.');
    } finally {
      setLoad(false);
    }
  };

  if (success) return <SuccessCard message="Transfer Successful" onReset={() => { setOk(false); setForm({ toAccountId: '', amount: '' }); }} />;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {error && <Alert severity="error" sx={alertSx} onClose={() => setError('')}>{error}</Alert>}

      <Section label="From">
        <Box sx={{ background: 'rgba(159,255,152,0.04)', border: '1px solid rgba(159,255,152,0.12)',
          borderRadius: '12px', px: 2.5, py: 2 }}>
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mb: 0.3 }}>Account #{accountId}</Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#9FFF98' }}>{fmt(balance)}</Typography>
        </Box>
      </Section>

      <Section label="To">
        <TextField label="Recipient Account ID" value={form.toAccountId}
          onChange={set('toAccountId')} fullWidth sx={inputSx}
          inputProps={{ inputMode: 'numeric' }}
          helperText={<span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>Ask your recipient for their Account ID</span>}
        />
      </Section>

      <Section label="Amount">
        <TextField label="Amount (PKR)" value={form.amount} onChange={set('amount')}
          fullWidth sx={inputSx} inputProps={{ inputMode: 'decimal' }} />
      </Section>

      <Box sx={{ mt: 1 }}>
        <SubmitBtn loading={loading} label="Send Money" />
      </Box>
    </Box>
  );
}

// TAB 1 — Inter-bank transfer
function InterForm({ accountId, balance, banks }) {
  const [form, setForm]    = useState({ toBankId: '', toAccountNumber: '', amount: '' });
  const [loading, setLoad] = useState(false);
  const [error, setError]  = useState('');
  const [success, setOk]   = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.toBankId || !form.toAccountNumber || !form.amount)
      return setError('All fields are required.');
    if (parseFloat(form.amount) <= 0)      return setError('Amount must be greater than zero.');
    if (parseFloat(form.amount) > balance) return setError('Insufficient funds.');

    setLoad(true);
    try {
      await api.post('/transfer/inter', {
        fromAccountId:   accountId,
        amount:          parseFloat(form.amount),
        toBankId:        parseInt(form.toBankId),
        toAccountNumber: form.toAccountNumber,
      });
      setOk(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed.');
    } finally {
      setLoad(false);
    }
  };

  if (success) return <SuccessCard message="Transfer Initiated" onReset={() => { setOk(false); setForm({ toBankId: '', toAccountNumber: '', amount: '' }); }} />;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {error && <Alert severity="error" sx={alertSx} onClose={() => setError('')}>{error}</Alert>}

      <Section label="From">
        <Box sx={{ background: 'rgba(159,255,152,0.04)', border: '1px solid rgba(159,255,152,0.12)',
          borderRadius: '12px', px: 2.5, py: 2 }}>
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mb: 0.3 }}>Account #{accountId}</Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#9FFF98' }}>{fmt(balance)}</Typography>
        </Box>
      </Section>

      <Section label="Destination Bank">
        <FormControl fullWidth sx={inputSx}>
          <InputLabel>Select Bank</InputLabel>
          <Select value={form.toBankId} label="Select Bank" onChange={set('toBankId')}
            sx={{ color: '#fff', borderRadius: '12px' }}
            MenuProps={{ PaperProps: { sx: { bgcolor: '#1A1A1A', color: '#fff' } } }}>
            {banks.map(b => (
              <MenuItem key={b.bank_id} value={b.bank_id}>{b.bank_name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField label="Recipient Account Number" value={form.toAccountNumber}
          onChange={set('toAccountNumber')} fullWidth sx={inputSx} />
      </Section>

      <Section label="Amount">
        <TextField label="Amount (PKR)" value={form.amount} onChange={set('amount')}
          fullWidth sx={inputSx} inputProps={{ inputMode: 'decimal' }} />
        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', mt: -0.5 }}>
          Note: Interbank transfers are settled as pending until the partner bank confirms.
        </Typography>
      </Section>

      <Box sx={{ mt: 1 }}>
        <SubmitBtn loading={loading} label="Send to External Bank" />
      </Box>
    </Box>
  );
}

// TAB 2 — Scheduled transfer
function ScheduledForm({ accountId, balance }) {
  const [form, setForm]    = useState({ toAccountId: '', amount: '', scheduledDate: '' });
  const [loading, setLoad] = useState(false);
  const [error, setError]  = useState('');
  const [success, setOk]   = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  // Build minimum datetime string (now + 5 minutes) for the datetime-local input
  const minDate = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.toAccountId || !form.amount || !form.scheduledDate)
      return setError('All fields are required.');
    if (parseFloat(form.amount) <= 0)      return setError('Amount must be greater than zero.');
    if (parseFloat(form.amount) > balance) return setError('Insufficient funds.');
    if (new Date(form.scheduledDate) <= new Date()) return setError('Scheduled date must be in the future.');

    setLoad(true);
    try {
      await api.post('/transfer/scheduled', {
        fromAccountId: accountId,
        toAccountId:   parseInt(form.toAccountId),
        amount:        parseFloat(form.amount),
        scheduledDate: new Date(form.scheduledDate).toISOString(),
      });
      setOk(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule transfer.');
    } finally {
      setLoad(false);
    }
  };

  if (success) return <SuccessCard message="Transfer Scheduled" onReset={() => { setOk(false); setForm({ toAccountId: '', amount: '', scheduledDate: '' }); }} />;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {error && <Alert severity="error" sx={alertSx} onClose={() => setError('')}>{error}</Alert>}

      <Section label="From">
        <Box sx={{ background: 'rgba(159,255,152,0.04)', border: '1px solid rgba(159,255,152,0.12)',
          borderRadius: '12px', px: 2.5, py: 2 }}>
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mb: 0.3 }}>Account #{accountId}</Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#9FFF98' }}>{fmt(balance)}</Typography>
        </Box>
      </Section>

      <Section label="To">
        <TextField label="Recipient Account ID" value={form.toAccountId}
          onChange={set('toAccountId')} fullWidth sx={inputSx}
          inputProps={{ inputMode: 'numeric' }} />
      </Section>

      <Section label="Amount">
        <TextField label="Amount (PKR)" value={form.amount} onChange={set('amount')}
          fullWidth sx={inputSx} inputProps={{ inputMode: 'decimal' }} />
      </Section>

      <Section label="Schedule Date & Time">
        <TextField label="Execute On" type="datetime-local" value={form.scheduledDate}
          onChange={set('scheduledDate')} fullWidth sx={inputSx}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDate }} />
        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', mt: -0.5 }}>
          The transfer will execute automatically at midnight on the selected date.
        </Typography>
      </Section>

      <Box sx={{ mt: 1 }}>
        <SubmitBtn loading={loading} label="Schedule Transfer" />
      </Box>
    </Box>
  );
}

// Shared alert style 
const alertSx = {
  mb: 2.5, background: 'rgba(239,68,68,0.05)', color: '#F87171',
  border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px',
  '& .MuiAlert-icon': { color: '#F87171' },
};

// Tab config 
const TABS = [
  { label: 'Internal',    icon: <SwapHorizRoundedIcon fontSize="small" /> },
  { label: 'Interbank',   icon: <AccountBalanceRoundedIcon fontSize="small" /> },
  { label: 'Scheduled',   icon: <ScheduleRoundedIcon fontSize="small" /> },
];

// Main page
export default function Transfers() {
  const [tab, setTab]           = useState(0);
  const [accountId, setAccId]   = useState(null);
  const [balance, setBalance]   = useState(0);
  const [banks, setBanks]       = useState([]);
  const [initLoading, setInit]  = useState(true);
  const [initError, setInitErr] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: accounts }, { data: bankList }] = await Promise.all([
          api.get('/accounts/my'),
          api.get('/accounts/banks'),
        ]);
        if (!accounts.length) { setInitErr('No active account found.'); setInit(false); return; }
        setAccId(accounts[0].account_id);
        setBalance(parseFloat(accounts[0].balance));
        setBanks(bankList);
      } catch {
        setInitErr('Failed to load account data.');
      } finally {
        setInit(false);
      }
    };
    load();
  }, []);

  if (initLoading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <CircularProgress sx={{ color: '#9FFF98' }} />
    </Box>
  );

  if (initError) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <Typography sx={{ color: '#F87171', fontSize: 16 }}>{initError}</Typography>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: -1, mb: 0.5 }}>Transfers</Typography>
        <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>
          Send money instantly, to any bank, or schedule for later.
        </Typography>
      </Box>

      {/* Two-column layout: form left, info right */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 4, alignItems: 'start' }}>

        {/* ── Form card ── */}
        <Box sx={{ background: 'rgba(20,20,20,0.7)', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '24px', overflow: 'hidden' }}>

          {/* Tabs */}
          <Tabs
            value={tab} onChange={(_, v) => setTab(v)}
            sx={{
              px: 3, pt: 2, borderBottom: '1px solid rgba(255,255,255,0.05)',
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.4)', textTransform: 'none', fontWeight: 500, fontSize: 14, minHeight: 48 },
              '& .Mui-selected': { color: '#9FFF98 !important', fontWeight: 700 },
              '& .MuiTabs-indicator': { background: '#9FFF98', height: 2, borderRadius: '2px' },
            }}
          >
            {TABS.map((t, i) => (
              <Tab key={i} label={t.label} icon={t.icon} iconPosition="start"
                sx={{ gap: 0.8, '& .MuiSvgIcon-root': { fontSize: 18 } }} />
            ))}
          </Tabs>

          {/* Form body */}
          <Box sx={{ p: 4 }}>
            {tab === 0 && <IntraForm    accountId={accountId} balance={balance} />}
            {tab === 1 && <InterForm    accountId={accountId} balance={balance} banks={banks} />}
            {tab === 2 && <ScheduledForm accountId={accountId} balance={balance} />}
          </Box>
        </Box>

        {/* Info sidebar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Transfer type info */}
          {[
            {
              title: 'Internal Transfer',
              color: '#9FFF98',
              glow: 'rgba(159,255,152,0.1)',
              points: ['Instant settlement', 'Both accounts in HATCoreBank', 'No fees'],
            },
            {
              title: 'Interbank Transfer',
              color: '#60A5FA',
              glow: 'rgba(96,165,250,0.1)',
              points: ['Settled by partner bank', 'Status stays pending until confirmed', 'Funds deducted immediately'],
            },
            {
              title: 'Scheduled Transfer',
              color: '#C084FC',
              glow: 'rgba(192,132,252,0.1)',
              points: ['Executes automatically at midnight', 'Balance checked at time of execution', 'Internal accounts only'],
            },
          ].map((info, i) => (
            <Box key={i} sx={{
              background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)',
              borderLeft: `3px solid ${info.color}`, borderRadius: '14px', p: 2.5,
              opacity: tab === i ? 1 : 0.4, transition: 'opacity 0.3s',
            }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: info.color, mb: 1 }}>{info.title}</Typography>
              {info.points.map((p, j) => (
                <Typography key={j} sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', mb: 0.3 }}>· {p}</Typography>
              ))}
            </Box>
          ))}

          {/* Balance reminder */}
          <Box sx={{ background: 'rgba(159,255,152,0.04)', border: '1px solid rgba(159,255,152,0.12)',
            borderRadius: '14px', p: 2.5 }}>
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Available Balance
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#9FFF98' }}>{fmt(balance)}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}