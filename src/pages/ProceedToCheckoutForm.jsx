import { Box, Button, FormHelperText, Grid, InputAdornment, InputLabel, OutlinedInput, TextField, Typography, useMediaQuery, Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import instId from "../context/instituteId";
import { BASE_URL } from "../context/endpoints";
import { useStudent } from "../context/StudentContext";
import { CreditCard, User, Phone, Mail, Tag, Check, X } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ProceedToCheckoutForm = ({ cartCourses, setProceedToCheckoutModal }) => {

    const navigate = useNavigate();
    const location = useLocation();
    const { authToken } = useAuth();
    const { isAuthenticated, studentData } = useStudent();
    const { currentTheme } = useTheme();
    const isMobile = useMediaQuery("(min-width:600px)");
    const [title, setTitle] = useState('');
    const [number, setNumber] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [payloadCart, setPayloadCart] = useState([]);
    const [checkCoupon, setCheckCoupon] = useState([]);
    const [finalAmounts, setFinalAmounts] = useState(0);
    const [reedemCode, setReedemCode] = useState(false);
    const [couponNumber, setCouponNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isCouponValid, setIsCouponValid] = useState(null);
    const [urlParams, setUrlParams] = useState({ studentName: null, contact: null, email: null });
    const isLogoTheme = currentTheme === 'logo';

    useEffect(() => {
        // Extract URL parameters
        const urlStudentName = new URLSearchParams(window.location.search).get('studentname');
        const urlContact = new URLSearchParams(window.location.search).get('contact');
        const urlEmail = new URLSearchParams(window.location.search).get('email');

        // Store URL parameters
        setUrlParams({
            studentName: urlStudentName,
            contact: urlContact,
            email: urlEmail
        });

        // If URL parameters exist, auto-populate the form
        if (urlStudentName) {
            setTitle(urlStudentName);
        } else if (isAuthenticated === true) {
            setTitle(studentData?.firstName + " " + studentData?.lastName);
        }

        if (urlEmail) {
            setEmail(urlEmail);
        } else if (isAuthenticated === true) {
            setEmail(studentData?.email);
        }

        if (urlContact) {
            setNumber(urlContact);
        } else if (isAuthenticated === true) {
            setNumber(studentData?.contact);
        }
    }, [isAuthenticated, studentData])

    const getColor = () => {
        if (isCouponValid === null) return 'darkblue';
        return isCouponValid ? '#329908' : 'red';
    };

    const handleNumberChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 10) {
            setNumber(value);
            setError('');
            if (value.length < 10) {
                setError('Number must be 10 digits long');
            }
        }
    };

    useEffect(() => {
        if (cartCourses?.length > 0) {
            const updatedTotal = cartCourses.reduce((sum, item) => sum + (item.finalPrice ?? 0), 0);

            const updatedPurchaseArray = [];
            const checkCouponArray = [];

            // Separate regular courses and test series courses
            cartCourses.forEach(item => {
                if (item.isDripCourse) {
                    // This is a test series/drip course - skip for now, will be added from purchaseArray
                    checkCouponArray.push({
                        "purchaseType": "courseContent",
                        "entityId": item?.id
                    });
                } else {
                    // Regular course
                    updatedPurchaseArray.push({
                        "purchaseType": "course",
                        "entityId": item?.id,
                        "campusId": 0,
                        "courseId": 0,
                        "coursePricingId": item.coursePricingId
                    });
                    checkCouponArray.push({
                        "purchaseType": "course",
                        "entityId": item?.id
                    });
                }
            });

            // Add test series courses from purchaseArray in localStorage
            const purchaseArray = localStorage.getItem('purchaseArray');
            if (purchaseArray) {
                try {
                    const parsedArray = JSON.parse(purchaseArray);
                    if (Array.isArray(parsedArray)) {
                        parsedArray.forEach(item => {
                            updatedPurchaseArray.push({
                                "purchaseType": item.purchaseType || "courseContent",
                                "entityId": item.entityId || 0
                            });
                        });
                    }
                } catch (error) {
                    console.error('Error parsing purchaseArray:', error);
                }
            }

            setCheckCoupon(checkCouponArray);
            setPayloadCart(updatedPurchaseArray);
            setFinalAmounts(updatedTotal);
        } else {
            // Reset if cart is empty
            setFinalAmounts(0);
            setPayloadCart([]);
        }
    }, [cartCourses]);

    const handleReedemCode = () => {
        setReedemCode(!reedemCode)
    }

    const handleCoupon = (e) => {
        setCouponNumber(e.target.value);
        setErrorMessage('');
        setIsCouponValid(null);
    }

    const handleCheckCoupon = async (e) => {
        e.preventDefault();
        const body = {
            "getCheckoutUrls": checkCoupon,
            "coupon": couponNumber,
            "contact": Number(number),
            "instId": instId,
            "amount": finalAmounts
        }
        try {
            const response = await axios.post(BASE_URL + `/student/coupon/verify`, body);
            if (response.data.errorCode === 0) {
                setIsCouponValid(response.data?.valid);
                setErrorMessage("");
            } else {
                setIsCouponValid(response.data?.valid === null ? false : response.data?.valid);
                setErrorMessage(response.data?.message ? response.data?.message : "Invalid Coupon Code");
            }
        } catch (err) {
            console.log(err);
        };
    };

    const handleSubmit = async () => {
        // Extract first and last name from title
        const nameParts = title.split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        const body = {
            "firstName": firstName,
            "lastName": lastName,
            "contact": number,
            "email": email,
            "instId": instId,
            "campaignId": null,
            "coupon": "",
            "coursePricingId": 0,
            "entityModals": payloadCart
        }

         console.log('body', body);
        try {
            const response = await axios.post(BASE_URL + `/admin/payment/fetch-public-checkout-url`, body);

            if (response?.data?.status === true) {

                const width = 480;
                const height = 1080;
                const left = window.screenX + (window.outerWidth / 2) - (width / 2);
                const top = window.screenY + (window.outerHeight / 2) - (height / 2);

                window.open(
                    response?.data?.url,
                    'sharer',
                    `location=no,width=${width},height=${height},top=${top},left=${left}`
                );

                setTitle('');
                setNumber('');
                setEmail('')
                setPayloadCart([])
                setProceedToCheckoutModal(false)
                
                // Redirect back to store with URL parameters if they exist
                const routeData = new URLSearchParams(window.location.search).get('isMobile');
                if (urlParams.studentName || urlParams.contact || urlParams.email) {
                    let queryParams = [];
                    if (routeData) queryParams.push(`isMobile=${routeData}`);
                    if (urlParams.studentName) queryParams.push(`studentname=${encodeURIComponent(urlParams.studentName)}`);
                    if (urlParams.contact) queryParams.push(`contact=${urlParams.contact}`);
                    if (urlParams.email) queryParams.push(`email=${encodeURIComponent(urlParams.email)}`);
                    navigate(`/store?${queryParams.join('&')}`);
                } else if (!authToken && !isAuthenticated) {
                    navigate('/login', { state: { data: "storeData" } })
                }

            }

        } catch (err) {
            console.log(err);
        };
    };

    return (
        <Box
            sx={{
                background: isLogoTheme
                    ? 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)'
                    : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: '16px',
                overflow: 'hidden',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                border: isLogoTheme ? '2px solid #FFC107' : 'none',
            }}
        >
            {/* Modern Header */}
            <Box
                sx={{
                    background: isLogoTheme
                        ? 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    p: { xs: 2.5, sm: 3 },
                    textAlign: 'center',
                    flexShrink: 0,
                }}
            >
                {/* <Box
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}
                >
                    <CreditCard size={32} color="#fff" />
                </Box> */}
                <Typography
                    variant="h5"
                    sx={{
                        color: isLogoTheme ? '#000000' : '#fff',
                        fontWeight: 700,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    }}
                >
                    Checkout Details
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: isLogoTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                        mt: 1,
                    }}
                >
                    Complete your payment to unlock your courses
                </Typography>
            </Box>

            {/* Form Content */}
            <Box
                sx={{
                    p: { xs: 2.5, sm: 3 },
                    overflowY: 'auto',
                    flex: 1,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: isLogoTheme ? 'rgba(255, 193, 7, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: isLogoTheme
                            ? 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: isLogoTheme
                            ? 'linear-gradient(135deg, #FFD54F 0%, #FFC107 100%)'
                            : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    },
                }}
            >
                <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                        {/* Name Field */}
                        <TextField
                            fullWidth
                            variant="outlined"
                            type="text"
                            label="Full Name"
                            name="name"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <User size={20} color={isLogoTheme ? "#FFC107" : "#667eea"} />
                                    </InputAdornment>
                                ),
                                style: {
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    backgroundColor: isLogoTheme ? '#2A2A2A' : '#fff',
                                    color: isLogoTheme ? '#E5E5E5' : '#000',
                                }
                            }}
                            InputLabelProps={{
                                sx: {
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: isLogoTheme ? '#FFC107' : '#667eea',
                                    '&.Mui-focused': {
                                        color: isLogoTheme ? '#FFD54F' : '#667eea',
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: isLogoTheme ? '#2A2A2A' : '#fff',
                                    transition: 'all 0.3s ease',
                                    '& fieldset': {
                                        borderColor: isLogoTheme ? '#FFC107' : '#e0e0e0',
                                        borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: isLogoTheme ? '#FFD54F' : '#667eea',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: isLogoTheme ? '#2A2A2A' : '#fff',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: isLogoTheme ? '#FFD54F' : '#667eea',
                                    },
                                    '& input': {
                                        color: isLogoTheme ? '#E5E5E5' : '#000',
                                        paddingLeft: '12px',
                                        backgroundColor: 'transparent',
                                    }
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        {/* Phone Field */}
                        <TextField
                            inputProps={{ maxLength: 10 }}
                            fullWidth
                            variant="outlined"
                            type="number"
                            label="Phone Number"
                            name="number"
                            value={number}
                            onChange={handleNumberChange}
                            error={!!error}
                            helperText={error}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Phone size={20} color={isLogoTheme ? "#FFC107" : "#667eea"} />
                                    </InputAdornment>
                                ),
                                style: {
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    backgroundColor: isLogoTheme ? '#2A2A2A' : '#fff',
                                    color: isLogoTheme ? '#E5E5E5' : '#000',
                                }
                            }}
                            InputLabelProps={{
                                sx: {
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: isLogoTheme ? '#FFC107' : '#667eea',
                                    '&.Mui-focused': {
                                        color: isLogoTheme ? '#FFD54F' : '#667eea',
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: isLogoTheme ? '#2A2A2A' : '#fff',
                                    transition: 'all 0.3s ease',
                                    '& fieldset': {
                                        borderColor: isLogoTheme ? '#FFC107' : '#e0e0e0',
                                        borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: isLogoTheme ? '#FFD54F' : '#667eea',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: isLogoTheme ? '#2A2A2A' : '#fff',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: isLogoTheme ? '#FFD54F' : '#667eea',
                                    },
                                    '& input': {
                                        color: isLogoTheme ? '#E5E5E5' : '#000',
                                        paddingLeft: '12px',
                                        backgroundColor: 'transparent',
                                    }
                                },
                                '& .MuiFormHelperText-root': {
                                    color: error ? '#ef4444' : (isLogoTheme ? '#B0B0B0' : undefined),
                                    backgroundColor: isLogoTheme ? '#1A1A1A' : 'transparent',
                                    margin: 0,
                                    paddingLeft: '14px',
                                    paddingTop: '4px',
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        {/* Email Field */}
                        <TextField
                            fullWidth
                            variant="outlined"
                            type="email"
                            label="Email Address"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Mail size={20} color={isLogoTheme ? "#FFC107" : "#667eea"} />
                                    </InputAdornment>
                                ),
                                style: {
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    backgroundColor: isLogoTheme ? '#2A2A2A' : '#fff',
                                    color: isLogoTheme ? '#E5E5E5' : '#000',
                                }
                            }}
                            InputLabelProps={{
                                sx: {
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: isLogoTheme ? '#FFC107' : '#667eea',
                                    '&.Mui-focused': {
                                        color: isLogoTheme ? '#FFD54F' : '#667eea',
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: isLogoTheme ? '#2A2A2A' : '#fff',
                                    transition: 'all 0.3s ease',
                                    '& fieldset': {
                                        borderColor: isLogoTheme ? '#FFC107' : '#e0e0e0',
                                        borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: isLogoTheme ? '#FFD54F' : '#667eea',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: isLogoTheme ? '#2A2A2A' : '#fff',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: isLogoTheme ? '#FFD54F' : '#667eea',
                                    },
                                    '& input': {
                                        color: isLogoTheme ? '#E5E5E5' : '#000',
                                        paddingLeft: '12px',
                                        backgroundColor: 'transparent',
                                        '&:-webkit-autofill': {
                                            WebkitBoxShadow: `0 0 0 1000px ${isLogoTheme ? '#2A2A2A' : '#fff'} inset`,
                                            WebkitTextFillColor: isLogoTheme ? '#E5E5E5' : '#000',
                                        },
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Coupon Section */}
                    <Grid item xs={12}>
                        <Box sx={{ textAlign: 'right', mb: reedemCode ? 1 : 0 }}>
                            <Button
                                onClick={handleReedemCode}
                                startIcon={<Tag size={16} />}
                                sx={{
                                    color: isLogoTheme ? '#FFC107' : '#667eea',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                        background: isLogoTheme
                                            ? 'rgba(255, 193, 7, 0.1)'
                                            : 'rgba(102, 126, 234, 0.1)',
                                    }
                                }}
                            >
                                {reedemCode ? 'Hide' : 'Have a'} Coupon Code
                            </Button>
                        </Box>

                        {reedemCode && (
                            <Box
                                sx={{
                                    p: 2,
                                    background: isLogoTheme ? '#2A2A2A' : '#fff',
                                    borderRadius: '12px',
                                    border: isLogoTheme
                                        ? '1px solid rgba(255, 193, 7, 0.3)'
                                        : '1px solid rgba(102, 126, 234, 0.2)',
                                }}
                            >
                                <InputLabel
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        color: isLogoTheme ? '#FFC107' : '#1a202c',
                                        mb: 1,
                                    }}
                                >
                                    Enter Coupon Code
                                </InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    type="text"
                                    value={couponNumber}
                                    onChange={handleCoupon}
                                    placeholder="Enter your coupon"
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <Button
                                                disabled={!couponNumber || !number}
                                                onClick={handleCheckCoupon}
                                                variant={isCouponValid === true ? 'contained' : 'text'}
                                                sx={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    minWidth: 'auto',
                                                    px: 2,
                                                    background: isCouponValid === true
                                                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                                        : 'transparent',
                                                    color: isCouponValid === true ? '#fff' : (isLogoTheme ? '#FFC107' : getColor()),
                                                    '&:hover': {
                                                        background: isCouponValid === true
                                                            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                                                            : isLogoTheme
                                                                ? 'rgba(255, 193, 7, 0.1)'
                                                                : 'rgba(102, 126, 234, 0.1)',
                                                    },
                                                    '&.Mui-disabled': {
                                                        color: isLogoTheme ? 'rgba(255, 193, 7, 0.3)' : 'rgba(0, 0, 0, 0.26)',
                                                    }
                                                }}
                                                startIcon={isCouponValid === true ? <Check size={16} /> : null}
                                            >
                                                {isCouponValid === true ? 'Applied' : 'Apply'}
                                            </Button>
                                        </InputAdornment>
                                    }
                                    sx={{
                                        borderRadius: '12px',
                                        backgroundColor: isLogoTheme ? '#1A1A1A' : '#fff',
                                        color: isLogoTheme ? '#E5E5E5' : undefined,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: isCouponValid === true
                                                ? '#10b981'
                                                : isCouponValid === false
                                                    ? '#ef4444'
                                                    : isLogoTheme
                                                        ? '#FFC107'
                                                        : 'rgba(0, 0, 0, 0.23)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: isCouponValid === true
                                                ? '#10b981'
                                                : isCouponValid === false
                                                    ? '#ef4444'
                                                    : isLogoTheme
                                                        ? '#FFD54F'
                                                        : '#667eea',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: isCouponValid === true
                                                ? '#10b981'
                                                : isCouponValid === false
                                                    ? '#ef4444'
                                                    : isLogoTheme
                                                        ? '#FFD54F'
                                                        : '#667eea',
                                        },
                                        '& input::placeholder': {
                                            color: isLogoTheme ? 'rgba(229, 229, 229, 0.5)' : undefined,
                                            opacity: 1,
                                        }
                                    }}
                                />
                                {errorMessage && (
                                    <FormHelperText error sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <X size={14} /> {errorMessage}
                                    </FormHelperText>
                                )}
                                {isCouponValid === true && (
                                    <FormHelperText sx={{ mt: 1, color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Check size={14} /> Coupon applied successfully!
                                    </FormHelperText>
                                )}
                            </Box>
                        )}
                    </Grid>
                </Grid>

                {/* Price Summary */}
                <Paper
                    elevation={0}
                    sx={{
                        mt: 3,
                        p: 2.5,
                        borderRadius: '12px',
                        background: isLogoTheme
                            ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 179, 0, 0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        border: isLogoTheme
                            ? '1px solid rgba(255, 193, 7, 0.3)'
                            : '1px solid rgba(102, 126, 234, 0.2)',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="p" fontWeight={700} color={isLogoTheme ? '#FFC107' : '#1a202c'}>
                            Total Amount
                        </Typography>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                background: isLogoTheme
                                    ? 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            ₹{finalAmounts.toFixed(2)}
                        </Typography>
                    </Box>
                </Paper>

                {/* Pay Button */}
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={title === '' || number === '' || email === ''}
                    sx={{
                        mt: 3,
                        background: isLogoTheme
                            ? 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: isLogoTheme ? '#000000' : '#fff',
                        fontWeight: 700,
                        fontSize: '1rem',
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        boxShadow: isLogoTheme
                            ? '0 4px 15px 0 rgba(255, 193, 7, 0.4)'
                            : '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: isLogoTheme
                                ? 'linear-gradient(135deg, #FFD54F 0%, #FFC107 100%)'
                                : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                            boxShadow: isLogoTheme
                                ? '0 6px 20px 0 rgba(255, 193, 7, 0.6)'
                                : '0 6px 20px 0 rgba(102, 126, 234, 0.6)',
                            transform: 'translateY(-2px)',
                        },
                        '&.Mui-disabled': {
                            background: isLogoTheme ? 'rgba(255, 193, 7, 0.3)' : 'rgba(0, 0, 0, 0.12)',
                            color: isLogoTheme ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.26)',
                            boxShadow: 'none',
                        },
                    }}
                >
                    Proceed to Payment
                </Button>

                {/* Security Note */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: isLogoTheme ? '#B0B0B0' : 'text.secondary' }}>
                        🔒 Your payment information is secure and encrypted
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default ProceedToCheckoutForm;