import { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

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
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setLoading(true);
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
          background:
            'radial-gradient(ellipse 100% 100% at 30% 60%, rgba(159,255,152,0.15) 0%, transparent 65%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                background: '#9FFF98',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: 18, color: '#0E0E0E', fontWeight: 900 }}>
                ✦
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
              NexaBank
            </Typography>
          </Box>
        </motion.div>

        {/* Center quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 42,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: -1.5,
                lineHeight: 1.1,
                mb: 3,
              }}
            >
              Banking for the
              <br />
              <Box
                component="em"
                sx={{ fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,0.4)' }}
              >
                next generation.
              </Box>
            </Typography>
            <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              Secure, instant, and borderless.
              <br />
              Your money, your rules.
            </Typography>
          </Box>
        </motion.div>

        {/* Floating mini card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Box
              sx={{
                background: '#111',
                border: '1px solid rgba(159,255,152,0.15)',
                borderRadius: '20px',
                p: 3,
                maxWidth: 280,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase' }}>
                  Balance
                </Typography>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#9FFF98',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: 10, color: '#0E0E0E', fontWeight: 700 }}>N</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: -1, mb: 0.5 }}>
                $24,831.50
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(159,255,152,0.8)' }}>
                ↑ +2.4% this month
              </Typography>
            </Box>
          </motion.div>
        </motion.div>
      </Box>

      {/* ── Right Panel: Login Form ── */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 480px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 4, md: 7 },
          py: 6,
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Box sx={{ maxWidth: 380, width: '100%', mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 5 }}>
              {/* Mobile logo */}
              <Box
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 5,
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    background: '#9FFF98',
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: 16, color: '#0E0E0E', fontWeight: 900 }}>✦</Typography>
                </Box>
                <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>
                  NexaBank
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: -0.8,
                  mb: 1,
                }}
              >
                Welcome back
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                Sign in to your account to continue
              </Typography>
            </Box>

            {/* Form fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <TextField
                  label="Username or Email"
                  variant="outlined"
                  fullWidth
                  sx={inputSx}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  sx={inputSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#9FFF98' } }}
                        >
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              {/* Forgot password */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: '#9FFF98',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  Forgot password?
                </Typography>
              </Box>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <Button
                  onClick={handleSignIn}
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    background: loading ? 'rgba(159,255,152,0.5)' : '#9FFF98',
                    color: '#0E0E0E',
                    fontWeight: 700,
                    fontSize: 15,
                    py: 1.7,
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: loading ? 'none' : '0 0 30px rgba(159,255,152,0.35)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      background: '#b8ffb3',
                      boxShadow: '0 0 50px rgba(159,255,152,0.55)',
                    },
                    '&.Mui-disabled': {
                      color: '#0E0E0E',
                    },
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </motion.div>

              {/* Divider */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 0.5 }}>
                <Box sx={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>or</Typography>
                <Box sx={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </Box>

              {/* Register link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                  Don't have an account?{' '}
                  <Box
                    component="span"
                    onClick={() => navigate('/register')}
                    sx={{
                      color: '#9FFF98',
                      cursor: 'pointer',
                      fontWeight: 600,
                      '&:hover': { opacity: 0.8 },
                    }}
                  >
                    Create one
                  </Box>
                </Typography>
              </Box>
            </Box>

            {/* Footer note */}
            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.6 }}>
                Protected by 256-bit SSL encryption.
                <br />
                By signing in you agree to our Terms & Privacy Policy.
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}