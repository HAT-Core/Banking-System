import {useState, useEffect } from 'react';
import {Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, TextField, IconButton, Alert } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import api from '../utils/api';

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
    '& fieldset': {borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': {borderColor: 'rgba(96,165,250,0.4)' },
    '&.Mui-focused fieldset': {borderColor: '#60A5FA', borderWidth: 1 },
  },
  '& .MuiInputLabel-root': {color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputLabel-root.Mui-focused': {color: '#60A5FA' },
};

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', password: '', cnic: '', phone: '', address: 'Bank Branch', dateOfBirth: '1990-01-01', jobTitle: '', role: 'employee'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const {data } = await api.get('/admin/users/employees');
      setEmployees(data);
    }
    catch (error){
      console.error("Failed to fetch employees", error);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try{
      const newStatus = currentStatus === 'active' ? 'locked' : 'active';
      await api.put(`/admin/users/${userId}/status`, {status: newStatus });
      await fetchEmployees(); 
    }
    catch (error){
      console.error("Failed to update status", error);
    }
  };

  const handleProvision = async () => {
    setErrorMsg('');
    setSuccessMsg(''); 

    if (formData.cnic.length !== 13 || !/^\d{13}$/.test(formData.cnic)) {
      setErrorMsg('CNIC must be exactly 13 digits with no dashes.');
      return;
    }
    if (formData.phone.length !== 11 || !/^\d{11}$/.test(formData.phone)) {
      setErrorMsg('Phone number must be exactly 11 digits (e.g. 03001234567).');
      return;
    }

    try{
      await api.post('/auth/register', formData);
      
      const name = `${formData.firstName} ${formData.lastName}`;
      setFormData({firstName: '', lastName: '', username: '', password: '', cnic: '', phone: '', address: 'Bank Branch', dateOfBirth: '1990-01-01', jobTitle: '', role: 'employee' });
      setSuccessMsg(`Employee ${name} successfully registered.`);
      setOpen(false);
      
      setTimeout(async () => {
        await fetchEmployees(); 
      }, 500);
    }
    catch (error){
      console.error("Registration failed", error);
      if (error.response && error.response.data) {
        setErrorMsg(error.response.data.message || error.response.data.error || "Failed to register employee.");
      }
      else {
        setErrorMsg("Network error. Could not reach the server.");
      }
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cnic') {
      value = value.replace(/\D/g, ''); 
      if (value.length > 13) value = value.slice(0, 13); 
    } 
    else if (name === 'phone') {
      value = value.replace(/\D/g, ''); 
      if (value.length > 11) value = value.slice(0, 11);
    }

    setFormData({ ...formData, [name]: value });
  };

  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5 }}>
        <Box>
          <Typography sx={{fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>Staff Directory</Typography>
          <Typography sx={{fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>Manage bank employees and access levels.</Typography>
          
          {successMsg && (
             <Alert severity="success" sx={{mt: 2, background: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.3)', '& .MuiAlert-icon': {color: '#4ADE80' } }}>
               {successMsg}
             </Alert>
          )}
        </Box>
        <Button
          onClick={() => {setOpen(true); setErrorMsg(''); }}
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, borderRadius: '10px', px: 3, py: 1.2, textTransform: 'none', '&:hover': {background: '#93C5FD', boxShadow: '0 0 20px rgba(96,165,250,0.4)' } }}
        >
          Register Employee
        </Button>
      </Box>

      <TableContainer sx={{background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{background: 'rgba(0,0,0,0.4)' }}>
            <TableRow>
              <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>ID</TableCell>
              <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Name</TableCell>
              <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Job Title</TableCell>
              <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</TableCell>
              <TableCell align="right" sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{color: 'rgba(255,255,255,0.4)', py: 4, borderBottom: 'none' }}>
                        No employees found. Register a new employee to get started.
                    </TableCell>
                </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.user_id} sx={{'&:hover': {background: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>#{emp.employee_id}</TableCell>
                  <TableCell sx={{borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <Typography sx={{color: '#fff', fontWeight: 600 }}>{emp.first_name} {emp.last_name}</Typography>
                    <Typography sx={{color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>@{emp.username}</Typography>
                  </TableCell>
                  <TableCell sx={{color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>{emp.job_title}</TableCell>
                  <TableCell sx={{borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <Box sx={{display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', background: emp.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: emp.status === 'active' ? '#4ADE80' : '#F87171', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                      {emp.status}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <Button
                      onClick={() => handleToggleStatus(emp.user_id, emp.status)}
                      variant="outlined"
                      size="small"
                      startIcon={emp.status === 'active' ? <LockRoundedIcon /> : <LockOpenRoundedIcon />}
                      sx={{color: emp.status === 'active' ? '#F87171' : '#4ADE80', borderColor: emp.status === 'active' ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)', textTransform: 'none', '&:hover': {borderColor: emp.status === 'active' ? '#F87171' : '#4ADE80', background: emp.status === 'active' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)' } }}
                    >
                      {emp.status === 'active' ? 'Lock Account' : 'Restore Access'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography sx={{fontSize: 20, fontWeight: 700, color: '#fff' }}>Register New Employee</Typography>
            <IconButton onClick={() => setOpen(false)} sx={{color: 'rgba(255,255,255,0.4)' }}><CloseRoundedIcon /></IconButton>
          </Box>
          
          {errorMsg && (
            <Alert severity="error" sx={{mb: 3, background: 'rgba(239,68,68,0.05)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)', '& .MuiAlert-icon': {color: '#F87171' } }}>
              {errorMsg}
            </Alert>
          )}

          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{display: 'flex', gap: 2 }}>
              <TextField name="firstName" onChange={handleChange} value={formData.firstName} label="First Name" fullWidth size="small" sx={inputSx} />
              <TextField name="lastName" onChange={handleChange} value={formData.lastName} label="Last Name" fullWidth size="small" sx={inputSx} />
            </Box>
            <TextField name="username" onChange={handleChange} value={formData.username} label="Username" fullWidth size="small" sx={inputSx} />
            <TextField name="password" onChange={handleChange} value={formData.password} label="Password" type="password" fullWidth size="small" sx={inputSx} />
            <Box sx={{display: 'flex', gap: 2 }}>
              <TextField name="cnic" onChange={handleChange} value={formData.cnic} label="CNIC (without dashes)" placeholder="35201xxxxxxxx" inputProps={{maxLength: 13, inputMode: 'numeric', pattern: '[0-9]*' }} fullWidth size="small" sx={inputSx} />
              <TextField name="phone" onChange={handleChange} value={formData.phone} label="Phone Number" placeholder="03xxxxxxxxx" inputProps={{maxLength: 11, inputMode: 'numeric', pattern: '[0-9]*' }} fullWidth size="small" sx={inputSx} />
            </Box>
            <TextField name="jobTitle" onChange={handleChange} value={formData.jobTitle} label="Job Title" fullWidth size="small" sx={inputSx} />
            <Button onClick={handleProvision} variant="contained" fullWidth sx={{mt: 2, background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, py: 1.5, borderRadius: '10px', textTransform: 'none', '&:hover': {background: '#93C5FD' } }}>
              Create Account
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}