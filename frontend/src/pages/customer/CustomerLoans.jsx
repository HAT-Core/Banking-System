import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, Button, CircularProgress,
  Alert, Snackbar, Skeleton, Collapse,
} from '@mui/material';
import AccountBalanceRoundedIcon  from '@mui/icons-material/AccountBalanceRounded';
import ExpandMoreRoundedIcon      from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon      from '@mui/icons-material/ExpandLessRounded';
import PaymentsRoundedIcon        from '@mui/icons-material/PaymentsRounded';
import CalendarTodayRoundedIcon   from '@mui/icons-material/CalendarTodayRounded';
import api from '../utils/api';

const ACCENT = '#9FFF98';
const fmt     = (n) => `PKR ${parseFloat(n).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

const statusChip = (status) => {
  const map = {
    running:   { bg: 'rgba(159,255,152,0.1)',  border: 'rgba(159,255,152,0.25)', color: '#9FFF98',  label: 'Running'   },
    completed: { bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)',   color: '#4ADE80',  label: 'Completed' },
    defaulted: { bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)', color: '#F87171',  label: 'Defaulted' },
    pending:   { bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.25)',  color: '#FBBF24',  label: 'Pending'   },
    paid:      { bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)',   color: '#4ADE80',  label: 'Paid'      },
    overdue:   { bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)', color: '#F87171',  label: 'Overdue'   },
  };
  const s = map[status] || map.pending;
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontWeight: 700, fontSize: 11 }}
    />
  );
};

// One loan card with expandable installment schedule
function LoanCard({ loan, onPay, payingId }) {
  const [open,         setOpen]         = useState(false);
  const [installments, setInstallments] = useState(null);
  const [loadingInst,  setLoadingInst]  = useState(false);

  const toggleInstallments = async () => {
    if (!open && !installments) {
      setLoadingInst(true);
      try {
        const res = await api.get(`/loans/${loan.loan_id}/installments`);
        setInstallments(res.data);
      } catch {
        setInstallments([]);
      } finally {
        setLoadingInst(false);
      }
    }
    setOpen(p => !p);
  };

  // Progress: how many installments paid
  const paidCount    = installments ? installments.filter(i => i.status === 'paid').length    : null;
  const totalCount   = installments ? installments.length                                       : null;
  const progressPct  = paidCount !== null && totalCount ? Math.round((paidCount / totalCount) * 100) : null;

  return (
    <Box sx={{ background: 'rgba(20,20,20,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden', transition: 'border-color 0.2s', '&:hover': { borderColor: 'rgba(159,255,152,0.12)' } }}>

      {/* Loan summary row */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 46, height: 46, borderRadius: '13px', background: 'rgba(159,255,152,0.08)', border: '1px solid rgba(159,255,152,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AccountBalanceRoundedIcon sx={{ color: ACCENT, fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{loan.type_name}</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, mt: 0.2 }}>
              Loan #{loan.loan_id} · {loan.interest_rate}% interest
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Principal</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>{fmt(loan.amount)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>End Date</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{fmtDate(loan.end_date)}</Typography>
          </Box>
          {statusChip(loan.status)}
        </Box>

        <Button
          onClick={toggleInstallments}
          endIcon={open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          sx={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, px: 2, py: 0.8, '&:hover': { background: 'rgba(255,255,255,0.04)', color: '#fff' } }}
        >
          {open ? 'Hide' : 'View'} Schedule
        </Button>
      </Box>

      {/* Progress bar (shown once installments loaded) */}
      {progressPct !== null && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Repayment progress</Typography>
            <Typography sx={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>{paidCount}/{totalCount} paid</Typography>
          </Box>
          <Box sx={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${progressPct}%`, background: ACCENT, borderRadius: '4px', transition: 'width 0.6s ease', boxShadow: `0 0 8px rgba(159,255,152,0.4)` }} />
          </Box>
        </Box>
      )}

      {/* Installment schedule */}
      <Collapse in={open}>
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', px: 3, py: 2 }}>

          {loadingInst && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} sx={{ color: ACCENT }} />
            </Box>
          )}

          {!loadingInst && installments && installments.length === 0 && (
            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', py: 2 }}>
              No installments found for this loan.
            </Typography>
          )}

          {!loadingInst && installments && installments.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Column headers */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '40px 1fr 160px 100px 130px', px: 1, mb: 0.5 }}>
                {['#', 'Due Date', 'Amount', 'Status', ''].map(h => (
                  <Typography key={h} sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</Typography>
                ))}
              </Box>

              {installments.map((inst, idx) => (
                <Box
                  key={inst.installment_id}
                  sx={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 160px 100px 130px',
                    alignItems: 'center', px: 1.5, py: 1.5, borderRadius: '10px',
                    background: inst.status === 'pending' ? 'rgba(255,255,255,0.02)' : 'transparent',
                    border: inst.status === 'pending' ? '1px solid rgba(255,255,255,0.04)' : '1px solid transparent',
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{idx + 1}</Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayRoundedIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }} />
                    <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{fmtDate(inst.due_date)}</Typography>
                  </Box>

                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{fmt(inst.amount)}</Typography>

                  {statusChip(inst.status)}

                  {inst.status === 'pending' && (
                    <Button
                      size="small"
                      disabled={payingId === inst.installment_id}
                      startIcon={
                        payingId === inst.installment_id
                          ? <CircularProgress size={12} sx={{ color: '#0A0A0A' }} />
                          : <PaymentsRoundedIcon fontSize="small" />
                      }
                      onClick={() => onPay(inst.installment_id)}
                      sx={{ background: ACCENT, color: '#0A0A0A', fontWeight: 700, fontSize: 12, px: 2, py: 0.6, borderRadius: '8px', textTransform: 'none', '&:hover': { background: '#7AFF72', boxShadow: '0 0 12px rgba(159,255,152,0.3)' }, '&:disabled': { background: 'rgba(159,255,152,0.2)', color: 'rgba(0,0,0,0.4)' } }}
                    >
                      {payingId === inst.installment_id ? 'Paying…' : 'Pay Now'}
                    </Button>
                  )}

                  {inst.status === 'paid' && (
                    <Typography sx={{ fontSize: 12, color: '#4ADE80', fontWeight: 600 }}>
                      ✓ {inst.paid_date ? fmtDate(inst.paid_date) : 'Paid'}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

// Main Page 
export default function CustomerLoans() {
  const [loans,     setLoans]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [payingId,  setPayingId]  = useState(null);
  const [snackbar,  setSnackbar]  = useState({ open: false, message: '', severity: 'success' });

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/loans/my-loans');
      setLoans(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load loans.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const handlePay = async (installmentId) => {
    setPayingId(installmentId);
    try {
      await api.post(`/loans/pay-installment/${installmentId}`);
      setSnackbar({ open: true, message: 'Installment paid successfully! Your balance has been updated.', severity: 'success' });
      // Refresh loans to update progress
      fetchLoans();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Payment failed. Please try again.', severity: 'error' });
    } finally {
      setPayingId(null);
    }
  };

  const runningCount = loans.filter(l => l.status === 'running').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: -1, mb: 0.5 }}>My Loans</Typography>
        <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>
          View your active loans and manage installment payments
        </Typography>
      </Box>

      {/* Stats */}
      {!loading && !error && loans.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Loans',   value: loans.length,   color: '#fff'   },
            { label: 'Active',        value: runningCount,   color: ACCENT   },
            { label: 'Completed',     value: loans.filter(l => l.status === 'completed').length, color: '#4ADE80' },
          ].map(s => (
            <Box key={s.label} sx={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', px: 3, py: 2, minWidth: 140 }}>
              <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>{s.label}</Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.04)' }} />)}
        </Box>
      )}

      {/* Error */}
      {!loading && error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}

      {/* Empty */}
      {!loading && !error && loans.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <AccountBalanceRoundedIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>No loans yet</Typography>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', mt: 1 }}>Contact your branch to apply for a loan.</Typography>
        </Box>
      )}

      {/* Loan cards */}
      {!loading && !error && loans.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loans.map(loan => (
            <LoanCard key={loan.loan_id} loan={loan} onPay={handlePay} payingId={payingId} />
          ))}
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
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
