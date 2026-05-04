import { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, Select, FormControl, InputLabel, Button, Skeleton, Alert } from '@mui/material';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import api from '../utils/api';

const ACCENT = '#9FFF98';
const fmt     = (n) => `PKR ${parseFloat(n ?? 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

const selectSx = {
  color: '#fff',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(159,255,152,0.3)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT },
  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.4)' },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const now = new Date();
const YEARS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

export default function AccountStatement() {
  const [accountId,    setAccountId]    = useState(null);
  const [month,        setMonth]        = useState(now.getMonth() + 1);
  const [year,         setYear]         = useState(now.getFullYear());
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  // Get account ID on mount
  useEffect(() => {
    api.get('/accounts/my').then(({ data: accounts }) => {
      if (accounts.length) setAccountId(accounts[0].account_id);
    }).catch(() => setError('Failed to load account.'));
  }, []);

  const handleGenerate = async () => {
    if (!accountId) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const { data: res } = await api.get(`/statements/${accountId}?month=${month}&year=${year}`);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate statement.');
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: -1, mb: 0.5 }}>Account Statement</Typography>
        <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>Monthly ledger with running balance</Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: 'rgba(255,255,255,0.4)', '&.Mui-focused': { color: ACCENT } }}>Month</InputLabel>
          <Select value={month} label="Month" onChange={e => setMonth(e.target.value)} sx={selectSx}
            MenuProps={{ PaperProps: { sx: { bgcolor: '#1A1A1A', color: '#fff' } } }}>
            {MONTHS.map((m, i) => <MenuItem key={i} value={i + 1}>{m}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: 'rgba(255,255,255,0.4)', '&.Mui-focused': { color: ACCENT } }}>Year</InputLabel>
          <Select value={year} label="Year" onChange={e => setYear(e.target.value)} sx={selectSx}
            MenuProps={{ PaperProps: { sx: { bgcolor: '#1A1A1A', color: '#fff' } } }}>
            {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>

        <Button
          onClick={handleGenerate}
          disabled={loading || !accountId}
          startIcon={<DescriptionRoundedIcon />}
          sx={{ background: ACCENT, color: '#0A0A0A', fontWeight: 700, borderRadius: '10px', px: 3, py: 1.1, textTransform: 'none',
            '&:hover': { background: '#7AFF72' }, '&:disabled': { background: 'rgba(159,255,152,0.2)', color: 'rgba(0,0,0,0.4)' } }}
        >
          {loading ? 'Generating…' : 'Generate Statement'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fff' }}>{error}</Alert>}

      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={90} sx={{ flex: 1, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.04)' }} />)}
          </Box>
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)' }} />
        </Box>
      )}

      {!loading && summary && (
        <>
          {/* Summary cards */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'Opening Balance', value: fmt(summary.opening_balance), color: 'rgba(255,255,255,0.7)' },
              { label: 'Total Credits',   value: fmt(summary.total_credits),   color: '#4ADE80' },
              { label: 'Total Debits',    value: fmt(summary.total_debits),    color: '#F87171' },
              { label: 'Closing Balance', value: fmt(summary.closing_balance), color: ACCENT },
            ].map(c => (
              <Box key={c.label} sx={{ flex: '1 1 160px', background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', px: 3, py: 2.5 }}>
                <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>{c.label}</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: c.color, letterSpacing: -0.5 }}>{c.value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Ledger table */}
          <Box sx={{ background: 'rgba(20,20,20,0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden' }}>

            {/* Header */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '70px 1fr 140px 140px 140px 160px', px: 3, py: 1.8, background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['ID', 'Type', 'Date', 'Debit', 'Credit', 'Running Balance'].map(h => (
                <Typography key={h} sx={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</Typography>
              ))}
            </Box>

            {data.transactions.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>No transactions for this period.</Typography>
              </Box>
            ) : (
              data.transactions.map((tx, i) => {
                const isCredit = tx.direction === 'credit';
                return (
                  <Box key={tx.transaction_id} sx={{
                    display: 'grid', gridTemplateColumns: '70px 1fr 140px 140px 140px 160px',
                    px: 3, py: 2, alignItems: 'center',
                    borderBottom: i < data.transactions.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    '&:hover': { background: 'rgba(255,255,255,0.02)' },
                  }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>#{tx.transaction_id}</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isCredit ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                        border: `1px solid ${isCredit ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}` }}>
                        {isCredit
                          ? <TrendingUpRoundedIcon sx={{ color: '#4ADE80', fontSize: 15 }} />
                          : <TrendingDownRoundedIcon sx={{ color: '#F87171', fontSize: 15 }} />}
                      </Box>
                      <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>
                        {tx.transaction_type.replace(/_/g, ' ')}
                      </Typography>
                    </Box>

                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{fmtDate(tx.transaction_date)}</Typography>

                    <Typography sx={{ color: isCredit ? 'rgba(255,255,255,0.2)' : '#F87171', fontSize: 13, fontWeight: isCredit ? 400 : 600 }}>
                      {isCredit ? '—' : fmt(tx.amount)}
                    </Typography>

                    <Typography sx={{ color: isCredit ? '#4ADE80' : 'rgba(255,255,255,0.2)', fontSize: 13, fontWeight: isCredit ? 600 : 400 }}>
                      {isCredit ? fmt(tx.amount) : '—'}
                    </Typography>

                    <Typography sx={{ color: ACCENT, fontSize: 13, fontWeight: 700 }}>{fmt(tx.running_balance)}</Typography>
                  </Box>
                );
              })
            )}
          </Box>
        </>
      )}
    </Box>
  );
}