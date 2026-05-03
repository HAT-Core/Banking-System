import { Box, Typography, Avatar } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';

const NAV_ITEMS = [
  { label: 'Dashboard',           path: '/dashboard',            icon: <DashboardRoundedIcon fontSize="small" /> },
  { label: 'Transfers',           path: '/transfers',            icon: <SwapHorizRoundedIcon fontSize="small" /> },
  { label: 'Transaction History', path: '/transactions',         icon: <ReceiptLongRoundedIcon fontSize="small" /> },
  { label: 'Loans',               path: '/loans',                icon: <AccountBalanceRoundedIcon fontSize="small" /> },
  { label: 'Billing',             path: '/billing',              icon: <PaymentsRoundedIcon fontSize="small" /> },
];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const displayName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'Customer';
  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : displayName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A', fontFamily: '"SF Pro Display", "Roboto", sans-serif', overflow: 'hidden' }}>

      {/* Background glow */}
      <Box sx={{ position: 'fixed', top: '-20%', right: '-10%', width: '70%', height: '70%', background: 'radial-gradient(ellipse, rgba(159,255,152,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Sidebar */}
      <Box sx={{ width: 280, background: 'rgba(15,15,15,0.8)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 20 }}>

        {/* Logo */}
        <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ width: 36, height: 36, background: '#9FFF98', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(159,255,152,0.4)' }}>
            <SavingsRoundedIcon sx={{ fontSize: 20, color: '#0E0E0E' }} />
          </Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>HATCore</Typography>
        </Box>

        {/* Nav */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 3, flex: 1 }}>
          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', mb: 1, mt: 2 }}>
            My Banking
          </Typography>

          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Box
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2, p: 1.5, px: 2, borderRadius: '12px', cursor: 'pointer',
                  background: isActive ? 'linear-gradient(90deg, rgba(159,255,152,0.12) 0%, rgba(159,255,152,0.04) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(159,255,152,0.2)' : '1px solid transparent',
                  color: isActive ? '#9FFF98' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s ease',
                  '&:hover': { background: isActive ? '' : 'rgba(255,255,255,0.03)', color: isActive ? '#9FFF98' : '#fff', transform: isActive ? 'none' : 'translateX(4px)' },
                }}
              >
                {item.icon}
                <Typography sx={{ fontSize: 15, fontWeight: isActive ? 600 : 500 }}>{item.label}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* Logout */}
        <Box sx={{ p: 3 }}>
          <Box
            onClick={handleLogout}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
              color: '#EF4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
              py: 1.4, borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              transition: 'all 0.3s',
              '&:hover': { color: '#fff', background: '#EF4444', boxShadow: '0 0 20px rgba(239,68,68,0.4)' }
            }}
          >
            <LogoutRoundedIcon fontSize="small" />
            Sign Out
          </Box>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>

        {/* Top bar */}
        <Box sx={{ height: 80, background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 4, position: 'sticky', top: 0, zIndex: 30 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, background: 'rgba(159,255,152,0.08)', px: 2, py: 0.8, borderRadius: '100px', border: '1px solid rgba(159,255,152,0.15)' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#9FFF98', boxShadow: '0 0 12px #9FFF98', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
              <Typography sx={{ fontSize: 12, color: '#9FFF98', fontWeight: 600 }}>Secure Session</Typography>
            </Box>
            <Box sx={{ width: '1px', height: 24, background: 'rgba(255,255,255,0.1)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>{displayName}</Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Personal Account</Typography>
              </Box>
              <Avatar sx={{ width: 42, height: 42, background: '#9FFF98', color: '#0A0A0A', fontWeight: 800, border: '2px solid rgba(159,255,152,0.3)' }}>
                {initials}
              </Avatar>
            </Box>
          </Box>
        </Box>

        {/* Page content */}
        <Box sx={{ p: 6, flex: 1 }}>
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Outlet />
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}