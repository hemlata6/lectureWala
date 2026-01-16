import { Box, Button, Card, CardContent, CardMedia, Dialog, Divider, Grid, IconButton, keyframes, Paper, Stack, Typography, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import Endpoints from "../context/endpoints";
import ProceedToCheckoutForm from "./ProceedToCheckoutForm";
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

const MultipleCourseCart = ({ onQuizNavigation }) => {

    const pulseAnimation = keyframes`
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    `;

    const isMobile = useMediaQuery("(min-width:600px)");
    let cartData = localStorage.getItem('cartCourses');
    const [cartCourses, setCartCourses] = useState([]);
    const [finalAmounts, setFinalAmounts] = useState(0);
    const [proceedToCheckoutModal, setProceedToCheckoutModal] = useState(false);

    useEffect(() => {
        if (cartData !== null && cartData !== undefined) {
            setCartCourses(cartData ? JSON.parse(cartData) : [])
        }
    }, [cartData])

    useEffect(() => {
        if (cartCourses) {
            updateFinalAmount(cartCourses)
        }
    }, [cartCourses])

    const handleRemoveItem = (item, i) => {
        let temp = [];
        cartCourses.forEach((item, x) => {
            if (x !== i) {
                temp.push(item)
            }
        })
        setCartCourses(temp);
        localStorage.setItem('cartCourses', JSON.stringify(temp));
        if (temp?.length === 0) {
            onQuizNavigation && onQuizNavigation('store');
        }
    }

    const updateFinalAmount = (cartItems) => {
        const totalAmount = cartItems.reduce((sum, item) => {
            const taxLab = item.taxLab ?? 0;
            const taxLabAmount = (item.finalPrice * taxLab) / 100;
            return sum + (item.finalPrice + taxLabAmount);
        }, 0);

        setFinalAmounts(totalAmount);
    };

    const handleProceedToCheckout = () => {
        setProceedToCheckoutModal(true)
    }


    return (
        <React.Fragment>
            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    py: { xs: 3, md: 5 },
                    px: { xs: 2, sm: 3, md: 6, lg: 8 }
                }}
            >
                <div className="max-w-7xl mx-auto">
                    {/* Modern Header */}
                    <Box sx={{ mb: 4 }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                                // fontSize: { xs: '1rem', md: '1rem', lg: '1rem' }
                            }}
                        >
                            Shopping Cart
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {cartCourses?.length} {cartCourses?.length === 1 ? 'course' : 'courses'} in your cart
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Cart Items */}
                        <Grid item xs={12} lg={8}>
                            <Stack spacing={{ xs: 2, sm: 3 }}>
                                {cartCourses?.length > 0 && cartCourses?.map((item, i) => (
                                    <Card
                                        key={i}
                                        sx={{
                                            borderRadius: { xs: '12px', sm: '16px' },
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            border: '1px solid rgba(102, 126, 234, 0.1)',
                                            '&:hover': {
                                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                                                transform: { xs: 'none', sm: 'translateY(-4px)' },
                                            }
                                        }}
                                    >
                                        <Grid container>
                                            {/* Course Image/Video Section */}
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    {/* Course Image */}
                                                    <Box
                                                        sx={{
                                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                            borderRadius: { xs: '8px', sm: '12px' },
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minHeight: { xs: '120px', sm: '150px' },
                                                            position: 'relative',
                                                        }}
                                                    >
                                                        <img
                                                            src={item?.logo ? Endpoints?.mediaBaseUrl + item?.logo : 'img/folder-2.png'}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                            }}
                                                            alt={item?.title}
                                                        />
                                                    </Box>

                                                    {/* Intro Video */}
                                                    {/* {item?.introVideo && (
                                                        <Box
                                                            sx={{
                                                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                                borderRadius: '12px',
                                                                overflow: 'hidden',
                                                                minHeight: '120px',
                                                            }}
                                                        >
                                                            <video 
                                                                controls 
                                                                src={Endpoints?.mediaBaseUrl + item?.introVideo} 
                                                                style={{ 
                                                                    width: '100%', 
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                }} 
                                                            />
                                                        </Box>
                                                    )} */}
                                                </Box>
                                            </Grid>

                                            {/* Course Details Section */}
                                            <Grid item xs={12} sm={8}>
                                                <CardContent sx={{ p: { xs: 1.5, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography
                                                            variant="h5"
                                                            sx={{
                                                                fontWeight: 700,
                                                                mb: { xs: 1, sm: 2 },
                                                                color: '#1a202c',
                                                                fontSize: { xs: '1rem', sm: '1.2rem' },
                                                                lineHeight: 1.3,
                                                            }}
                                                        >
                                                            {item?.title}
                                                        </Typography>

                                                        {/* Price Badge */}
                                                        <Box sx={{ mb: { xs: 1, sm: 2 } }}>
                                                            {item?.paid ? (
                                                                <Box
                                                                    sx={{
                                                                        display: 'inline-block',
                                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                        color: '#fff',
                                                                        px: { xs: 1.5, sm: 2 },
                                                                        py: { xs: 0.5, sm: 1 },
                                                                        borderRadius: { xs: '6px', sm: '8px' },
                                                                        fontWeight: 700,
                                                                        fontSize: { xs: '1rem', sm: '1.25rem' },
                                                                    }}
                                                                >
                                                                    ₹{item?.finalPrice?.toFixed(2)}
                                                                </Box>
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        display: 'inline-block',
                                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                                        color: '#fff',
                                                                        px: { xs: 1.5, sm: 2 },
                                                                        py: { xs: 0.5, sm: 1 },
                                                                        borderRadius: { xs: '6px', sm: '8px' },
                                                                        fontWeight: 700,
                                                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                                                    }}
                                                                >
                                                                    Free
                                                                </Box>
                                                            )}
                                                        </Box>

                                                        {/* Description */}
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                mb: { xs: 1, sm: 2 },
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: { xs: 2, sm: 3 },
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden',
                                                                lineHeight: 1.6,
                                                                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                                                            }}
                                                        >
                                                            {item?.description ? parse(item?.description) : ""}
                                                        </Typography>
                                                    </Box>

                                                    {/* Remove Button */}
                                                    <Button
                                                        onClick={() => handleRemoveItem(item, i)}
                                                        startIcon={<Trash2 size={16} />}
                                                        sx={{
                                                            color: '#ef4444',
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            alignSelf: 'flex-start',
                                                            px: 0,
                                                            fontSize: { xs: '0.813rem', sm: '0.875rem' },
                                                            minHeight: { xs: '32px', sm: '36px' },
                                                            '&:hover': {
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                px: 2,
                                                            },
                                                            transition: 'all 0.3s ease',
                                                        }}
                                                    >
                                                        Remove from Cart
                                                    </Button>
                                                </CardContent>
                                            </Grid>
                                        </Grid>
                                    </Card>
                                ))}
                            </Stack>
                        </Grid>

                        {/* Order Summary Sidebar */}
                        <Grid item xs={12} lg={4}>
                            <Paper
                                sx={{
                                    borderRadius: '16px',
                                    p: 3,
                                    position: { lg: 'sticky' },
                                    top: { lg: 24 },
                                    background: '#fff',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                }}
                            >
                                <Typography variant="h6" fontWeight={700} mb={3}>
                                    Order Summary
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Stack spacing={2} sx={{ mb: 3 }}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Subtotal</Typography>
                                        <Typography fontWeight={600}>₹{finalAmounts?.toFixed(2)}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Tax</Typography>
                                        <Typography fontWeight={600}>Included</Typography>
                                    </Stack>
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                                    <Typography variant="p" fontWeight={700}>Total</Typography>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        ₹{finalAmounts?.toFixed(2)}
                                    </Typography>
                                </Stack>

                                {finalAmounts > 0 && (
                                    <Button
                                        fullWidth
                                        onClick={handleProceedToCheckout}
                                        endIcon={<ArrowRight size={20} />}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.8rem',
                                            // py: 1.5,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
                                            animation: `${pulseAnimation} 2s infinite ease-in-out`,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.6)',
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                    >
                                        Proceed to Checkout
                                    </Button>
                                )}

                                {/* Security Badge */}
                                <Box sx={{ mt: 3, p: 2, background: 'rgba(102, 126, 234, 0.05)', borderRadius: '8px' }}>
                                    <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                                        🔒 Secure checkout powered by encryption
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Empty Cart State */}
                    {cartCourses?.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 24px',
                                }}
                            >
                                <ShoppingCart size={48} color="#667eea" />
                            </Box>
                            <Typography variant="h5" fontWeight={700} mb={1}>
                                Your cart is empty
                            </Typography>
                            <Typography color="text.secondary" mb={3}>
                                Add courses to get started with your learning journey
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => onQuizNavigation && onQuizNavigation('store')}
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    textTransform: 'none',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '12px',
                                }}
                            >
                                Browse Courses
                            </Button>
                        </Box>
                    )}
                </div>
            </Box>

            {/* Checkout Modal */}
            <Dialog
                open={proceedToCheckoutModal}
                onClose={() => setProceedToCheckoutModal(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%',
                    }
                }}
            >
                <ProceedToCheckoutForm setProceedToCheckoutModal={setProceedToCheckoutModal} cartCourses={cartCourses} />
            </Dialog>
        </React.Fragment>
    )
};

export default MultipleCourseCart;