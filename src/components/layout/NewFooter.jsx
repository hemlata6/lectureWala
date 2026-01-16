import React, { useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Link,
    IconButton,
    Divider,
    useTheme,
    Badge,
    useMediaQuery,
} from '@mui/material';
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    BookOpen,
    Users,
    Award,
    Heart,
    Youtube,
    X
} from 'lucide-react';
import {
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    Instagram as InstagramIcon,
    LinkedIn as LinkedInIcon,
    YouTube as YouTubeIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
// import Logo from '../C (2).png';
import { useNavigate } from 'react-router-dom';
import EnquiryForm from '../auth/EnquiryForm';
import { useAuth } from '../../context/AuthContext';

const NewFooter = () => {

    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:600px)");
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();
    const { institute, instituteAppSettingsModals } = useAuth();
    const [showEnquiryForm, setShowEnquiryForm] = useState(false);

    const quickLinks = [
        { name: 'Home', action: () => handleLinkClick('Home') },
        // { name: 'My Purchases', action: () => handleLinkClick('My Purchases') },
        { name: 'Announcements', action: () => handleLinkClick('Announcements') },
        { name: 'Store', action: () => handleLinkClick('store') },
        { name: 'Free Resources', action: () => handleLinkClick('content') },
        { name: 'Contact', action: () => handleLinkClick('Contact') },
    ]


    const handleLinkClick = (linkName) => {
        switch (linkName) {
            case 'Home':
                navigate('/');
                break;
            case 'My Purchases':
                navigate('/purchases');
                break;
            case 'store':
                navigate('/store');
                break;
            case 'content':
                navigate('/content');
                break;
            case 'Announcements':
                navigate('/announcement');
                break;
            case 'Contact':
                setShowEnquiryForm(true);
                break;
            default:
                break;
        }
    };

    const support = [
        { name: 'Privacy Policy', href: '/privacypolicy' },
        { name: 'Terms of Service', href: '/terms-and-conditions' },
        { name: 'Refund Policy', href: '/refund-policy' },
    ];

    const socialLinks = [
        { icon: FacebookIcon, href: instituteAppSettingsModals?.facebookLink, color: '#1877f2' },
        { icon: TwitterIcon, href: instituteAppSettingsModals?.twitterLink, color: '#1da1f2' },
        { icon: InstagramIcon, href: instituteAppSettingsModals?.instagramLink, color: '#e4405f' },
        { icon: LinkedInIcon, href: instituteAppSettingsModals?.linkedInLink, color: '#0a66c2' },
        { icon: YouTubeIcon, href: instituteAppSettingsModals?.youtubeLink, color: '#ff0000' },
    ];

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                pt: 8,
                pb: 2,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Pattern */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.05,
                    backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 198, 255, 0.3) 0%, transparent 50%)
          `,
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={4}>
                    {/* Company Info */}
                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <Box
                                variant="h4"
                                // component="a"
                                // href="/"
                                onClick={() => navigate('/')}
                                sx={{
                                    mb: 2,
                                    cursor: 'pointer',
                                    display: isMobile ? 'flex' : 'block',
                                    alignItems: 'center',
                                    gap: 1,
                                    justifyContent: 'start'
                                }}
                            >
                                {
                                    institute?.logo && (
                                        <img src={institute?.logo ? institute.logo : ''} alt={`${institute?.institue} Logo`} style={{ width: 60, marginBottom: '1rem', borderRadius: '50%', position: 'relative', top: '0.5rem' }} />
                                    )
                                }
                                <Typography
                                    sx={{
                                        color: '#4f46e5 !important',
                                        fontSize: '2rem',
                                        fontWeight: 800,
                                    }}
                                >
                                    {institute?.institue}
                                </Typography>
                            </Box>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    lineHeight: 1.7,
                                    mb: 3,
                                }}
                            >
                                {instituteAppSettingsModals?.appBio ? instituteAppSettingsModals.appBio : `Your premier destination for professional exam preparation.
                                We provide comprehensive courses, test series, and study materials
                                for CA, CS, and CMA aspirants.`}
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                {
                                    institute?.email && (<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <EmailIcon sx={{ fontSize: '1rem', mr: 1, color: theme.palette.primary.main }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            {institute?.email}
                                        </Typography>
                                    </Box>)
                                }
                                {
                                    institute?.contact && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <PhoneIcon sx={{ fontSize: '1rem', mr: 1, color: theme.palette.primary.main }} />
                                            <Typography component="a" href={`tel:${institute?.contact}`} variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none' }}>
                                                {institute?.contact}
                                            </Typography>
                                        </Box>
                                    )
                                }
                                {
                                    institute?.address && (
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <LocationOnIcon sx={{ fontSize: '1rem', mr: 1, mt: 0.5, color: theme.palette.primary.main }} />
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                                {institute?.address || ''}
                                            </Typography>
                                        </Box>
                                    )
                                }

                            </Box>

                        </motion.div>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={12} sm={6} md={4} padding={isMobile ? '' : '40px 0px 0px 130px !important'}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: '1.125rem',
                                    fontWeight: 700,
                                    mb: 3,
                                    color: 'white',
                                }}
                            >
                                Quick Links
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {quickLinks.map((link, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ x: 5 }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <div
                                                // href={link.href}
                                                onClick={link.action}
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.8)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.875rem',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        color: theme.palette.primary.main,
                                                    },
                                                }}
                                            >
                                                {link.name}
                                            </div>
                                        </Box>
                                    </motion.div>
                                ))}
                            </Box>
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                        >

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {socialLinks.map((social, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <IconButton
                                            href={social.href}
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.8)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '8px',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    color: social.color,
                                                    borderColor: social.color,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                },
                                            }}
                                        >
                                            <social.icon sx={{ fontSize: '1.25rem' }} />
                                        </IconButton>
                                    </motion.div>
                                ))}
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>

                <Divider
                    sx={{
                        my: 6,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                />

                {/* Bottom Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                textAlign: { xs: 'center', md: 'left' },
                            }}
                        >
                            © {currentYear} {institute?.institue}. All rights reserved.
                            <div className="text-gray-400 text-sm mb-4 md:mb-0">
                                Tech partner <a href='https://www.classiolabs.com/'>
                                    Classio Labs
                                </a>
                            </div>
                        </Typography>


                    </Box>
                </motion.div>
            </Container>
            {showEnquiryForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden relative animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setShowEnquiryForm(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="overflow-y-auto max-h-[95vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <EnquiryForm />
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
};

export default NewFooter;
