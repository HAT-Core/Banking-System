import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Skeleton, TextField, MenuItem, Select, FormControl, InputLabel, Chip, InputAdornment } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import api from '../utils/api';

// Helpers 
const fmt    = (n) => `PKR ${parseFloat(n).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

const TX_TYPES = ['all', 'internal_transfer', 'external_transfer', 'deposit', 'withdraw', 'bill', 'loan'];

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff', fontSize: 14,
    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
    '&:hover fieldset': { borderColor: 'rgba(159,255,152,0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#9FFF98', borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.35)', fontSize: 14 },
  '& .MuiInputLabel-root.Mui-focused': { color: '#9FFF98' },
  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.4)' },
  '& input[type="date"]': { colorScheme: 'dark', color: 'rgba(255,255,255,0.8)' },
};

// Summary pill 
const Pill = ({ label, value, color }) => (
  <Box sx={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', px: 3, py: 2, minWidth: 180 }}>
    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>{label}</Typography>
    <Typography sx={{ fontSize: 20, fontWeight: 800, color, letterSpacing: -0.5 }}>{value}</Typography>
  </Box>
);

export default function TransactionHistory() {
  const [accountId, setAccountId]   = useState(null);
  const [transactions, setTx]       = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Filters
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch]         = useState('');

  // Step 1: get account id on mount
  useEffect(() => {
    const init = async () => {
      try {
        const { data: accounts } = await api.get('/accounts/my');
        if (!accounts.length) { setError('No active account found.'); setLoading(false); return; }
        setAccountId(accounts[0].account_id);
      } catch {
        setError('Failed to load account.');
        setLoading(false);
      }
    };
    init();
  }, []);

  // Step 2: fetch transactions whenever accountId or filters change 
  const fetchTx = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate)              params.append('startDate', startDate);
      if (endDate)                params.append('endDate',   endDate);
      if (typeFilter !== 'all')   params.append('type',      typeFilter);

      const { data } = await api.get(`/transactions/${accountId}?${params.toString()}`);
      setSummary(data.summary);
      setTx(data.transactions);
    } catch {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [accountId, startDate, endDate, typeFilter]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  // Client-side search filter
  const visible = transactions.filter(tx =>
    search === '' ||
    String(tx.transaction_id).includes(search) ||
    tx.transaction_type.includes(search.toLowerCase()) ||
    String(tx.amount).includes(search)
  );

  // Loading skeleton 
  if (loading && !accountId) return (
    <Box>
      <Skeleton variant="rounded" height={60}  sx={{ mb: 3, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.04)' }} />
      <Skeleton variant="rounded" height={400} sx={{ borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.04)' }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <Typography sx={{ color: '#F87171', fontSize: 16 }}>{error}</Typography>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: -1, mb: 0.5 }}>Transaction History</Typography>
        <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>Full ledger for account #{accountId}</Typography>
      </Box>

      {/* Summary pills */}
      {summary && (
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Pill label="Total Money In"  value={fmt(summary.total_incoming)} color="#4ADE80" />
          <Pill label="Total Money Out" value={fmt(summary.total_outgoing)} color="#F87171" />
          <Pill label="Net Flow"        value={fmt(summary.net)}            color={summary.net >= 0 ? '#4ADE80' : '#F87171'} />
          <Pill label="Shown"           value={`${visible.length} transactions`} color="#fff" />
        </Box>
      )}

      {/* Filters */}
      <Box sx={{
        display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3,
        background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px', p: 2.5, alignItems: 'center',
      }}>
        <FilterListRoundedIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />

        {/* Search */}
        <TextField
          placeholder="Search by ID, type, amount…"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ ...inputSx, minWidth: 220 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} /></InputAdornment> }}
        />

        {/* Start date */}
        <TextField
          label="From"
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ ...inputSx, minWidth: 160 }}
        />

        {/* End date */}
        <TextField
          label="To"
          type="date"
          size="small"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ ...inputSx, minWidth: 160 }}
        />

        {/* Type */}
        <FormControl size="small" sx={{ ...inputSx, minWidth: 180 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ color: '#fff' }}
            MenuProps={{ PaperProps: { sx: { bgcolor: '#1A1A1A', color: '#fff' } } }}
          >
            {TX_TYPES.map(t => (
              <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize', fontSize: 14 }}>
                {t === 'all' ? 'All Types' : t.replace('_', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear filters */}
        {(startDate || endDate || typeFilter !== 'all' || search) && (
          <Typography
            onClick={() => { setStartDate(''); setEndDate(''); setTypeFilter('all'); setSearch(''); }}
            sx={{ fontSize: 13, color: '#F87171', cursor: 'pointer', ml: 'auto', '&:hover': { opacity: 0.7 } }}
          >
            Clear filters
          </Typography>
        )}
      </Box>

      {/* Table */}
      <Box sx={{ background: 'rgba(20,20,20,0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden' }}>

        {/* Table header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px 120px 100px', px: 3, py: 1.5, background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {['ID', 'Type', 'Date', 'Amount', 'Status'].map(h => (
            <Typography key={h} sx={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</Typography>
          ))}
        </Box>

        {/* Loading overlay */}
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={56} sx={{ mx: 3, my: 1, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.03)' }} />
          ))
        ) : visible.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>No transactions match your filters.</Typography>
          </Box>
        ) : (
          visible.map((tx, i) => {
            const isCredit = tx.direction === 'credit';
            return (
              <Box
                key={tx.transaction_id}
                sx={{
                  display: 'grid', gridTemplateColumns: '80px 1fr 140px 120px 100px',
                  px: 3, py: 2, alignItems: 'center',
                  borderBottom: i < visible.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  '&:hover': { background: 'rgba(255,255,255,0.02)' },
                  transition: 'background 0.15s',
                }}
              >
                {/* ID */}
                <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>#{tx.transaction_id}</Typography>

                {/* Type + direction */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 34, height: 34, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: isCredit ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                    border: `1px solid ${isCredit ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}`,
                  }}>
                    {isCredit
                      ? <TrendingUpRoundedIcon   sx={{ color: '#4ADE80', fontSize: 16 }} />
                      : <TrendingDownRoundedIcon sx={{ color: '#F87171', fontSize: 16 }} />
                    }
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>
                      {tx.transaction_type.replace(/_/g, ' ')}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                      {isCredit ? `From #${tx.from_account ?? '—'}` : `To #${tx.to_account ?? '—'}`}
                    </Typography>
                  </Box>
                </Box>

                {/* Date */}
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                  {tx.transaction_date ? fmtDate(tx.transaction_date) : (
                    <Chip label="Scheduled" size="small" sx={{ fontSize: 10, height: 20, background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }} />
                  )}
                </Typography>

                {/* Amount */}
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: isCredit ? '#4ADE80' : '#F87171' }}>
                  {isCredit ? '+' : '-'}{fmt(tx.amount)}
                </Typography>

                {/* Status */}
                <Box sx={{
                  display: 'inline-flex', px: 1.5, py: 0.4, borderRadius: '6px', width: 'fit-content', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  background: tx.status === 'success' ? 'rgba(74,222,128,0.08)' : tx.status === 'pending' ? 'rgba(251,191,36,0.08)' : 'rgba(248,113,113,0.08)',
                  color:      tx.status === 'success' ? '#4ADE80'              : tx.status === 'pending' ? '#FBBF24'              : '#F87171',
                  border: '1px solid',
                  borderColor: tx.status === 'success' ? 'rgba(74,222,128,0.2)' : tx.status === 'pending' ? 'rgba(251,191,36,0.2)' : 'rgba(248,113,113,0.2)',
                }}>
                  {tx.status}
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}