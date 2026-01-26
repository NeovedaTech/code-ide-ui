"use client"

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Paper,
  Link,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Components
const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(to right, #60a5fa, #a78bfa, #ec4899)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
}));

const StyledAppBar = styled(AppBar)({
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
  boxShadow: 'none',
});

const StyledButton = styled(Button)(({ theme, variant }) => ({
  ...(variant === 'contained' && {
    background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
    color: 'white',
    fontWeight: 600,
    padding: '10px 32px',
    '&:hover': {
      background: 'linear-gradient(135deg, #1d4ed8 0%, #7e22ce 100%)',
      transform: 'scale(1.05)',
    },
    transition: 'all 0.3s ease',
  }),
  ...(variant === 'outlined' && {
    borderColor: 'rgba(51, 65, 85, 0.7)',
    color: 'white',
    fontWeight: 600,
    padding: '10px 32px',
    '&:hover': {
      backgroundColor: 'rgba(71, 85, 105, 0.5)',
    },
  }),
}));

const HeroBackground = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #0f172a 0%, #0f172a 50%, #0f172a 100%)',
  color: 'white',
  overflow: 'hidden',
});

const FeatureCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(30, 41, 59, 0.4)',
  border: '1px solid rgba(51, 65, 85, 0.5)',
  borderRadius: '12px',
  backdropFilter: 'blur(8px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
}));

const StatCard = styled(Card)({
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(51, 65, 85, 0.3)',
  borderRadius: '8px',
});

const CTASection = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(76, 29, 149, 0.4) 100%)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '16px',
  backdropFilter: 'blur(8px)',
  padding: theme.spacing(6),
}));

const features = [
  {
    icon: '🧠',
    title: 'Adaptive Learning',
    desc: 'AI adjusts difficulty in real-time based on learner performance',
  },
  {
    icon: '⚡',
    title: 'Instant Feedback',
    desc: 'Immediate insights help learners understand their strengths',
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    desc: 'Detailed reports reveal learning patterns and progress',
  },
  {
    icon: '🛡️',
    title: 'Secure & Compliant',
    desc: 'Enterprise-grade security with full data protection',
  },
  {
    icon: '👥',
    title: 'Collaboration Tools',
    desc: 'Enable seamless group assessments and peer learning',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    desc: 'Powered by cutting-edge AI for instant responses',
  },
];

const stats = [
  { value: '98%', label: 'Assessment Accuracy', color: '#60a5fa' },
  { value: '2M+', label: 'Assessments Completed', color: '#a78bfa' },
  { value: '45%', label: 'Faster Learning Growth', color: '#ec4899' },
  { value: '45%', label: 'Faster Learning Growth', color: '#81ec48ff' },
];

// Assessment credentials for demo
const ASSESSMENT_ID = '697625f34e8e55508c7df5ea';
const USER_ID = () => {
  return Math.random().toString(36).substring(2, 9);
};
const ASSESSMENT_URL = `/user?assessmentId=${ASSESSMENT_ID}&userId=${USER_ID()}`;

export default function Page() {
  const [email, setEmail] = useState('');

  const handleTryNow = () => {
    window.open(ASSESSMENT_URL, '_blank');
  };

  const handleGetStarted = () => {
    // Scroll to CTA section or handle signup
    const ctaSection = document.getElementById('cta-section');
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <HeroBackground>
      {/* Navigation */}
      <StyledAppBar position="sticky">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            🧠 Knovia AI
          </Typography>
          <Stack direction="row" spacing={2}>
            <StyledButton
              variant="outlined"
              onClick={handleTryNow}
              sx={{
                background: 'transparent',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.1)',
                },
              }}
            >
              Try Now
            </StyledButton>
            <StyledButton variant="outlined">Sign In</StyledButton>
          </Stack>
        </Toolbar>
      </StyledAppBar>

      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ py: 12, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            ✨ AI-Powered Assessments
          </Typography>
          <GradientText variant="h4" sx={{ mb: 4 }}>
            Transform Learning with Intelligent Assessments
          </GradientText>
          <Typography
            variant="h6"
            sx={{
              mb: 6,
              color: 'rgba(226, 232, 240, 0.8)',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.8,
            }}
          >
            Knovia AI delivers adaptive, personalized assessments that understand each learner.
            Measure progress, identify gaps, and unlock potential with cutting-edge AI technology.
          </Typography>

          <Stack direction="row" spacing={3} sx={{ justifyContent: 'center', mb: 8 }}>
            <StyledButton variant="contained" onClick={handleGetStarted}>
              Get Started Free →
            </StyledButton>
            <StyledButton
              variant="outlined"
              onClick={handleTryNow}
              sx={{
                background: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3b82f6',
                color: '#60a5fa',
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderColor: '#60a5fa',
                },
              }}
            >
              🎯 Try Now
            </StyledButton>
          </Stack>
        </Box>
      </Container>

      {/* Hero Stats */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Grid container spacing={3}>
          {stats.map((stat, idx) => (
              <StatCard sx={{ textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Typography
                    variant="h4"
                    sx={{
                      color: stat.color,
                      fontWeight: 'bold',
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography sx={{ color: 'rgba(226, 232, 240, 0.7)' }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </StatCard>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 8,
            fontWeight: 'bold',
          }}
        >
          Powerful Features
        </Typography>

        <Box display={"grid"} gridTemplateColumns={"repeat(3, 1fr)"} gap={2}>
          {features.map((feature, idx) => (
              <FeatureCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    {feature.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' , color:"#fff"}}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: 'rgba(226, 232, 240, 0.7)' }}>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </FeatureCard>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ mb: 12 }} id="cta-section">
        <CTASection>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              mb: 4,
              color:"#fff",
              fontWeight: 'bold',
            }}
          >
            Ready to revolutionize your assessments?
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              mb: 6,
              color: 'rgba(226, 232, 240, 0.8)',
            }}
          >
            Join thousands of educators and institutions already using Knovia AI
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <TextField
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  '& fieldset': {
                    borderColor: 'rgba(51, 65, 85, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(59, 130, 246, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
                '& .MuiOutlinedInput-input::placeholder': {
                  color: 'rgba(148, 163, 184, 0.6)',
                  opacity: 1,
                },
              }}
            />
            <StyledButton variant="contained">
              Start Free Trial
            </StyledButton>
          </Stack>

          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'rgba(148, 163, 184, 0.7)',
            }}
          >
            No credit card required. Start in seconds.
          </Typography>

          <Box sx={{ textAlign: 'center', mt: 6, pt: 4, borderTop: '1px solid rgba(51, 65, 85, 0.3)' }}>
            <Stack direction="row" spacing={3} sx={{ justifyContent: 'center' }}>
              <StyledButton
                variant="outlined"
                onClick={handleTryNow}
                sx={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderColor: '#3b82f6',
                  color: '#60a5fa',
                  '&:hover': {
                    background: 'rgba(59, 130, 246, 0.2)',
                  },
                }}
              >
                Try Demo Assessment
              </StyledButton>
            </Stack>
          </Box>
        </CTASection>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          textAlign: 'center',
          py: 6,
          borderTop: '1px solid rgba(51, 65, 85, 0.3)',
          color: 'rgba(148, 163, 184, 0.7)',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ mb: 2 }}>
            © 2024 Knovia AI. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3} sx={{ justifyContent: 'center' }}>
            <Link href="#" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#60a5fa' } }}>
              Privacy
            </Link>
            <Link href="#" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#60a5fa' } }}>
              Terms
            </Link>
            <Link href="#" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#60a5fa' } }}>
              Contact
            </Link>
          </Stack>
        </Container>
      </Box>
    </HeroBackground>
  );
}