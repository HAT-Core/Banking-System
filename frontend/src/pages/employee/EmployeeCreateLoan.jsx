import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button,
  Alert, CircularProgress, Snackbar,
  MenuItem, Select, FormControl, InputLabel, FormHelperText,
} from '@mui/material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import InfoOutlinedIcon     from '@mui/icons-material/InfoOutlined';
import api from '../utils/api';

const ACCENT = '#9FFF98';
const MAX_LOAN_AMOUNT = 3_000_000;

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    '& fieldset':               { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset':         { borderColor: 'rgba(159,255,152,0.3)' },
    '&.Mui-focused fieldset':   { borderColor: ACCENT },
  },
  '& .MuiInputLabel-root':             { color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
  '& .MuiFormHelperText-root':         { color: 'rgba(255,255,255,0.3)' },
};

export default function EmployeeCreateLoan() {
  const [loanTypes, setLoanTypes] = useState([]);

  useEffect(() => {
    api.get('/loans/types')
      .then(res => setLoanTypes(res.data))
      .catch(() => setLoanTypes([]));
  }, []);

  const [form, setForm] = useState({
    accountId:       '',
    loanTypeId:      '',
    amount:          '',
    durationMonths:  '',
  });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  
  const selectedType = loanTypes.find(lt => lt.loan_type_id === form.loanTypeId);
  const maxMonths = selectedType ? selectedType.max_years * 12 : null;

  
  const interestRate = selectedType ? parseFloat(selectedType.interest_rate) : 0;
  const years = form.durationMonths ? Number(form.durationMonths) / 12 : 0;
  const totalInterest = form.amount && selectedType
    ? Number(form.amount) * (interestRate / 100) * years
    : 0;
  const totalRepayable = form.amount ? Number(form.amount) + totalInterest : 0;
  const monthlyAmount =
    form.amount && form.durationMonths && Number(form.durationMonths) > 0 && selectedType
      ? (totalRepayable / Number(form.durationMonths)).toFixed(2)
      : null;

  const handleSubmit = async () => {
    setError('');
    const { accountId, loanTypeId, amount, durationMonths } = form;

    // Basic front-end validation
    if (!accountId || !loanTypeId || !amount || !durationMonths) {
      setError('All four fields are required.');
      return;
    }
    if (Number(amount) <= 0) {
      setError('Loan amount must be greater than zero.');
      return;
    }
    if (Number(amount) > MAX_LOAN_AMOUNT) {
      setError(`Loan amount cannot exceed PKR ${MAX_LOAN_AMOUNT.toLocaleString('en-PK')}.`);
      return;
    }
    if (!maxMonths) {
      setError('Please select a valid loan type.');
      return;
    }
    if (Number(durationMonths) < 1 || Number(durationMonths) > maxMonths) {
      setError(`Duration must be between 1 and ${maxMonths} months for this loan type.`);
      return;
    }

    setLoading(true);
    try {
      await api.post('/loans/create', {
        accountId:      Number(accountId),
        loanTypeId:     Number(loanTypeId),
        amount:         parseFloat(amount),
        durationMonths: Number(durationMonths),
      });

      setSnackbar({
        open: true,
        message: `Loan of PKR ${Number(amount).toLocaleString('en-PK')} created — ${durationMonths} installments generated.`,
      });

      // Reset form
      setForm({ accountId: '', loanTypeId: '', amount: '', durationMonths: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create loan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
          Create Loan
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>
          Issue a new loan and auto-generate the full installment schedule
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Form Card */}
        <Box sx={{ flex: '1 1 460px', maxWidth: 560, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', p: 4 }}>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fff' }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            <TextField
              label="Customer Account ID"
              name="accountId"
              value={form.accountId}
              onChange={handleChange}
              type="number"
              fullWidth
              sx={fieldSx}
              helperText="The account_id belonging to the customer receiving the loan"
            />

            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>Loan Type</InputLabel>
              <Select
                label="Loan Type"
                name="loanTypeId"
                value={form.loanTypeId}
                onChange={handleChange}
                sx={{ color: '#fff', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}
                MenuProps={{ PaperProps: { sx: { background: '#1a1a1a', color: '#fff' } } }}
              >
                {loanTypes.length === 0 && (
                  <MenuItem disabled value=""><em>Loading…</em></MenuItem>
                )}
                {loanTypes.map(lt => (
                  <MenuItem key={lt.loan_type_id} value={lt.loan_type_id}>
                    {lt.type_name} — {lt.interest_rate}% interest, max {lt.max_years} yrs
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={{ color: 'rgba(255,255,255,0.3)' }}>
                Loan types are fetched live from the database
              </FormHelperText>
            </FormControl>

            <TextField
              label="Loan Amount (PKR)"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              type="number"
              fullWidth
              sx={fieldSx}
              inputProps={{ min: 1, max: MAX_LOAN_AMOUNT }}
              helperText={`Maximum PKR ${MAX_LOAN_AMOUNT.toLocaleString('en-PK')}`}
            />

            <TextField
              label="Duration (Months)"
              name="durationMonths"
              value={form.durationMonths}
              onChange={handleChange}
              type="number"
              fullWidth
              sx={fieldSx}
              inputProps={{ min: 1, max: maxMonths || undefined }}
              helperText={
                maxMonths
                  ? `Minimum 1, maximum ${maxMonths} months (${selectedType.max_years} yrs) for this loan type`
                  : 'Select a loan type first to see duration limits'
              }
            />

            {/* Installment Preview */}
            {monthlyAmount && (
              <Box sx={{ background: 'rgba(159,255,152,0.05)', border: `1px solid rgba(159,255,152,0.15)`, borderRadius: '14px', p: 3 }}>
                <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                  Installment Preview
                </Typography>

                <Typography sx={{ fontSize: 30, fontWeight: 800, color: ACCENT, letterSpacing: -1 }}>
                  PKR {Number(monthlyAmount).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>

                <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>
                  per month × {form.durationMonths} months
                </Typography>

                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Principal</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                      PKR {Number(form.amount).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Interest ({interestRate}% p.a.)</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>
                      + PKR {totalInterest.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Total Repayable</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                      PKR {totalRepayable.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading
                ? <CircularProgress size={16} sx={{ color: '#0A0A0A' }} />
                : <AddCircleRoundedIcon />
              }
              sx={{ background: ACCENT, color: '#0A0A0A', fontWeight: 700, fontSize: 15, py: 1.6, borderRadius: '12px', textTransform: 'none', mt: 1, transition: 'all 0.25s', '&:hover': { background: '#7AFF72', boxShadow: `0 0 28px rgba(159,255,152,0.35)` }, '&:disabled': { background: 'rgba(159,255,152,0.25)', color: 'rgba(0,0,0,0.5)' } }}
            >
              {loading ? 'Creating Loan…' : 'Create Loan & Generate Installments'}
            </Button>
          </Box>
        </Box>

        {/* Info Side Panel */}
        <Box sx={{ flex: '0 1 280px', display: 'flex', flexDirection: 'column', gap: 2 }}>

          <Box sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 16 }} />
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                What happens on submit
              </Typography>
            </Box>

            {[
              'A new loan record is inserted into the database',
              'The installment schedule is auto-generated — one row per month',
              'Each installment starts with status: pending',
              'The customer can see and pay their installments from their portal',
            ].map((step, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(159,255,152,0.1)', border: '1px solid rgba(159,255,152,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.1 }}>
                  <Typography sx={{ fontSize: 10, color: ACCENT, fontWeight: 700 }}>{i + 1}</Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{step}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '16px', p: 3 }}>
            <Typography sx={{ fontSize: 12, color: '#F59E0B', fontWeight: 600, mb: 1 }}>⚠ Remember</Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              The account must belong to a <strong style={{ color: 'rgba(255,255,255,0.7)' }}>KYC-verified</strong> customer. Loans issued to unverified accounts may be flagged during audit.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          onClose={() => setSnackbar(p => ({ ...p, open: false }))}
          sx={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#fff', borderRadius: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
