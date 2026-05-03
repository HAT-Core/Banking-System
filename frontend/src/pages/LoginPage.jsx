import {useState } from 'react';
import {Box, Typography, TextField, Button, InputAdornment, IconButton, Alert } from '@mui/material';
import {motion, AnimatePresence } from 'framer-motion';
import {useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import api from './utils/api'; 

const getInputSx = (themeColor) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: 15,
    '& fieldset': {borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': {borderColor: `${themeColor}55` },
    '&.Mui-focused fieldset': {borderColor: themeColor, borderWidth: 1 },
  },
  '& .MuiInputLabel-root': {color: 'rgba(255,255,255,0.35)', fontSize: 14 },
  '& .MuiInputLabel-root.Mui-focused': {color: themeColor },
});

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('customer');
  const [errorMsg, setErrorMsg] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    if (!username || !password) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/auth/login', {username, password });
      const {token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        if (loginType === 'customer') console.warn("Staff logged in via Personal portal.");
        navigate('/admin/dashboard');
      } 
      else if (user.role === 'employee') {
        if (loginType === 'customer') console.warn("Staff logged in via Personal portal.");
        navigate('/employee/kyc'); 
      } 
      else if (user.role === 'customer') {
        if (loginType === 'staff') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setErrorMsg("Access Denied: You do not have staff clearance.");
          setLoading(false);
          return;
        }
        navigate('/dashboard'); 
      }
    }
    catch (error) {
      console.error("Login failed:", error);
      if (error.response && error.response.data) {
        setErrorMsg(error.response.data.message);
      }
      else{
        setErrorMsg("Cannot connect to server. Please try again later.");
      }
    }
    finally {
      setLoading(false);
    }
  };

  const themeColor = loginType === 'customer' ? '#9FFF98' : '#60A5FA';
  const themeHover = loginType === 'customer' ? '#b8ffb3' : '#93C5FD';
  const themeGlow = loginType === 'customer' ? 'rgba(159,255,152,0.15)' : 'rgba(96,165,250,0.15)';

  return (
    <Box sx={{minHeight: '100vh', background: '#0A0A0A', display: 'flex', fontFamily: '"SF Pro Display", "Roboto", sans-serif' }}>
      
      <Box sx={{flex: 1, display: {xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', p: 6, position: 'relative', overflow: 'hidden', background: `radial-gradient(ellipse 100% 100% at 30% 60%, ${themeGlow} 0%, transparent 65%)`, borderRight: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.5s ease' }}>
        <Box sx={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
        
        <motion.div initial={{opacity: 0, y: -20 }} animate={{opacity: 1, y: 0 }} transition={{duration: 0.6 }}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box sx={{width: 38, height: 38, background: themeColor, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.5s ease' }}>
              <Typography sx={{fontSize: 18, color: '#0E0E0E', fontWeight: 900 }}>✦</Typography>
            </Box>
            <Typography sx={{fontSize: 18, fontWeight: 700, color: '#fff' }}>HATCoreBank</Typography>
          </Box>
        </motion.div>

        <motion.div initial={{opacity: 0, y: 30 }} animate={{opacity: 1, y: 0 }} transition={{duration: 0.8, delay: 0.3 }}>
          <Box>
            <AnimatePresence mode="wait">
              <motion.div key={loginType} initial={{opacity: 0, y: 10 }} animate={{opacity: 1, y: 0 }} exit={{opacity: 0, y: -10 }} transition={{duration: 0.3 }}>
                <Typography sx={{fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: -1.5, lineHeight: 1.1, mb: 3 }}>
                  {loginType === 'customer' ? 'Banking for the' : 'Internal System'}
                  <br />
                  <Box component="em" sx={{fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,0.4)' }}>
                    {loginType === 'customer' ? 'next generation.' : 'Authorized personnel.'}
                  </Box>
                </Typography>
                <Typography sx={{fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                  {loginType === 'customer' ? <>Secure, instant, and borderless.<br />Your money, your rules.</> : <>Access the branch management suite.<br />Verify identity and process secure transactions.</>}
                </Typography>
              </motion.div>
            </AnimatePresence>
          </Box>
        </motion.div>

        <motion.div initial={{opacity: 0, scale: 0.9 }} animate={{opacity: 1, scale: 1 }} transition={{duration: 0.7, delay: 0.5 }}>
          <motion.div animate={{y: [0, -8, 0] }} transition={{duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <Box sx={{background: '#111', border: `1px solid ${themeGlow}`, borderRadius: '20px', p: 3, maxWidth: 280, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', transition: 'border 0.5s ease' }}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase' }}>
                  {loginType === 'customer' ? 'Balance' : 'System Status'}
                </Typography>
                <Box sx={{width: 24, height: 24, borderRadius: '50%', background: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.5s ease' }}>
                  <Typography sx={{fontSize: 10, color: '#0E0E0E', fontWeight: 700 }}>N</Typography>
                </Box>
              </Box>
              <Typography sx={{fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: -1, mb: 0.5 }}>
                {loginType === 'customer' ? '$24,831.50' : 'SECURE'}
              </Typography>
              <Typography sx={{fontSize: 12, color: themeColor, transition: 'color 0.5s ease' }}>
                {loginType === 'customer' ? '↑ +2.4% this month' : 'Connection Encrypted'}
              </Typography>
            </Box>
          </motion.div>
        </motion.div>
      </Box>

      <Box sx={{flex: {xs: 1, md: '0 0 480px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: {xs: 4, md: 7 }, py: 6 }}>
        <motion.div initial={{opacity: 0, x: 30 }} animate={{opacity: 1, x: 0 }} transition={{duration: 0.7 }}>
          <Box sx={{maxWidth: 380, width: '100%', mx: 'auto' }}>
            <Box sx={{mb: 4 }}>
              <Box sx={{display: {xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 5 }}>
                <Box sx={{width: 34, height: 34, background: themeColor, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.5s ease' }}>
                  <Typography sx={{fontSize: 16, color: '#0E0E0E', fontWeight: 900 }}>✦</Typography>
                </Box>
                <Typography sx={{fontSize: 17, fontWeight: 700, color: '#fff' }}>HATCoreBank</Typography>
              </Box>

              <Typography sx={{fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.8, mb: 1 }}>
                {loginType === 'customer' ? 'Welcome back' : 'Staff Portal'}
              </Typography>
              <Typography sx={{fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                Sign in to your account to continue
              </Typography>
            </Box>

            <Box sx={{display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', p: 0.5, mb: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box onClick={() => setLoginType('customer')} sx={{flex: 1, textAlign: 'center', py: 1.5, borderRadius: '10px', cursor: 'pointer', background: loginType === 'customer' ? 'rgba(255,255,255,0.08)' : 'transparent', color: loginType === 'customer' ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: loginType === 'customer' ? 600 : 400, fontSize: 14, transition: 'all 0.3s' }}>
                Personal
              </Box>
              <Box onClick={() => setLoginType('staff')} sx={{flex: 1, textAlign: 'center', py: 1.5, borderRadius: '10px', cursor: 'pointer', background: loginType === 'staff' ? 'rgba(255,255,255,0.08)' : 'transparent', color: loginType === 'staff' ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: loginType === 'staff' ? 600 : 400, fontSize: 14, transition: 'all 0.3s' }}>
                Staff Access
              </Box>
            </Box>

            {errorMsg && (
              <Alert severity="error" sx={{mb: 3, background: 'rgba(239,68,68,0.05)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)', '& .MuiAlert-icon': {color: '#F87171' } }}>
                {errorMsg}
              </Alert>
            )}

            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <motion.div key={`user-${loginType}`} initial={{opacity: 0, y: 15 }} animate={{opacity: 1, y: 0 }} transition={{duration: 0.4 }}>
                <TextField
                  label={loginType === 'customer' ? "Username" : "Username"}
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                  sx={getInputSx(themeColor)}
                />
              </motion.div>

              <motion.div key={`pass-${loginType}`} initial={{opacity: 0, y: 15 }} animate={{opacity: 1, y: 0 }} transition={{duration: 0.4, delay: 0.1 }}>
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                  sx={getInputSx(themeColor)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{color: 'rgba(255,255,255,0.3)', '&:hover': {color: themeColor } }}>
                            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </motion.div>

              <motion.div initial={{opacity: 0, y: 15 }} animate={{opacity: 1, y: 0 }} transition={{duration: 0.5, delay: 0.2 }}>
                <Button
                  onClick={handleSignIn}
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    background: loading ? `${themeColor}88` : themeColor,
                    color: '#0E0E0E',
                    fontWeight: 700,
                    fontSize: 15,
                    py: 1.7,
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: loading ? 'none' : `0 0 30px ${themeColor}55`,
                    transition: 'all 0.3s',
                    '&:hover': {background: themeHover, boxShadow: `0 0 50px ${themeColor}88` },
                    '&.Mui-disabled': {color: '#0E0E0E' },
                  }}
                >
                  {loading ? 'Authenticating...' : 'Secure Sign In'}
                </Button>
              </motion.div>
            </Box>

            <Box sx={{mt: 6, pt: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.6 }}>
                Protected by 256-bit SSL encryption.<br />By signing in you agree to our Terms & Privacy Policy.
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}