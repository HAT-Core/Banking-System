import { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, IconButton, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// Reusable styling for our dark glassmorphism inputs
const inputSx = {
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: 15,
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(159,255,152,0.35)' },
    '&.Mui-focused fieldset': { borderColor: '#9FFF98', borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.35)', fontSize: 14 },
  '& .MuiInputLabel-root.Mui-focused': { color: '#9FFF98' },
  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.35)' },
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // The Master Role State
  const [role, setRole] = useState('customer');

  // Form Data States
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    cnic: '',
    dob: '',
    phone: '',
    address: '',
    jobTitle: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    setLoading(true);
    // Here is where we will eventually send the JSON box to your Node server!
    console.log("Payload to send to DB:", { role, ...formData });
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        fontFamily: '"SF Pro Display", "Roboto", sans-serif',
      }}
    >
      {/* ── Left Panel: Branding ── */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse 100% 100% at 70% 40%, rgba(159,255,152,0.12) 0%, transparent 65%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box sx={{ width: 38, height: 38, background: '#9FFF98', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: 18, color: '#0E0E0E', fontWeight: 900 }}>✦</Typography>
            </Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>NexaBank</Typography>
          </Box>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <Box>
            <Typography sx={{ fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: -1.5, lineHeight: 1.1, mb: 3 }}>
              Claim your financial<br />
              <Box component="span" sx={{ color: '#9FFF98' }}>independence.</Box>
            </Typography>
            <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              Takes less than 2 minutes.<br />Zero hidden fees, infinite possibilities.
            </Typography>
          </Box>
        </motion.div>
        
        <Box /> {/* Empty box for spacing */}
      </Box>

      {/* ── Right Panel: Registration Form ── */}
      <Box sx={{ flex: { xs: 1, md: '0 0 520px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: { xs: 4, md: 7 }, py: 6, overflowY: 'auto' }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
            
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.8, mb: 1 }}>Create Account</Typography>
              <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Join NexaBank today.</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              {/* 1. Master Role Selector */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel id="role-select-label">Account Type</InputLabel>
                  <Select
                    labelId="role-select-label"
                    value={role}
                    label="Account Type"
                    onChange={(e) => setRole(e.target.value)}
                    sx={{ color: '#fff', '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.5)' } }}
                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1A1A1A', color: '#fff' } } }}
                  >
                    <MenuItem value="customer">Personal Customer</MenuItem>
                    <MenuItem value="employee">Bank Staff / Employee</MenuItem>
                  </Select>
                </FormControl>
              </motion.div>
{/* 2. Universal Fields (EVERYONE gets these now) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField name="username" label="Username" variant="outlined" fullWidth sx={inputSx} onChange={handleChange} />
                  <TextField 
                    name="password" label="Password" type={showPassword ? 'text' : 'password'} fullWidth sx={inputSx} onChange={handleChange}
                    InputProps={{ /* ... keep your eye icon code here ... */ }}
                  />
                </Box>
                
                {/* MOVED FROM CUSTOMER: Identity Fields are now Universal */}
                <TextField name="cnic" label="CNIC Number" variant="outlined" fullWidth sx={inputSx} onChange={handleChange} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField name="dob" label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} fullWidth sx={inputSx} onChange={handleChange} />
                  <TextField name="phone" label="Phone Number" variant="outlined" fullWidth sx={inputSx} onChange={handleChange} />
                </Box>
                <TextField name="address" label="Residential Address" variant="outlined" multiline rows={2} fullWidth sx={inputSx} onChange={handleChange} />
              </Box>

              {/* 3. The Dynamic Architecture (Only Job Title remains conditional) */}
              <AnimatePresence mode="popLayout">
                {role === 'employee' && (
                  <motion.div
                    key="employee-fields"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ mt: 2.5 }}>
                      <TextField name="jobTitle" label="Official Job Title" variant="outlined" fullWidth sx={inputSx} onChange={handleChange} />
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <Button
                  onClick={handleRegister}
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    background: loading ? 'rgba(159,255,152,0.5)' : '#9FFF98',
                    color: '#0E0E0E',
                    fontWeight: 700,
                    fontSize: 15,
                    py: 1.7,
                    mt: 2,
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: loading ? 'none' : '0 0 30px rgba(159,255,152,0.35)',
                    transition: 'all 0.3s',
                    '&:hover': { background: '#b8ffb3', boxShadow: '0 0 50px rgba(159,255,152,0.55)' },
                  }}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </motion.div>

              {/* Back to Login */}
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                  Already have an account?{' '}
                  <Box component="span" onClick={() => navigate('/login')} sx={{ color: '#9FFF98', cursor: 'pointer', fontWeight: 600, '&:hover': { opacity: 0.8 } }}>
                    Sign in
                  </Box>
                </Typography>
              </Box>

            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}