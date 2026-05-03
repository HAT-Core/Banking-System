import{useState, useEffect } from 'react';
import{Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, TextField, IconButton, Alert } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import api from '../utils/api'; 

const modalStyle ={
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
  
  '& input[type="date"]::-webkit-calendar-picker-indicator': {
    filter: 'invert(1)', //Forces the black calendar icon to turn white
    opacity: 0.5,
    cursor: 'pointer',
    '&:hover': { opacity: 1 },
  },
  '& input[type="date"]': {
    color: 'rgba(255,255,255,0.8)', 
  }
};

export default function AdminCustomers(){
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', password: '', cnic: '', phone: '', address: 'Registered Online', dateOfBirth: '', role: 'customer'
  });

  useEffect(() =>{
    fetchCustomers();
  }, []);

  const fetchCustomers = async () =>{
    try{
      const{data } = await api.get('/admin/users/customers');
      setCustomers(data);
    }
    catch (error){
      console.error("Failed to fetch customers", error);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) =>{
    try{
      const newStatus = currentStatus === 'active' ? 'locked' : 'active';
      await api.put(`/admin/users/${userId}/status`,{status: newStatus });
      await fetchCustomers(); 
    }
    catch (error){
      console.error("Failed to update status", error);
    }
  };

  const handleRegister = async () =>{
    setErrorMsg('');
    setSuccessMsg('');

    try{
      await api.post('/auth/register', formData);
      
      setFormData({firstName: '', lastName: '', username: '', password: '', cnic: '', phone: '', address: 'Registered Online', dateOfBirth: '', role: 'customer' });
      setSuccessMsg(`Customer ${formData.firstName} ${formData.lastName} successfully registered.`);
      setOpen(false);
      
      //Prevent the Race Condition
      setTimeout(async () =>{
        await fetchCustomers(); 
      }, 500);

    } 
    catch (error){
      console.error("Registration failed", error);
      if (error.response && error.response.data){
        setErrorMsg(error.response.data.message || error.response.data.error || "Failed to register customer.");
      }
      else{
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
          <Typography sx={{fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>Customer Records</Typography>
          <Typography sx={{fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>View and manage personal banking accounts.</Typography>
          
    {/* Success Message */}
    {successMsg && (
             <Alert severity="success" sx={{mt: 2, background: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.3)', '& .MuiAlert-icon':{color: '#4ADE80' } }}>
         {successMsg}
             </Alert>
          )}
        </Box>
        <Button
          onClick={() =>{setOpen(true); setErrorMsg(''); }}
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, borderRadius: '10px', px: 3, py: 1.2, textTransform: 'none', '&:hover':{background: '#93C5FD', boxShadow: '0 0 20px rgba(96,165,250,0.4)' } }}
        >
          Register Customer
        </Button>
      </Box>

      <TableContainer sx={{background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{background: 'rgba(0,0,0,0.4)' }}>
            <TableRow>
              <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>ID</TableCell>
              <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Name</TableCell>
              <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>KYC Status</TableCell>
              <TableCell sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Account Status</TableCell>
              <TableCell align="right" sx={{color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
      {customers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{color: 'rgba(255,255,255,0.4)', py: 4, borderBottom: 'none' }}>
                        No customers found. Register a new customer to get started.
                    </TableCell>
                </TableRow>
            ) : (
              customers.map((cust) => (
                <TableRow key={cust.user_id} sx={{'&:hover':{background: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>#{cust.customer_id}</TableCell>
                  <TableCell sx={{borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <Typography sx={{color: '#fff', fontWeight: 600 }}>{cust.first_name}{cust.last_name}</Typography>
                    <Typography sx={{color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>@{cust.username}</Typography>
                  </TableCell>
                  <TableCell sx={{borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <Typography sx={{color: cust.kyc_status === 'verified' ? '#4ADE80' : cust.kyc_status === 'rejected' ? '#F87171' : '#FBBF24', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
                {cust.kyc_status}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <Box sx={{display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', background: cust.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: cust.status === 'active' ? '#4ADE80' : '#F87171', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                {cust.status}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <Button
                      onClick={() => handleToggleStatus(cust.user_id, cust.status)}
                      variant="outlined"
                      size="small"
                      startIcon={cust.status === 'active' ? <LockRoundedIcon /> : <LockOpenRoundedIcon />}
                      sx={{color: cust.status === 'active' ? '#F87171' : '#4ADE80', borderColor: cust.status === 'active' ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)', textTransform: 'none', '&:hover':{borderColor: cust.status === 'active' ? '#F87171' : '#4ADE80', background: cust.status === 'active' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)' } }}
                    >
                {cust.status === 'active' ? 'Lock Account' : 'Restore Access'}
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
            <Typography sx={{fontSize: 20, fontWeight: 700, color: '#fff' }}>Register New Customer</Typography>
            <IconButton onClick={() => setOpen(false)} sx={{color: 'rgba(255,255,255,0.4)' }}><CloseRoundedIcon /></IconButton>
          </Box>
          
    {/* Error Message */}
    {errorMsg && (
            <Alert severity="error" sx={{mb: 3, background: 'rgba(239,68,68,0.05)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)', '& .MuiAlert-icon':{color: '#F87171' } }}>
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
            <TextField name="cnic" onChange={handleChange} value={formData.cnic} label="CNIC (without dashes)" placeholder='35201xxxxxxxx' inputProps={{maxLength: 13, inputMode: 'numeric'}} fullWidth size="small" sx={inputSx} />
            <Box sx={{display: 'flex', gap: 2 }}>
              <TextField 
                name="dateOfBirth" 
                onChange={handleChange} 
                value={formData.dateOfBirth} 
                label="Date of Birth" 
                type="date"
                inputProps={{ style: { colorScheme: 'dark' } }} 
                fullWidth 
                size="small" 
                sx={{
                  ...inputSx,
                  '& input::-webkit-datetime-edit': {
                    color: formData.dateOfBirth ? '#fff' : 'transparent',
                  },
                  '& input:focus::-webkit-datetime-edit': {
                    color: '#fff',
                  }
                }} 
              />
              <TextField name="phone" onChange={handleChange} value={formData.phone} label="Phone Number" placeholder='03xxxxxxxxx' inputProps={{maxLength: 11, inputMode: 'numeric'}} fullWidth size="small" sx={inputSx} />
            </Box>
            <Button onClick={handleRegister} variant="contained" fullWidth sx={{mt: 2, background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, py: 1.5, borderRadius: '10px', textTransform: 'none', '&:hover':{background: '#93C5FD' } }}>
              Register Customer
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}