import { useEffect, useRef } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PlanCard = ({ plan, price, dark, style }) => (
  <Box
    sx={{
      width: 200,
      background: dark ? '#0E0E0E' : '#9FFF98',
      borderRadius: '20px',
      padding: '24px',
      border: dark ? '1px solid rgba(159,255,152,0.15)' : 'none',
      boxShadow: dark
        ? '0 30px 60px rgba(0,0,0,0.6)'
        : '0 30px 60px rgba(159,255,152,0.25)',
      ...style,
    }}
  >
    <Typography
      sx={{
        fontSize: 11,
        color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        mb: 0.5,
      }}
    >
      Plan
    </Typography>
    <Typography
      sx={{
        fontSize: 22,
        fontWeight: 700,
        color: dark ? '#fff' : '#0E0E0E',
        mb: 2,
      }}
    >
      {plan}
    </Typography>
    <Box sx={{ display: 'flex', gap: '3px', mb: 2 }}>
      {[3, 1, 2, 1, 3, 2, 1, 3, 2, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 3].map(
        (w, i) => (
          <Box
            key={i}
            sx={{
              width: w,
              height: 36,
              borderRadius: 0.5,
              background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
            }}
          />
        )
      )}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#9FFF98',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: 12, color: '#0E0E0E', fontWeight: 700 }}>
          ₿
        </Typography>
      </Box>
      <Typography
        sx={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
      >
        {price}/month
      </Typography>
    </Box>
  </Box>
);

const StatItem = ({ value, label }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <Typography
        sx={{
          fontSize: { xs: 32, md: 40 },
          fontWeight: 800,
          color: '#fff',
          letterSpacing: -1,
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
        {label}
      </Typography>
    </motion.div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);
  const cardsY = useTransform(scrollY, [0, 400], [0, -30]);

  return (
    <Box
      ref={containerRef}
      sx={{
        minHeight: '100vh',
        background: '#0A0A0A',
        overflowX: 'hidden',
        fontFamily: '"SF Pro Display", "Roboto", sans-serif',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 60% 10%, rgba(159,255,152,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backdropFilter: 'blur(20px)',
            background: 'rgba(10,10,10,0.7)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
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
                  HATCoreBank
                </Typography>
              </Box>

              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  gap: 4,
                  alignItems: 'center',
                }}
              >
                {['Personal', 'Business', 'Company', 'Blog', 'Pricing'].map((item) => (
                  <Typography
                    key={item}
                    sx={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      '&:hover': { color: '#fff' },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Button
                  onClick={() => navigate('/login')}
                  variant="contained"
                  sx={{
                    background: '#9FFF98',
                    color: '#0E0E0E',
                    fontWeight: 700,
                    fontSize: 14,
                    px: 3,
                    py: 1,
                    borderRadius: '10px',
                    textTransform: 'none',
                    boxShadow: '0 0 20px rgba(159,255,152,0.35)',
                    '&:hover': {
                      background: '#b8ffb3',
                      boxShadow: '0 0 32px rgba(159,255,152,0.55)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      </motion.div>

      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          pt: 10,
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 6,
              alignItems: 'center',
            }}
          >
            <motion.div style={{ y: heroY }}>
              <Box>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      background: 'rgba(159,255,152,0.08)',
                      border: '1px solid rgba(159,255,152,0.2)',
                      borderRadius: '100px',
                      px: 2,
                      py: 0.8,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#9FFF98',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.3 },
                        },
                      }}
                    />
                    <Typography sx={{ fontSize: 12, color: '#9FFF98', letterSpacing: 0.5 }}>
                      Secure Banking Portal
                    </Typography>
                  </Box>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: 40, md: 58, lg: 66 },
                      fontWeight: 800,
                      lineHeight: 1.05,
                      color: '#fff',
                      letterSpacing: -2,
                      mb: 3,
                    }}
                  >
                    One App,{' '}
                    <Box component="span" sx={{ color: '#fff' }}>
                      Everything
                    </Box>
                    <br />
                    You Need{' '}
                    <Box
                      component="em"
                      sx={{
                        fontStyle: 'italic',
                        color: 'rgba(255,255,255,0.45)',
                        fontWeight: 300,
                      }}
                    >
                      for Money
                    </Box>
                    <br />
                    <Box
                      component="em"
                      sx={{
                        fontStyle: 'italic',
                        color: 'rgba(255,255,255,0.45)',
                        fontWeight: 300,
                      }}
                    >
                      Management
                    </Box>
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                >
                  <Typography
                    sx={{
                      fontSize: 16,
                      color: 'rgba(255,255,255,0.45)',
                      lineHeight: 1.7,
                      maxWidth: 380,
                      mb: 4,
                    }}
                  >
                    From easy money management, to travel perks and investments.
                    Access your secure portal instantly.
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                >
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      onClick={() => navigate('/login')}
                      variant="contained"
                      sx={{
                        background: '#9FFF98',
                        color: '#0E0E0E',
                        fontWeight: 700,
                        fontSize: 15,
                        px: 3.5,
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        boxShadow: '0 0 30px rgba(159,255,152,0.4)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          background: '#b8ffb3',
                          boxShadow: '0 0 50px rgba(159,255,152,0.6)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      sx={{
                        color: '#fff',
                        fontSize: 15,
                        px: 3.5,
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        border: '1px solid rgba(255,255,255,0.15)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.3)',
                        },
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </motion.div>
              </Box>
            </motion.div>

            <motion.div style={{ y: cardsY }}>
              <Box sx={{ position: 'relative', height: 420, display: { xs: 'none', md: 'block' } }}>
                <motion.div
                  initial={{ opacity: 0, x: 60, rotate: 8 }}
                  animate={{ opacity: 1, x: 0, rotate: 8 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  style={{ position: 'absolute', top: 0, right: 60 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <PlanCard plan="Premium" price="$8.99" dark={false} />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30, rotate: -5 }}
                  animate={{ opacity: 1, x: 0, rotate: -5 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  style={{ position: 'absolute', top: 120, left: 10 }}
                >
                  <motion.div
                    animate={{ y: [0, -14, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >
                    <PlanCard plan="Standard" price="$8.99" dark={true} />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50, rotate: 3 }}
                  animate={{ opacity: 1, x: 0, rotate: 3 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  style={{ position: 'absolute', bottom: 20, right: 20 }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  >
                    <PlanCard plan="Premium" price="$8.99" dark={true} />
                  </motion.div>
                </motion.div>
              </Box>
            </motion.div>
          </Box>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 4, md: 8 },
                mt: { xs: 6, md: 10 },
                pt: 5,
                borderTop: '1px solid rgba(255,255,255,0.07)',
                flexWrap: 'wrap',
              }}
            >
              <StatItem value="28M+" label="Personal users" />
              <StatItem value="500+" label="Business users" />
              <StatItem value="200+" label="In-app currencies" />
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          py: 10,
          background: 'rgba(159,255,152,0.03)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {[
              {
                icon: '⚡',
                title: 'Instant Transfers',
                desc: 'Send money to anyone instantly with zero hidden fees across 150+ countries.',
              },
              {
                icon: '🔐',
                title: 'Bank-Grade Security',
                desc: '256-bit encryption, biometric auth, and real-time fraud detection on every transaction.',
              },
              {
                icon: '📊',
                title: 'Smart Analytics',
                desc: 'Track spending patterns, set budgets, and get AI-powered financial insights.',
              },
            ].map((f, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true });
              return (
                <motion.div
                  key={f.title}
                  ref={ref}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                >
                  <Box
                    sx={{
                      background: '#111',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '20px',
                      p: 3.5,
                      transition: 'border-color 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        borderColor: 'rgba(159,255,152,0.25)',
                        boxShadow: '0 0 30px rgba(159,255,152,0.06)',
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: 28, mb: 2 }}>{f.icon}</Typography>
                    <Typography
                      sx={{ fontSize: 18, fontWeight: 700, color: '#fff', mb: 1.5 }}
                    >
                      {f.title}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                      {f.desc}
                    </Typography>
                  </Box>
                </motion.div>
              );
            })}
          </Box>
        </Container>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1, py: 14, textAlign: 'center' }}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 300,
            background: 'radial-gradient(ellipse, rgba(159,255,152,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Typography
              sx={{
                fontSize: { xs: 32, md: 48 },
                fontWeight: 800,
                color: '#fff',
                letterSpacing: -1.5,
                mb: 2,
              }}
            >
              Ready to take control?
            </Typography>
            <Typography
              sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, mb: 5 }}
            >
              Join millions already banking smarter with HATCoreBank.
            </Typography>
            <Button
              onClick={() => navigate('/login')}
              variant="contained"
              size="large"
              sx={{
                background: '#9FFF98',
                color: '#0E0E0E',
                fontWeight: 700,
                fontSize: 16,
                px: 5,
                py: 1.8,
                borderRadius: '14px',
                textTransform: 'none',
                boxShadow: '0 0 40px rgba(159,255,152,0.4)',
                '&:hover': {
                  background: '#b8ffb3',
                  boxShadow: '0 0 60px rgba(159,255,152,0.6)',
                },
              }}
            >
              Access Your Account
            </Button>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}