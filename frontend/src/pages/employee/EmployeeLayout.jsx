import { Box, Typography, Button, Avatar } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

const ACCENT       = '#9FFF98';
const ACCENT_DIM   = 'rgba(159,255,152,0.12)';
const ACCENT_BORDER= 'rgba(159,255,152,0.2)';
const ACCENT_GLOW  = 'rgba(159,255,152,0.35)';

const NAV_ITEMS = [
  { label: 'KYC Verification', path: '/employee/kyc',          icon: <VerifiedUserRoundedIcon fontSize="small" /> },
  { label: 'Create Loan',      path: '/employee/loans/create',  icon: <AccountBalanceRoundedIcon fontSize="small" /> },
];

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser   = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName  = storedUser.firstName && storedUser.lastName
    ? `${storedUser.firstName} ${storedUser.lastName}`
    : storedUser.username || 'Employee';
  const displayRole  = storedUser.role
    ? storedUser.role.charAt(0).toUpperCase() + storedUser.role.slice(1)
    : 'Employee';
  const initials     = storedUser.firstName && storedUser.lastName
    ? `${storedUser.firstName[0]}${storedUser.lastName[0]}`.toUpperCase()
    : displayName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A', fontFamily: '"SF Pro Display", "Roboto", sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* Background glow — green tint to distinguish from admin's blue */}
      <Box sx={{ position: 'fixed', top: '-20%', right: '-10%', width: '70%', height: '70%', background: 'radial-gradient(ellipse, rgba(159,255,152,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── SIDEBAR ── */}
      <Box sx={{ width: 280, background: 'rgba(15,15,15,0.8)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 20 }}>

        {/* Logo */}
        <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ width: 36, height: 36, background: `linear-gradient(135deg, ${ACCENT} 0%, #4ADE80 100%)`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${ACCENT_GLOW}` }}>
            <Typography sx={{ fontSize: 18, color: '#0A0A0A', fontWeight: 900 }}>✦</Typography>
          </Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>HATCore</Typography>
        </Box>

        {/* Nav */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 3, flex: 1 }}>
          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', mb: 1, mt: 2 }}>
            Staff Portal
          </Typography>

          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Box
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  p: 1.5, px: 2, borderRadius: '12px', cursor: 'pointer',
                  background: isActive ? `linear-gradient(90deg, ${ACCENT_DIM} 0%, rgba(159,255,152,0.02) 100%)` : 'transparent',
                  border: isActive ? `1px solid ${ACCENT_BORDER}` : '1px solid transparent',
                  color: isActive ? ACCENT : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: isActive ? '' : 'rgba(255,255,255,0.03)',
                    color: isActive ? ACCENT : '#fff',
                    transform: isActive ? 'none' : 'translateX(4px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</Box>
                <Typography sx={{ fontSize: 15, fontWeight: isActive ? 600 : 500 }}>{item.label}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* Logout */}
        <Box sx={{ p: 3 }}>
          <Button
            onClick={handleLogout}
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            sx={{ color: '#EF4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', justifyContent: 'center', textTransform: 'none', fontWeight: 600, fontSize: 14, py: 1.2, borderRadius: '10px', transition: 'all 0.3s', '&:hover': { color: '#fff', background: '#EF4444', border: '1px solid #EF4444', boxShadow: '0 0 20px rgba(239,68,68,0.4)' } }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>

      {/* ── MAIN CONTENT ── */}
      <Box sx={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>

        {/* Top Bar */}
        <Box sx={{ height: 80, background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 4, position: 'sticky', top: 0, zIndex: 30, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, background: 'rgba(74,222,128,0.1)', px: 2, py: 0.8, borderRadius: '100px', border: '1px solid rgba(74,222,128,0.2)', flexShrink: 0 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 12px #4ADE80', flexShrink: 0, animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
              <Typography sx={{ fontSize: 12, color: '#4ADE80', fontWeight: 600, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>System Secure</Typography>
            </Box>

            <Box sx={{ width: '1px', height: 24, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 14, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>{displayName}</Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{displayRole}</Typography>
              </Box>
              <Avatar sx={{ width: 42, height: 42, background: ACCENT, color: '#0A0A0A', fontWeight: 800, border: `2px solid ${ACCENT_BORDER}`, flexShrink: 0 }}>
                {initials}
              </Avatar>
            </Box>
          </Box>
        </Box>

        {/* Page Content */}
        <Box sx={{ p: 6, flex: 1 }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
