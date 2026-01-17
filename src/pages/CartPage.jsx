import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, Divider, Grid, IconButton, Paper, Stack, Typography, useMediaQuery, Drawer, Backdrop, CircularProgress, InputLabel, OutlinedInput, InputAdornment, FormHelperText } from "@mui/material";
import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import Endpoints from "../context/endpoints";
import { Trash2, ShoppingCart, ArrowRight, X, Tag, Check } from 'lucide-react';
import DeleteIcon from '@mui/icons-material/Delete';
import ProceedToCheckoutForm from "./ProceedToCheckoutForm";
import axios from "axios";
import { useStudent } from "../context/StudentContext";
import instId from "../context/instituteId";
import { BASE_URL } from "../context/endpoints";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const CartPage = ({ onQuizNavigation }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(min-width:600px)");
    const { currentTheme } = useTheme();
    const { isAuthenticated, studentData } = useStudent();
    const [cartCourses, setCartCourses] = useState([]);
    const [regularCourses, setRegularCourses] = useState([]);
    const [dripCourses, setDripCourses] = useState([]);
    const [finalAmount, setFinalAmount] = useState(0);
    const [proceedToCheckoutModal, setProceedToCheckoutModal] = useState(false);
    const [checkoutCartCourses, setCheckoutCartCourses] = useState([]);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [mobileData, setMobileData] = useState("");
    const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [tokenFromUrl, setTokenFromUrl] = useState(null);
    const [fetchedStudentName, setFetchedStudentName] = useState(null);
    const [fetchedStudentContact, setFetchedStudentContact] = useState(null);
    const [fetchedStudentEmail, setFetchedStudentEmail] = useState(null);
    const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
    const [checkoutResponse, setCheckoutResponse] = useState("");
    const [checkCoupon, setCheckCoupon] = useState([]);
    const [finalAmounts, setFinalAmounts] = useState(0);
    const [reedemCode, setReedemCode] = useState(false);
    const [couponNumber, setCouponNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isCouponValid, setIsCouponValid] = useState(null);
    const isLogoTheme = currentTheme === 'logo';

    // console.log('paymentUrl===cartttt', paymentUrl, checkoutResponse);
    // console.log('cartCourses', cartCourses);

    useEffect(() => {
        // Support both state (from React Router navigation) and query params (from direct URL visits)
        const routeData = location.state?.isMobile || new URLSearchParams(window.location.search).get('isMobile');
        const token = sessionStorage.getItem('studentToken') || new URLSearchParams(window.location.search).get('token');
        setMobileData(routeData);
        setTokenFromUrl(token);

        if (routeData || token) {
            sessionStorage.setItem('hideLayoutControls', 'true');
        } else {
            sessionStorage.removeItem('hideLayoutControls');
        }

        return () => {
            sessionStorage.removeItem('hideLayoutControls');
        };
    }, [location.state]);

    // Fetch student details from API using token
    useEffect(() => {
        if (tokenFromUrl) {
            fetchStudentDetails();
        }

    }, [tokenFromUrl]);

    useEffect(() => {
        // Only poll if payment drawer is open and we have a transactionId
        if (!paymentDrawerOpen || !checkoutResponse?.transactionId) {
            console.log('Payment polling stopped - Drawer closed or no transaction ID');
            return;
        }

        const intervalApi = setInterval(() => {
            FetchBillPayment();
        }, 5000);

        return () => {
            clearInterval(intervalApi);
            console.log('Payment polling interval cleared');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentDrawerOpen, checkoutResponse?.transactionId]);

    useEffect(() => {
        if (cartCourses?.length > 0) {
            const updatedTotal = cartCourses.reduce((sum, item) => sum + (item.finalPrice ?? 0), 0);

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
                    checkCouponArray.push({
                        "purchaseType": "course",
                        "entityId": item?.id
                    });
                }
            });

            setCheckCoupon(checkCouponArray);
            setFinalAmounts(updatedTotal);
        } else {
            // Reset if cart is empty
            setFinalAmounts(0);
        }
    }, [cartCourses]);

    const getColor = () => {
        if (isCouponValid === null) return 'darkblue';
        return isCouponValid ? '#329908' : 'red';
    };

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
            "contact": Number(fetchedStudentContact),
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

    const FetchBillPayment = async () => {
        try {

            const response = await axios.get(
                `${Endpoints.baseURL}payment/check-payment-status/${checkoutResponse?.transactionId}`,
                { headers: { "X-Auth": tokenFromUrl } }
            );
            // console.log('💳 Payment Status Response:', response);

            if (response?.data?.paymentStatus === "successful") {

                handleClearCart();
                setPaymentDrawerOpen(false);

            } else if (response?.data?.paymentStatus === 'pending') {
                console.log('⏳ Payment still pending...');
            } else if (response?.data?.paymentStatus === 'failed') {
                console.error('✗ PAYMENT FAILED');
            }
        } catch (err) {
            console.error('Error checking payment status:', err);
        }
    };

    const fetchStudentDetails = async () => {
        if (!tokenFromUrl) {
            const getStudentName = sessionStorage.getItem('fetchedStudentName');
            const getStudentContact = sessionStorage.getItem('fetchedStudentContact');
            const getStudentEmail = sessionStorage.getItem('fetchedStudentEmail');

            if (getStudentName && getStudentContact && getStudentEmail) {
                setFetchedStudentName(getStudentName);
                setFetchedStudentContact(getStudentContact);
                setFetchedStudentEmail(getStudentEmail);
            }

        }
        setStudentDetailsLoading(true);
        try {
            const response = await axios.get(
                `${Endpoints.baseURL}student/fetch-details`,
                { headers: { "X-Auth": tokenFromUrl } }
            );
            if (response?.data?.errorCode === 0) {

                // console.log('studentDatastudentData', response?.data);
                const studentData = response.data?.student;
                const fullName = studentData.firstName + ' ' + studentData.lastName;

                setFetchedStudentName(fullName);
                setFetchedStudentContact(studentData.contact);
                setFetchedStudentEmail(studentData.email);

                // Store in sessionStorage for persistence across routes
                sessionStorage.setItem('fetchedStudentName', fullName);
                sessionStorage.setItem('fetchedStudentContact', studentData.contact);
                sessionStorage.setItem('fetchedStudentEmail', studentData.email);

            } else {
                // console.log('studentDatastudentData333', response);
                const getStudentName = sessionStorage.getItem('fetchedStudentName');
                const getStudentContact = sessionStorage.getItem('fetchedStudentContact');
                const getStudentEmail = sessionStorage.getItem('fetchedStudentEmail');

                if (getStudentName && getStudentContact && getStudentEmail) {
                    setFetchedStudentName(getStudentName);
                    setFetchedStudentContact(getStudentContact);
                    setFetchedStudentEmail(getStudentEmail);
                }
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
        } finally {
            setStudentDetailsLoading(false);
        }
    };

    useEffect(() => {
        loadCartData();
    }, []);

    useEffect(() => {
        if (cartCourses.length > 0) {
            separateCourses();
        } else {
            // Clear both arrays when cart is empty
            setRegularCourses([]);
            setDripCourses([]);
        }
    }, [cartCourses]);

    useEffect(() => {
        calculateFinalAmount();
    }, [regularCourses, dripCourses]);

    const loadCartData = () => {
        const cartData = localStorage.getItem('cartCourses');
        if (cartData) {
            try {
                const cart = JSON.parse(cartData);
                setCartCourses(Array.isArray(cart) ? cart : []);
            } catch (error) {
                console.error('Error loading cart:', error);
                setCartCourses([]);
            }
        }
    };

    const separateCourses = () => {
        const regular = [];
        const drip = [];

        cartCourses.forEach(item => {
            if (item.plan) {
                // Drip course (has plan, group, subject structure)
                drip.push(item);
            } else {
                // Regular course (has coursePricingId and finalPrice)
                regular.push(item);
            }
        });

        setRegularCourses(regular);
        setDripCourses(drip);
    };

    const calculateFinalAmount = () => {
        let total = 0;

        // Calculate regular courses total
        regularCourses.forEach(item => {
            const taxLab = item.taxLab ?? 0;
            const taxLabAmount = (item.finalPrice * taxLab) / 100;
            total += (item.finalPrice + taxLabAmount);
        });

        // Calculate drip courses total
        dripCourses.forEach(item => {
            if (item.plan && item.plan.price) {
                const discount = item.plan.discount ?? 0;
                const price = item.plan.price ?? 0;
                const discountedAmount = (price * discount) / 100;
                const finalPrice = price - discountedAmount;
                total += finalPrice;
            }
        });

        setFinalAmount(total);
    };

    const handleRemoveRegularCourse = (index) => {
        const updatedCart = cartCourses.filter((item, i) => {
            if (item.plan) return true; // Keep drip courses
            return regularCourses.indexOf(item) !== index;
        });

        setCartCourses(updatedCart);
        localStorage.setItem('cartCourses', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleRemoveDripCourse = (index) => {
        const courseToRemove = dripCourses[index];
        const updatedCart = cartCourses.filter(item => {
            if (item.plan && item.plan.id === courseToRemove.plan.id) {
                return false;
            }
            return true;
        });

        setCartCourses(updatedCart);
        localStorage.setItem('cartCourses', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };


    const handleProcessPayment = async (payloadCart, urlParamsData = null) => {
        try {
            setIsProcessingPayment(true);

            // Use URL parameters if available, otherwise use authenticated student data
            let firstName, lastName, contact, email;

            const routeData = location.state?.isMobile || new URLSearchParams(window.location.search).get('isMobile');

            if (urlParamsData && urlParamsData.studentName && urlParamsData.contact && urlParamsData.email) {
                // Extract first and last name from studentName
                const nameParts = urlParamsData.studentName.split(' ');
                firstName = nameParts[0] || 'User';
                lastName = nameParts.slice(1).join(' ') || '';
                contact = urlParamsData.contact;
                email = urlParamsData.email;
            } else {
                // Use authenticated student data
                firstName = studentData?.firstName || studentData?.fullName?.split(' ')[0] || 'User';
                lastName = studentData?.lastName || studentData?.fullName?.split(' ')[1] || '';
                contact = studentData?.contact || '';
                email = studentData?.email || '';
            }

            const body = {
                firstName: firstName,
                lastName: lastName,
                contact: contact,
                email: email,
                instId: instId,
                campaignId: null,
                coupon: "",
                coursePricingId: 0,
                entityModals: payloadCart
            };
            const mobileBody = {
                "getCheckoutUrls": payloadCart,
                "coupon": ""
            }

            const response = await axios.post(BASE_URL + `${routeData ? "payment/get-checkout-url" : "/admin/payment/fetch-public-checkout-url"}`, routeData ? mobileBody : body, routeData ? { headers: { "X-Auth": tokenFromUrl } } : "");

            if (response?.data?.status === true) {
                const width = 480;
                const height = 1080;
                const left = window.screenX + (window.outerWidth / 2) - (width / 2);
                const top = window.screenY + (window.outerHeight / 2) - (height / 2);

                // Check if both urlParamsData and routeData exist

                setCheckoutResponse(response?.data);
                setTimeout(() => {
                    if (urlParamsData && urlParamsData.studentName && routeData && !isMobile) {

                        // Open bottom sheet drawer instead of new window
                        setPaymentUrl(response?.data?.url);
                        setPaymentDrawerOpen(true);
                    } else {
                        // Open in new window (traditional behavior)
                        window.open(
                            response?.data?.url,
                            'sharer',
                            `location=no,width=${width},height=${height},top=${top},left=${left}`
                        );
                    }

                    // Clear cart after opening payment
                    // handleClearCart();

                    // Stop processing animation after payment opens
                    setIsProcessingPayment(false);
                }, 2500);
            } else {
                console.error('Payment initiation failed');
                setIsProcessingPayment(false);
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            setIsProcessingPayment(false);
        }
    };

    const handleProceedToCheckout = () => {
        // Prepare entityModals for both regular courses and drip courses
        const entityModals = [];

        // Add regular courses to entityModals
        regularCourses.forEach(item => {
            entityModals.push({
                purchaseType: "course",
                entityId: item?.id || 0,
                campusId: 0,
                courseId: 0,
                coursePricingId: item?.coursePricingId || 0
            });
        });

        // Add drip courses (test series) from purchaseArray
        const purchaseArray = localStorage.getItem('purchaseArray');
        if (purchaseArray) {
            try {
                const parsedArray = JSON.parse(purchaseArray);
                if (Array.isArray(parsedArray)) {
                    parsedArray.forEach(item => {
                        entityModals.push({
                            purchaseType: item.purchaseType || "courseContent",
                            entityId: item.entityId || 0
                        });
                    });
                }
            } catch (error) {
                console.error('Error parsing purchaseArray:', error);
            }
        }

        // If user has fetched student details or is authenticated, proceed directly to payment
        if ((fetchedStudentName && fetchedStudentContact && fetchedStudentEmail) || (isAuthenticated && studentData)) {
            handleProcessPayment(entityModals, {
                studentName: fetchedStudentName,
                contact: fetchedStudentContact,
                email: fetchedStudentEmail
            });
        } else {
            // If not authenticated and no URL params, show checkout form to collect details
            // Prepare cart courses for the modal (combines regular and drip courses with finalPrice)
            const combinedCart = [];

            // Add regular courses
            regularCourses.forEach(item => {
                combinedCart.push({
                    ...item,
                    finalPrice: item.finalPrice
                });
            });

            // Add drip courses with calculated finalPrice
            dripCourses.forEach(item => {
                if (item.plan && item.plan.price) {
                    const discount = item.plan.discount ?? 0;
                    const price = item.plan.price ?? 0;
                    const discountedAmount = (price * discount) / 100;
                    const finalPrice = price - discountedAmount;

                    combinedCart.push({
                        id: item.plan.id,
                        title: item.plan.title,
                        finalPrice: finalPrice,
                        coursePricingId: 0, // For drip courses
                        isDripCourse: true
                    });
                }
            });

            setCheckoutCartCourses(combinedCart);
            setProceedToCheckoutModal(true);
        }
    };

    const handleClearCart = () => {
        setCartCourses([]);
        setRegularCourses([]);
        setDripCourses([]);
        localStorage.setItem('cartCourses', JSON.stringify([]));
        localStorage.setItem('purchaseArray', JSON.stringify([]));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    // Listen for messages from payment iframe
    useEffect(() => {
        const handleMessage = (event) => {
            // Verify origin for security (adjust to your domain)
            // if (event.origin !== window.location.origin) return;

            const { type, url, data } = event.data;

            console.log('Message received from iframe:', event.data);

            if (type === 'paymentUrl' && url) {
                console.log('Payment gateway sent new URL:', url);
                setPaymentUrl(url);
                sessionStorage.setItem('iframeNewUrl', url);
            } else if (type === 'paymentData' && data) {
                console.log('Payment data received:', data);
                sessionStorage.setItem('paymentData', JSON.stringify(data));
            } else if (type === 'redirectUrl' && url) {
                console.log('Redirect URL from payment gateway:', url);
                setPaymentUrl(url);
                sessionStorage.setItem('paymentRedirectUrl', url);
            } else if (type === 'paymentSuccess') {
                console.log('Payment completed successfully');
                sessionStorage.setItem('paymentStatus', 'completed');
                sessionStorage.setItem('paymentResponse', JSON.stringify(data || {}));
            }
        };

        window.addEventListener('message', handleMessage);
        console.log('Payment iframe message listener activated');

        return () => {
            window.removeEventListener('message', handleMessage);
            console.log('Payment iframe message listener deactivated');
        };
    }, []);

    const truncateDescription = (description) => {
        if (!description) return '';
        const decodedDescription = description
            ?.replace(/&nbsp;/g, ' ')
            ?.replace(/&amp;/g, '&')
            ?.replace(/&lt;/g, '<')
            ?.replace(/&gt;/g, '>')
            ?.replace(/&quot;/g, '"')
            ?.replace(/&#39;/g, "'");

        const strippedDescription = decodedDescription
            ?.replace(/<[^>]*>/g, ' ')
            ?.split(/\s+/)
            ?.slice(0, 15)
            ?.join(' ');

        return strippedDescription;
    };

    const formatMilliseconds = (ms) => {
        if (!ms) return "N/A";

        const millisecondsInYear = 365 * 24 * 60 * 60 * 1000;
        const millisecondsInMonth = 30 * 24 * 60 * 60 * 1000;
        const millisecondsInDay = 24 * 60 * 60 * 1000;

        const years = Math.floor(ms / millisecondsInYear);
        let remainder = ms % millisecondsInYear;

        const months = Math.floor(remainder / millisecondsInMonth);
        remainder %= millisecondsInMonth;

        const days = Math.floor(remainder / millisecondsInDay);

        let result = [];
        if (years > 0) result.push(`${years} Year${years > 1 ? 's' : ''}`);
        if (months > 0) result.push(`${months} Month${months > 1 ? 's' : ''}`);
        if (days > 0) result.push(`${days} Day${days > 1 ? 's' : ''}`);

        return result.length > 0 ? result.join(" ") : "N/A";
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp).toLocaleDateString();
    };

    const getLearningModeLabel = (pricing) => {
        const modes = [];
        if (pricing.liveAccess) modes.push("Live");
        if (pricing.onlineContentAccess) modes.push("Recorded");
        if (pricing.offlineContentAccess) modes.push("Pendrive");
        if (pricing.faceToFaceAccess) modes.push("Face-to-Face");
        if (pricing.quizAccess) modes.push("Quiz");
        return modes.length > 0 ? modes.join(" + ") : "N/A";
    };

    return (
        <Box
            className="cart-page-wrapper"
            sx={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                py: { xs: 3, md: 5 },
                px: { xs: 2, sm: 3, md: 6, lg: 8 }
            }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Back to Store Button */}
                <Box sx={{ mb: 1 }}>
                    <Button
                        onClick={() => {
                            // Get isMobile parameter from location state or URL
                            const routeData = location.state?.isMobile || new URLSearchParams(window.location.search).get('isMobile');

                            // Navigate back to store with only isMobile and token
                            if (routeData || tokenFromUrl) {
                                let queryParams = [];
                                if (routeData) queryParams.push(`isMobile=${routeData}`);
                                if (tokenFromUrl) queryParams.push(`token=${tokenFromUrl}`);
                                navigate(`/store?${queryParams.join('&')}`);
                            } else {
                                navigate('/store');
                            }
                        }}
                        startIcon={<ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />}
                        sx={{
                            color: tokenFromUrl ? '#ffb610' : '#667eea',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            px: 2,
                            py: 1,
                            borderRadius: '8px',
                            '&:hover': {
                                background: tokenFromUrl ? 'rgba(255, 182, 16, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                                color: tokenFromUrl ? '#ffb610' : '#764ba2',
                            },
                        }}
                    >
                        Back to Store
                    </Button>
                </Box>

                {/* Header */}
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            color: tokenFromUrl ? '#ffb610' : '#667eea',
                            mb: 1,
                        }}
                    >
                        Shopping Cart
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {cartCourses.length} {cartCourses.length === 1 ? 'item' : 'items'} in your cart
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Cart Items */}
                    <Grid item xs={12} lg={8}>
                        <Stack spacing={3}>
                            {/* Regular Courses Section */}
                            {regularCourses.length > 0 && (
                                <>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a202c', mb: 1 }}>
                                        Courses
                                    </Typography>
                                    {regularCourses.map((item, index) => (
                                        <Card
                                            key={index}
                                            sx={{
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                transition: 'all 0.3s ease',
                                                border: tokenFromUrl ? '1px solid rgba(255, 182, 16, 0.1)' : '1px solid rgba(102, 126, 234, 0.1)',
                                                '&:hover': {
                                                    boxShadow: tokenFromUrl ? '0 8px 24px rgba(255, 182, 16, 0.15)' : '0 8px 24px rgba(102, 126, 234, 0.15)',
                                                    transform: 'translateY(-4px)',
                                                },
                                            }}
                                        >
                                            <Grid container>
                                                {/* Course Image */}
                                                <Grid item xs={12} sm={4}>
                                                    <Box sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                        <Box
                                                            sx={{
                                                                background: tokenFromUrl ? 'linear-gradient(135deg, rgba(255, 182, 16, 0.1) 0%, rgba(255, 182, 16, 0.1) 100%)' : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                                borderRadius: { xs: '8px', sm: '12px' },
                                                                overflow: 'hidden',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                minHeight: { xs: '120px', sm: '150px' },
                                                                mb: 1,
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

                                                        {/* Pricing Options Below Image */}
                                                        {item?.coursePricing && item?.coursePricing.length > 0 && (
                                                            <Box>
                                                                <Typography variant="caption" sx={{ display: 'block', color: '#7a869a', fontWeight: 600, mb: 0.5, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                                                                    Available Options
                                                                </Typography>
                                                                {item?.coursePricing.filter(pricing => pricing.id === item.coursePricingId).map((pricing, pricingIndex) => (
                                                                    <Stack direction="column" spacing={0.5} sx={{ mb: 0.5 }} key={pricingIndex}>

                                                                        {getLearningModeLabel(pricing) !== "N/A" && (
                                                                            <Box
                                                                                sx={{
                                                                                    px: 0.75,
                                                                                    py: 0.25,
                                                                                    borderRadius: '4px',
                                                                                    background: tokenFromUrl ? 'rgba(255, 182, 16, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                                                                                    color: tokenFromUrl ? '#ffb610' : '#667eea',
                                                                                    fontSize: '0.65rem',
                                                                                    fontWeight: 600,
                                                                                    whiteSpace: 'nowrap',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                }}
                                                                            >
                                                                                {getLearningModeLabel(pricing)}
                                                                            </Box>
                                                                        )}

                                                                        {pricing?.validityType && (
                                                                            <Box
                                                                                sx={{
                                                                                    px: 0.75,
                                                                                    py: 0.25,
                                                                                    borderRadius: '4px',
                                                                                    background: tokenFromUrl ? 'rgba(255, 182, 16, 0.1)' : 'rgba(118, 75, 162, 0.1)',
                                                                                    color: tokenFromUrl ? '#ffb610' : '#764ba2',
                                                                                    fontSize: '0.65rem',
                                                                                    fontWeight: 600,
                                                                                    whiteSpace: 'nowrap',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                }}
                                                                            >
                                                                                {pricing?.validityType === 'lifetime' ? 'Lifetime' :
                                                                                    pricing?.validityType === 'validity' && pricing?.duration ? formatMilliseconds(pricing?.duration) :
                                                                                        pricing?.validityType === 'expiry' && pricing?.expiry ? formatTimestamp(pricing?.expiry) :
                                                                                            pricing?.validityType?.charAt(0).toUpperCase() + pricing?.validityType?.slice(1)}
                                                                            </Box>
                                                                        )}

                                                                        {pricing?.watchTime && (
                                                                            <Box
                                                                                sx={{
                                                                                    px: 0.75,
                                                                                    py: 0.25,
                                                                                    borderRadius: '4px',
                                                                                    background: 'rgba(249, 115, 22, 0.1)',
                                                                                    color: '#f97316',
                                                                                    fontSize: '0.65rem',
                                                                                    fontWeight: 600,
                                                                                    whiteSpace: 'nowrap',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                }}
                                                                            >
                                                                                {pricing?.watchTime}x Watch
                                                                            </Box>
                                                                        )}
                                                                    </Stack>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Grid>

                                                {/* Course Details */}
                                                <Grid item xs={12} sm={8}>
                                                    <CardContent sx={{ p: { xs: 1, sm: 1.5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    mb: { xs: 0.5, sm: 1 },
                                                                    color: '#1a202c',
                                                                    fontSize: { xs: '0.95rem', sm: '1.1rem' },
                                                                }}
                                                            >
                                                                {item?.title}
                                                            </Typography>

                                                            {/* Price */}
                                                            <Box sx={{ mb: { xs: 0.75, sm: 1 } }}>
                                                                <Box
                                                                    sx={{
                                                                        display: 'inline-block',
                                                                        background: tokenFromUrl ? '#ffb610' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                        color: '#fff',
                                                                        px: { xs: 1, sm: 1.5 },
                                                                        py: { xs: 0.3, sm: 0.5 },
                                                                        borderRadius: { xs: '6px', sm: '8px' },
                                                                        fontWeight: 700,
                                                                        fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                                                    }}
                                                                >
                                                                    ₹{item?.finalPrice?.toFixed(2)}
                                                                </Box>
                                                            </Box>

                                                            {/* Description */}
                                                            {/* {item?.description && (

                                                                <div
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    style={{
                                                                        mb: { xs: 1, sm: 2 },
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: { xs: 2, sm: 3 },
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        fontSize: { xs: '0.813rem', sm: '0.875rem' },
                                                                    }}
                                                                    dangerouslySetInnerHTML={{ __html: item?.description }}
                                                                />

                                                            )} */}
                                                            {item?.description && (
                                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                                    <div
                                                                        className="text-gray-600 text-xs leading-relaxed prose prose-sm max-w-none overflow-y-auto"
                                                                        style={{
                                                                            maxHeight: !isMobile ? '500px' : "",
                                                                            overflowWrap: 'anywhere',
                                                                            wordBreak: 'break-word'
                                                                        }}
                                                                        dangerouslySetInnerHTML={{ __html: item?.description }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {/* {item?.description && (
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        mb: { xs: 1, sm: 2 },
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: { xs: 2, sm: 3 },
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        fontSize: { xs: '0.813rem', sm: '0.875rem' },
                                                                    }}
                                                                >
                                                                    {truncateDescription(item?.description)}
                                                                </Typography>
                                                            )} */}
                                                        </Box>

                                                        {/* Remove Button */}
                                                        <Button
                                                            onClick={() => handleRemoveRegularCourse(index)}
                                                            startIcon={<Trash2 size={14} />}
                                                            sx={{
                                                                color: '#ef4444',
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                alignSelf: 'flex-start',
                                                                px: 0,
                                                                py: 0,
                                                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                                                '&:hover': {
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    px: 1,
                                                                },
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </CardContent>
                                                </Grid>
                                            </Grid>
                                        </Card>
                                    ))}
                                </>
                            )}

                            {/* Drip Courses Section */}
                            {dripCourses.length > 0 && (
                                <>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a202c', mb: 2, mt: 3 }}>
                                        Test Series & Plans
                                    </Typography>
                                    {dripCourses.map((item, index) => (
                                        <Card
                                            key={index}
                                            sx={{
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                transition: 'all 0.3s ease',
                                                border: '1px solid rgba(118, 75, 162, 0.1)',
                                                '&:hover': {
                                                    boxShadow: '0 8px 24px rgba(118, 75, 162, 0.15)',
                                                    transform: 'translateY(-4px)',
                                                },
                                            }}
                                        >
                                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: '#1a202c',
                                                                fontSize: { xs: '1rem', sm: '1.2rem' },
                                                                mb: 1,
                                                            }}
                                                        >
                                                            {item?.plan?.title}
                                                        </Typography>

                                                        {/* Plan Details */}
                                                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                                                            <Box
                                                                sx={{
                                                                    px: 1.5,
                                                                    py: 0.5,
                                                                    borderRadius: '6px',
                                                                    background: 'rgba(102, 126, 234, 0.1)',
                                                                    color: '#667eea',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                Group: {item?.group || 'N/A'}
                                                            </Box>
                                                            {item?.subject && item?.subject.length > 0 && (
                                                                <Box
                                                                    sx={{
                                                                        px: 1.5,
                                                                        py: 0.5,
                                                                        borderRadius: '6px',
                                                                        background: 'rgba(118, 75, 162, 0.1)',
                                                                        color: '#764ba2',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    Subjects: {item?.subject.length}
                                                                </Box>
                                                            )}
                                                        </Stack>

                                                        {/* Price */}
                                                        <Box>
                                                            {item?.plan?.discount > 0 ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                                                            fontWeight: 700,
                                                                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                                            WebkitBackgroundClip: 'text',
                                                                            WebkitTextFillColor: 'transparent',
                                                                        }}
                                                                    >
                                                                        ₹{(item?.plan?.price - (item?.plan?.price * item?.plan?.discount / 100)).toFixed(2)}
                                                                    </Typography>
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: '0.875rem',
                                                                            color: '#9ca3af',
                                                                            textDecoration: 'line-through',
                                                                        }}
                                                                    >
                                                                        ₹{item?.plan?.price?.toFixed(2)}
                                                                    </Typography>
                                                                    <Box
                                                                        sx={{
                                                                            px: 1,
                                                                            py: 0.5,
                                                                            borderRadius: '4px',
                                                                            background: '#10b981',
                                                                            color: '#fff',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        {item?.plan?.discount}% OFF
                                                                    </Box>
                                                                </Box>
                                                            ) : (
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                                                        fontWeight: 700,
                                                                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                                        WebkitBackgroundClip: 'text',
                                                                        WebkitTextFillColor: 'transparent',
                                                                    }}
                                                                >
                                                                    ₹{item?.plan?.price?.toFixed(2)}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>

                                                    {/* Remove Icon Button */}
                                                    <IconButton
                                                        onClick={() => handleRemoveDripCourse(index)}
                                                        sx={{
                                                            color: '#ef4444',
                                                            '&:hover': {
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </>
                            )}

                            {/* Empty Cart State */}
                            {cartCourses.length === 0 && (
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
                                        onClick={() => {
                                            // Get routeData to pass along
                                            const routeData = location.state?.isMobile || new URLSearchParams(window.location.search).get('isMobile');
                                            let queryParams = [];
                                            if (routeData) queryParams.push(`isMobile=${routeData}`);
                                            if (tokenFromUrl) queryParams.push(`token=${tokenFromUrl}`);

                                            if (queryParams.length > 0) {
                                                navigate(`/store?${queryParams.join('&')}`);
                                            } else {
                                                onQuizNavigation && onQuizNavigation('store');
                                            }
                                        }}
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
                        </Stack>
                    </Grid>

                    {/* Order Summary Sidebar */}
                    {cartCourses.length > 0 && (
                        <Grid item xs={12} lg={4}>
                            <Paper
                                sx={{
                                    borderRadius: '16px',
                                    p: 3,
                                    position: { lg: 'sticky' },
                                    top: { lg: 24 },
                                    background: '#fff',
                                    border: tokenFromUrl ? '1px solid rgba(255, 182, 16, 0.2)' : '1px solid rgba(102, 126, 234, 0.2)',
                                }}
                            >
                                <Typography variant="h6" fontWeight={700} mb={3} sx={{ color: tokenFromUrl ? '#ffb610' : '#1a202c' }}>
                                    Order Summary
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Stack spacing={2} sx={{ mb: 3 }}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Regular Courses</Typography>
                                        <Typography fontWeight={600}>{regularCourses.length}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Test Series</Typography>
                                        <Typography fontWeight={600}>{dripCourses.length}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Total Items</Typography>
                                        <Typography fontWeight={600}>{cartCourses.length}</Typography>
                                    </Stack>
                                </Stack>
                                <Stack spacing={2} sx={{ mb: 3 }}>
                                    {mobileData ? <>
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
                                                                    disabled={!couponNumber || !fetchedStudentContact}
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
                                    </> : ""}
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                                    <Typography variant="p" fontWeight={700} sx={{ color: tokenFromUrl ? '#ffb610' : '#1a202c' }}>Total Amount</Typography>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        sx={{
                                            color: tokenFromUrl ? '#ffb610' : 'text.primary',
                                        }}
                                    >
                                        ₹{finalAmount.toFixed(2)}
                                    </Typography>
                                </Stack>

                                <Button
                                    fullWidth
                                    onClick={handleProceedToCheckout}
                                    disabled={isProcessingPayment}
                                    endIcon={<ArrowRight size={20} />}
                                    sx={{
                                        background: tokenFromUrl ? '#ffb610' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        py: 1.5,
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        boxShadow: tokenFromUrl ? '0 4px 15px 0 rgba(255, 182, 16, 0.4)' : '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
                                        mb: 2,
                                        '&:hover': {
                                            background: tokenFromUrl ? '#ffb610' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                            boxShadow: tokenFromUrl ? '0 6px 20px 0 rgba(255, 182, 16, 0.6)' : '0 6px 20px 0 rgba(102, 126, 234, 0.6)',
                                        },
                                        '&:disabled': {
                                            background: tokenFromUrl ? '#ffb610' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            opacity: 0.6,
                                            cursor: 'not-allowed',
                                        },
                                    }}
                                >
                                    {isProcessingPayment ? 'Processing...' : ((fetchedStudentName && fetchedStudentContact && fetchedStudentEmail) || isAuthenticated) ? 'Continue to Payment' : 'Proceed to Checkout'}
                                </Button>

                                <Button
                                    fullWidth
                                    onClick={handleClearCart}
                                    sx={{
                                        color: '#ef4444',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'rgba(239, 68, 68, 0.1)',
                                        },
                                    }}
                                >
                                    Clear Cart
                                </Button>

                                {/* Security Badge */}
                                <Box sx={{ mt: 3, p: 2, background: tokenFromUrl ? 'rgba(255, 182, 16, 0.05)' : 'rgba(102, 126, 234, 0.05)', borderRadius: '8px' }}>
                                    <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                                        🔒 Secure checkout powered by encryption
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </div>

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
                <ProceedToCheckoutForm
                    setProceedToCheckoutModal={setProceedToCheckoutModal}
                    cartCourses={checkoutCartCourses}
                />
            </Dialog>

            {/* Bottom Sheet Drawer for Payment */}
            <Drawer
                anchor="bottom"
                open={paymentDrawerOpen}
                onClose={() => setPaymentDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        height: '90vh',
                        borderRadius: '20px 20px 0 0',
                        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                    }
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        backgroundColor: '#f8fafc',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            borderBottom: '1px solid #e2e8f0',
                            backgroundColor: '#fff',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: '#1a202c',
                            }}
                        >
                            Complete Payment
                        </Typography>
                        <Box
                            onClick={() => setPaymentDrawerOpen(false)}
                            sx={{
                                cursor: 'pointer',
                                p: 1,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f1f5f9',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#e2e8f0',
                                },
                            }}
                        >
                            <X size={20} color="#64748b" />
                        </Box>
                    </Box>

                    {/* Payment Content */}
                    <Box
                        sx={{
                            flex: 1,
                            overflow: 'auto',
                            p: 0,
                        }}
                    >
                        {paymentUrl ? (
                            <iframe
                                ref={(iframe) => {
                                    if (iframe) {
                                        iframe.onload = () => {
                                            console.log('Payment iframe loaded successfully');
                                            console.log('Current iframe URL:', paymentUrl);

                                            // Try to extract URL from iframe content
                                            try {
                                                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                                                if (iframeDoc) {
                                                    console.log('Iframe document accessible');

                                                    // Log iframe location
                                                    console.log('Iframe location href:', iframe.contentWindow?.location?.href);

                                                    // Store current payment URL
                                                    sessionStorage.setItem('iframeLoadedUrl', paymentUrl);
                                                    console.log('Stored iframe loaded URL in sessionStorage');
                                                } else {
                                                    console.warn('Cannot access iframe document (cross-origin)');
                                                }
                                            } catch (error) {
                                                console.warn('Error accessing iframe document:', error.message);
                                            }
                                        };

                                        iframe.onerror = () => {
                                            console.error('Payment iframe failed to load URL:', paymentUrl);
                                        };
                                    }
                                }}
                                src={paymentUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: '20px 20px 0 0',
                                }}
                                title="Payment Gateway"
                            />
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                }}
                            >
                                <Typography color="textSecondary">
                                    Loading payment gateway...
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Drawer>

            {/* Payment Processing Backdrop with Animation */}
            <Backdrop
                open={isProcessingPayment}
                sx={{
                    zIndex: 9999,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(2px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                }}
            >
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress
                        size={80}
                        thickness={3}
                        sx={{
                            color: '#667eea',
                            '& circle': {
                                strokeLinecap: 'round',
                            },
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            '@keyframes pulse': {
                                '0%, 100%': {
                                    opacity: 1,
                                },
                                '50%': {
                                    opacity: 0.5,
                                },
                            },
                        }}
                    />
                </Box>
                <Stack alignItems="center" spacing={1}>
                    <Typography
                        sx={{
                            color: '#fff',
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            animation: 'fadeInOut 2s ease-in-out infinite',
                            '@keyframes fadeInOut': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.6 },
                            },
                        }}
                    >
                        Processing Payment
                    </Typography>
                    <Typography
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.875rem',
                            animation: 'fadeInOut 2s ease-in-out infinite',
                            animationDelay: '0.3s',
                            '@keyframes fadeInOut': {
                                '0%, 100%': { opacity: 0.7 },
                                '50%': { opacity: 0.3 },
                            },
                        }}
                    >
                        Please wait while we secure your transaction...
                    </Typography>
                </Stack>
            </Backdrop>
        </Box>
    );
};

export default CartPage;
