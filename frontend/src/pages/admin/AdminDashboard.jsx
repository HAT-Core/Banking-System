import { Box, Typography } from '@mui/material';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';

const StatCard = ({ title, value, icon, color, glow, trend }) => (
  <Box
    sx={{
      background: 'linear-gradient(145deg, rgba(20,20,20,0.9) 0%, rgba(15,15,15,0.9) 100%)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '24px',
      p: 3.5,
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        border: `1px solid ${glow}`,
        boxShadow: `0 10px 40px ${glow}`,
      }
    }}
  >
    <Box sx={{ position: 'absolute', top: '-20px', right: '-20px', width: 100, height: 100, background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, opacity: 0.5, pointerEvents: 'none' }} />
    
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
      <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: `rgba(${color}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(${color}, 0.2)` }}>
        {icon}
      </Box>
      {trend && (
        <Box sx={{ background: 'rgba(74,222,128,0.1)', px: 1.5, py: 0.5, borderRadius: '100px', border: '1px solid rgba(74,222,128,0.2)' }}>
          <Typography sx={{ fontSize: 12, color: '#4ADE80', fontWeight: 600 }}>{trend}</Typography>
        </Box>
      )}
    </Box>

    <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', mb: 0.5 }}>
      {title}
    </Typography>
    <Typography sx={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>
      {value}
    </Typography>
  </Box>
);

export default function AdminDashboard() {
  return (
    <Box>
      <Box sx={{ mb: 6 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: -1, mb: 1 }}>
          System Overview
        </Typography>
        <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
          Real-time metrics and operations for HATCoreBank.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
        <StatCard 
          title="Total Customers" 
          value="1,248" 
          icon={<PeopleOutlineRoundedIcon sx={{ color: '#9FFF98', fontSize: 26 }} />}
          color="159,255,152"
          glow="rgba(159,255,152,0.15)"
          trend="↑ 12% this month"
        />
        <StatCard 
          title="Active Staff" 
          value="42" 
          icon={<BadgeRoundedIcon sx={{ color: '#60A5FA', fontSize: 26 }} />}
          color="96,165,250"
          glow="rgba(96,165,250,0.15)"
        />
        <StatCard 
          title="Partner Banks" 
          value="15" 
          icon={<AccountBalanceRoundedIcon sx={{ color: '#C084FC', fontSize: 26 }} />}
          color="192,132,252"
          glow="rgba(192,132,252,0.15)"
        />
        <StatCard 
          title="System Alerts" 
          value="0" 
          icon={<NotificationsActiveRoundedIcon sx={{ color: '#F87171', fontSize: 26 }} />}
          color="248,113,113"
          glow="rgba(248,113,113,0.15)"
        />
      </Box>
    </Box>
  );
}