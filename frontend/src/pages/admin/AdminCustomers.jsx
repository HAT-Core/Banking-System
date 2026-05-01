import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, TextField, IconButton } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const MOCK_CUSTOMERS = [
  { id: 1, user_id: 201, username: 'p_parker', first_name: 'Peter', last_name: 'Parker', kyc_status: 'verified', status: 'active', created_at: '2026-04-10' },
  { id: 2, user_id: 205, username: 't_stark', first_name: 'Tony', last_name: 'Stark', kyc_status: 'pending', status: 'active', created_at: '2026-04-12' },
  { id: 3, user_id: 212, username: 'n_romanoff', first_name: 'Natasha', last_name: 'Romanoff', kyc_status: 'rejected', status: 'locked', created_at: '2026-04-15' },
];

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  background: '#111',
  border: '1px solid rgba(96,165,250,0.2)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
  borderRadius: '20px',
  p: 4,
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(96,165,250,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#60A5FA', borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#60A5FA' },
};

export default function AdminCustomers() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>Customer Records</Typography>
          <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>View and manage personal banking accounts.</Typography>
        </Box>
        <Button
          onClick={handleOpen}
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{ background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, borderRadius: '10px', px: 3, py: 1.2, textTransform: 'none', '&:hover': { background: '#93C5FD', boxShadow: '0 0 20px rgba(96,165,250,0.4)' } }}
        >
          Provision Customer
        </Button>
      </Box>

      <TableContainer sx={{ background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ background: 'rgba(0,0,0,0.4)' }}>
            <TableRow>
              <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>ID</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Name</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>KYC Status</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Account Status</TableCell>
              <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_CUSTOMERS.map((cust) => (
              <TableRow key={cust.id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                <TableCell sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>#{cust.customer_id || cust.id}</TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>{cust.first_name} {cust.last_name}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>@{cust.username}</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <Typography sx={{ color: cust.kyc_status === 'verified' ? '#4ADE80' : cust.kyc_status === 'rejected' ? '#F87171' : '#FBBF24', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
                    {cust.kyc_status}
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', background: cust.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: cust.status === 'active' ? '#4ADE80' : '#F87171', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                    {cust.status}
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={cust.status === 'active' ? <LockRoundedIcon /> : <LockOpenRoundedIcon />}
                    sx={{ color: cust.status === 'active' ? '#F87171' : '#4ADE80', borderColor: cust.status === 'active' ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)', textTransform: 'none', '&:hover': { borderColor: cust.status === 'active' ? '#F87171' : '#4ADE80', background: cust.status === 'active' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)' } }}
                  >
                    {cust.status === 'active' ? 'Lock Account' : 'Restore Access'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Provision New Customer</Typography>
            <IconButton onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.4)' }}><CloseRoundedIcon /></IconButton>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="First Name" fullWidth size="small" sx={inputSx} />
              <TextField label="Last Name" fullWidth size="small" sx={inputSx} />
            </Box>
            <TextField label="Username" fullWidth size="small" sx={inputSx} />
            <TextField label="Temporary Password" type="password" fullWidth size="small" sx={inputSx} />
            <TextField label="CNIC Number" fullWidth size="small" sx={inputSx} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" sx={inputSx} />
              <TextField label="Phone" fullWidth size="small" sx={inputSx} />
            </Box>
            <Button variant="contained" fullWidth sx={{ mt: 2, background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, py: 1.5, borderRadius: '10px', textTransform: 'none', '&:hover': { background: '#93C5FD' } }}>
              Create Account
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}