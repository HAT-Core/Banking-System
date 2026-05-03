import { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, Chip } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import api from '../utils/api';

// Stat card 
const SummaryCard = ({ title, value, icon, color, glow }) => (
  <Box sx={{
    background: 'rgba(20,20,20,0.7)', border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '20px', p: 3, flex: 1, position: 'relative', overflow: 'hidden',
    transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)', border: `1px solid ${glow}`, boxShadow: `0 8px 32px ${glow}` }
  }}>
    <Box sx={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, opacity: 0.6, pointerEvents: 'none' }} />
    <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: `rgba(${color},0.1)`, border: `1px solid rgba(${color},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>{title}</Typography>
    <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>{value}</Typography>
  </Box>
);

// Format helpers 
const fmt = (n) => `PKR ${parseFloat(n).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

export default function CustomerDashboard() {
  const [account, setAccount]       = useState(null);
  const [summary, setSummary]       = useState(null);
  const [transactions, setTx]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // Step 1 — get the customer's account(s)
        const { data: accounts } = await api.get('/accounts/my');
        if (!accounts.length) { setError('No active account found. Please contact your branch.'); setLoading(false); return; }

        // Step 2 — use the first account to fetch transactions + balance
        const accountId = accounts[0].account_id;
        const { data } = await api.get(`/transactions/${accountId}`);

        setAccount(data.account);
        setSummary(data.summary);
        setTx(data.transactions.slice(0, 8)); // show last 8 on dashboard
      } catch (err) {
        console.error(err);
        setError('Failed to load account data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <Box>
      <Skeleton variant="rounded" height={140} sx={{ mb: 3, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.04)' }} />
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={120} sx={{ flex: 1, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.04)' }} />)}
      </Box>
      <Skeleton variant="rounded" height={300} sx={{ borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.04)' }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <Typography sx={{ color: '#F87171', fontSize: 16 }}>{error}</Typography>
    </Box>
  );

  return (
    <Box>
      {/* Page title */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: -1, mb: 0.5 }}>
          Welcome back, {JSON.parse(localStorage.getItem('user') || '{}').firstName || 'there'} 👋
        </Typography>
        <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>
          Here's your financial snapshot.
        </Typography>
      </Box>

      {/* Balance hero card */}
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(159,255,152,0.08) 0%, rgba(159,255,152,0.02) 100%)',
        border: '1px solid rgba(159,255,152,0.15)', borderRadius: '24px', p: 4, mb: 3,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, background: 'radial-gradient(circle, rgba(159,255,152,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <AccountBalanceWalletRoundedIcon sx={{ color: '#9FFF98', fontSize: 20 }} />
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              {account?.account_type} account
            </Typography>
            <Chip
              label={account?.status}
              size="small"
              sx={{ height: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: account?.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: account?.status === 'active' ? '#4ADE80' : '#F87171', border: '1px solid', borderColor: account?.status === 'active' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)' }}
            />
          </Box>
          <Typography sx={{ fontSize: 46, fontWeight: 900, color: '#fff', letterSpacing: -2, lineHeight: 1 }}>
            {fmt(account?.balance ?? 0)}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', mt: 1 }}>Account #{account?.account_id}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', mb: 0.5 }}>Net flow (all time)</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: summary?.net >= 0 ? '#4ADE80' : '#F87171' }}>
            {summary?.net >= 0 ? '+' : ''}{fmt(summary?.net ?? 0)}
          </Typography>
        </Box>
      </Box>

      {/* Summary cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <SummaryCard
          title="Total Money In"
          value={fmt(summary?.total_incoming ?? 0)}
          icon={<TrendingUpRoundedIcon sx={{ color: '#4ADE80', fontSize: 22 }} />}
          color="74,222,128"
          glow="rgba(74,222,128,0.12)"
        />
        <SummaryCard
          title="Total Money Out"
          value={fmt(summary?.total_outgoing ?? 0)}
          icon={<TrendingDownRoundedIcon sx={{ color: '#F87171', fontSize: 22 }} />}
          color="248,113,113"
          glow="rgba(248,113,113,0.12)"
        />
        <SummaryCard
          title="Total Transactions"
          value={transactions.length}
          icon={<SwapHorizRoundedIcon sx={{ color: '#C084FC', fontSize: 22 }} />}
          color="192,132,252"
          glow="rgba(192,132,252,0.12)"
        />
      </Box>

      {/* Recent transactions */}
      <Box sx={{ background: 'rgba(20,20,20,0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Recent Transactions</Typography>
          <Typography sx={{ fontSize: 13, color: '#9FFF98', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
            View all →
          </Typography>
        </Box>

        {transactions.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>No transactions yet.</Typography>
          </Box>
        ) : (
          transactions.map((tx, i) => {
            const isCredit = tx.direction === 'credit';
            return (
              <Box
                key={tx.transaction_id}
                sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  px: 3, py: 2,
                  borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  '&:hover': { background: 'rgba(255,255,255,0.02)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Direction icon */}
                  <Box sx={{
                    width: 38, height: 38, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCredit ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                    border: `1px solid ${isCredit ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                  }}>
                    {isCredit
                      ? <TrendingUpRoundedIcon sx={{ color: '#4ADE80', fontSize: 18 }} />
                      : <TrendingDownRoundedIcon sx={{ color: '#F87171', fontSize: 18 }} />
                    }
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>
                      {tx.transaction_type.replace('_', ' ')}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                      {fmtDate(tx.transaction_date)} · #{tx.transaction_id}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: isCredit ? '#4ADE80' : '#F87171' }}>
                    {isCredit ? '+' : '-'}{fmt(tx.amount)}
                  </Typography>
                  <Box sx={{
                    display: 'inline-block', px: 1, py: 0.2, borderRadius: '4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    background: tx.status === 'success' ? 'rgba(74,222,128,0.08)' : tx.status === 'pending' ? 'rgba(251,191,36,0.08)' : 'rgba(248,113,113,0.08)',
                    color: tx.status === 'success' ? '#4ADE80' : tx.status === 'pending' ? '#FBBF24' : '#F87171',
                  }}>
                    {tx.status}
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}