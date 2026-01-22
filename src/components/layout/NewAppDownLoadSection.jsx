import React from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Button,
    useTheme,
} from '@mui/material';
import {
    Download as DownloadIcon,
    PhoneAndroid as PhoneAndroidIcon,
    Apple as AppleIcon,
    Computer as ComputerIcon,
    LaptopMac as LaptopMacIcon,
} from '@mui/icons-material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import instId from '../../context/instituteId';

const AppShowcaseSection = () => {
    const theme = useTheme();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, threshold: 0.1 });

    const features = [
        "📱 Mobile-First Learning Experience",
        "🔄 Offline Content Sync",
        "📊 Real-time Progress Tracking",
        "💬 Interactive Doubt Resolution",
        "🎯 Personalized Study Plans",
        "⏰ Smart Notifications & Reminders",
    ];

    return (
        <Box
            ref={ref}
            sx={{
                py: { xs: 4, md: 4 },
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.1)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '10%',
                        left: '-10%',
                        width: '200px',
                        height: '200px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '50%',
                        filter: 'blur(40px)',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '10%',
                        right: '-10%',
                        width: '300px',
                        height: '300px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '50%',
                        filter: 'blur(60px)',
                    },
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
                    {/* Left Content */}
                    <Grid item xs={12} md={6}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                                    fontWeight: 800,
                                    color: 'white',
                                    mb: 3,
                                    lineHeight: 1.2,
                                }}
                            >
                                Download Our
                                <br />
                                <Box
                                    component="span"
                                    sx={{
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    Mobile App
                                </Box>
                            </Typography>

                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: { xs: '1rem', md: '1.125rem' },
                                    lineHeight: 1.7,
                                    mb: 4,
                                }}
                            >
                                Learn anytime, anywhere with our feature-rich mobile application.
                                Get access to all courses, test series, and study materials on your smartphone.
                            </Typography>

                            {/* <Box sx={{ mb: 4 }}>
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 1.5,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {feature}
                    </Typography>
                  </motion.div>
                ))}
              </Box> */}

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={<PhoneAndroidIcon />}
                                        component="a"
                                        // href="https://play.google.com/store/apps/details?id=com.classiolabs.classeskart&hl=en_IN"
                                        sx={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            px: 3,
                                            py: 1.5,
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
                                            },
                                        }}
                                    >
                                        Get on Play Store
                                    </Button>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="outlined"
                                        startIcon={<AppleIcon />}
                                        component="a"
                                        // href="https://apps.apple.com/in/app/classkart/id1234567890"
                                        sx={{
                                            color: 'white',
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                            px: 3,
                                            py: 1.5,
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            borderWidth: '2px',
                                            '&:hover': {
                                                borderColor: 'white',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                borderWidth: '2px',
                                            },
                                        }}
                                    >
                                        Download for iOS
                                    </Button>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="outlined"
                                        startIcon={<LaptopMacIcon />}
                                        component="a"
                                        // href="https://www.classkart.com/download"
                                        sx={{
                                            color: 'white',
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                            px: 3,
                                            py: 1.5,
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            borderWidth: '2px',
                                            '&:hover': {
                                                borderColor: 'white',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                borderWidth: '2px',
                                            },
                                        }}
                                    >
                                        Download for Mac
                                    </Button>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="outlined"
                                        startIcon={<ComputerIcon />}
                                        component="a"
                                        // href="https://apps.microsoft.com/detail/9NVXFBT27F7V?hl=en-us&gl=IN&ocid=pdpshare"
                                        sx={{
                                            color: 'white',
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                            px: 3,
                                            py: 1.5,
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            borderWidth: '2px',
                                            '&:hover': {
                                                borderColor: 'white',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                borderWidth: '2px',
                                            },
                                        }}
                                    >
                                        Download for Windows
                                    </Button>
                                </motion.div>
                            </Box>
                        </motion.div>
                    </Grid>

                    {/* Right Content - Phone Mockup */}
                    <Grid item xs={12} md={6}>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'relative',
                                }}
                            >
                                {/* Phone Frame */}
                                <motion.div
                                    animate={{
                                        y: [-10, 10, -10],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: { xs: 200, sm: 250 },
                                            height: { xs: 400, sm: 500 },
                                            background: 'linear-gradient(145deg, #1f2937, #111827)',
                                            borderRadius: '40px',
                                            p: '8px',
                                            position: 'relative',
                                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                                        }}
                                    >
                                        {/* Screen */}
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(145deg, #667eea, #764ba2)',
                                                borderRadius: '32px',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                            }}
                                        >
                                            {/* App Content */}
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.05, 1],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <DownloadIcon sx={{ fontSize: '4rem', mb: 2 }} />
                                            </motion.div>

                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    mb: 1,
                                                    textAlign: 'center',
                                                    fontSize: { xs: '1rem', sm: '1.25rem' },
                                                    color: 'white',
                                                }}
                                            >
                                                {instId === 331 ? "Percept Academy App" : instId === 262 ? "LecturWala App" : "Other App"}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    textAlign: 'center',
                                                    opacity: 0.9,
                                                    px: 3,
                                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                    color: '#fff'
                                                }}
                                            >
                                                Your complete study companion for professional exams
                                            </Typography>

                                            {/* Floating Elements */}
                                            <motion.div
                                                animate={{
                                                    y: [-20, 20, -20],
                                                    rotate: [0, 5, -5, 0],
                                                }}
                                                transition={{
                                                    duration: 5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '15%',
                                                    right: '10%',
                                                    width: '30px',
                                                    height: '30px',
                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '50%',
                                                    backdropFilter: 'blur(10px)',
                                                }}
                                            />

                                            <motion.div
                                                animate={{
                                                    y: [20, -20, 20],
                                                    rotate: [0, -5, 5, 0],
                                                }}
                                                transition={{
                                                    duration: 6,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '20%',
                                                    left: '15%',
                                                    width: '25px',
                                                    height: '25px',
                                                    background: 'rgba(255, 255, 255, 0.15)',
                                                    borderRadius: '6px',
                                                    backdropFilter: 'blur(10px)',
                                                }}
                                            />
                                        </Box>

                                        {/* Home Indicator */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '8px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: '40px',
                                                height: '4px',
                                                background: '#374151',
                                                borderRadius: '2px',
                                            }}
                                        />
                                    </Box>
                                </motion.div>

                                {/* Decorative Elements */}
                                <motion.div
                                    animate={{
                                        rotate: [0, 360],
                                    }}
                                    transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '10%',
                                        left: '10%',
                                        width: '60px',
                                        height: '60px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '50%',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                />

                                <motion.div
                                    animate={{
                                        rotate: [360, 0],
                                    }}
                                    transition={{
                                        duration: 15,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '10%',
                                        right: '15%',
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                />
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AppShowcaseSection;
