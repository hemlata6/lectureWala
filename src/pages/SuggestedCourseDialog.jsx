import { Badge, Box, Button, Card, CardContent, CardMedia, Checkbox, Divider, FormControl, Grid, IconButton, InputLabel, ListItemText, MenuItem, Paper, Select, Stack, Typography, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import React, { useEffect, useState } from 'react'
import CancelIcon from '@mui/icons-material/Cancel';
import instId from '../context/instituteId';
import Network from '../context/Network';
import { useTheme } from '../context/ThemeContext';

const SuggestedCourseDialog = ({ addedSuggestCourse, handleClose, onFinalAmountUpdate, suggestedCourseId, setCartCourses, setFinalAmounts, routeData }) => {

    // const courseId = 527;
    const theme = useMuiTheme();
    const isMobile = useMediaQuery("(min-width:600px)");
    const { customColor } = useTheme();

    const getPrimaryColor = () => {
        if (routeData && customColor) {
            return customColor;
        }
        return routeData ? '#ffb610' : '#818cf8';
    };

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 129, g: 140, b: 248 };
    };

    const primaryColor = getPrimaryColor();
    const muiTheme = useMuiTheme();
    const [course, setCourse] = useState(null);
    const [coursePricing, setCoursePricing] = useState([]);
    const [coursePublic, setCoursesPublic] = useState([]);
    const [publicCourses, setPublicCourses] = useState([]);
    const [suggestedLength, setSuggestedLength] = useState([]);
    const [tagName, setTagName] = useState('');
    const [courseIdData, setCourseIdData] = useState({});
    const [finalCoursePricing, setFinalCoursePricing] = useState([]);
    const [selectedAccess, setSelectedAccess] = useState('');
    const [selectedVariant, setSelectedVariant] = useState("");
    const [selectedValidityType, setSelectedValidityType] = useState("");
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [selectedWatchTime, setSelectedWatchTime] = useState(null);
    const [variationsList, setVariationsList] = useState([]);
    const [validityTypeList, settValidityTypeList] = useState([]);
    const [validityDateList, setValidityDateList] = useState([]);
    const [watchTimeList, setWatchTimeList] = useState([]);

    const discount = finalCoursePricing[0]?.discount ?? 0;
    const taxLab = course?.taxLab ?? 0;
    const price = finalCoursePricing[0]?.price ?? 0;

    const discountedAmount = (price * discount) / 100;
    const finalPrice = price - discountedAmount;
    const taxLabAmount = (finalPrice * taxLab) / 100;
    const finalAmount = finalPrice + taxLabAmount;


    useEffect(() => {
        if (variationsList.length === 1) {
            setSelectedVariant(variationsList[0]);
        }
        if (validityTypeList.length === 1) {
            setSelectedValidityType(validityTypeList[0]);
        }
        if (validityDateList.length === 1) {
            setSelectedDuration(validityDateList[0]);
        }
        if (watchTimeList.length === 1) {
            setSelectedWatchTime(watchTimeList[0] === "Unlimited" ? "Unlimited" : Number(watchTimeList[0]));
        }
    }, [variationsList, validityTypeList, validityDateList, watchTimeList]);

    useEffect(() => {
        const uniqueModes = getUniqueLearningModes();
        if (uniqueModes.length > 0) {
            setSelectedAccess(uniqueModes[0]);
        }
    }, [coursePricing]);

    useEffect(() => {
        filterCourses();
    }, [selectedAccess, selectedVariant, selectedValidityType, selectedDuration, selectedWatchTime]);

    useEffect(() => {
        getCourseById();
    }, [suggestedCourseId]);

    useEffect(() => {
        getAllCourses();
    }, [coursePublic]);

    useEffect(() => {
        getAllCoursesPublic();
    }, []);

    useEffect(() => {
        const activeCourses = publicCourses.filter(item => item.active === true);

        const filteredCourses = activeCourses.filter(item =>
            (item.tags || []).some(tag => tag.id === coursePublic?.setting?.checkoutTag) &&
            item.id !== Number(suggestedCourseId)
        );

        const tagNames = activeCourses.filter(item =>
            (item?.tags || []).some(tag => tag?.id === coursePublic?.setting?.checkoutTag)
        );

        function findTagById(dataArray, id) {
            let matchedTag = null;
            dataArray.forEach(item => {
                if (item?.tags && Array.isArray(item?.tags)) {
                    const tag = item?.tags.find(tag => tag.id === id);
                    if (tag) {
                        matchedTag = tag;
                        return;
                    }
                }
            });
            return matchedTag;
        }

        const matchedTag = findTagById(tagNames, coursePublic?.setting?.checkoutTag);
        setTagName(matchedTag);
        setSuggestedLength(filteredCourses);

        if (activeCourses.length > 0) {
            const selectedCourse = activeCourses.find(item => suggestedCourseId === item.id);
            if (selectedCourse) {
                setCourseIdData(selectedCourse);
            }
        }
    }, [publicCourses, suggestedCourseId, coursePublic]);

    const getCourseById = async () => {
        if (!suggestedCourseId) return;
        try {
            let response = await Network.fetchCourseById(suggestedCourseId);
            setCourse(response?.course || null);
            let coursePricing = response?.course?.coursePricing;
            setCoursePricing(coursePricing);
        } catch (error) {
            console.error("Error fetching course:", error);
        };
    };

    const getAllCoursesPublic = async () => {
        try {
            const response = await Network.getBuyCourseDetailsSecond(Number(suggestedCourseId));
            setCoursesPublic(response.course);
            // getInstituteDetail(response.course?.instId);
        } catch (error) {
            console.log(error);
        };
    };

    const getAllCourses = async () => {
        try {
            const response = await Network.getFreeCourseList(instId);
            setPublicCourses(response.courses);
        } catch (error) {
            console.log(error);
        };
    };


    const getUniqueLearningModes = () => {
        const modeSet = new Set();

        coursePricing?.forEach(course => {
            let modes = [];
            if (course.liveAccess) modes.push("Live Access");
            if (course.onlineContentAccess) modes.push("Recorded");
            if (course.offlineContentAccess) modes.push("Pendrive");
            if (course.faceToFaceAccess) modes.push("Face to Face");
            if (course.quizAccess) modes.push("Quiz Access");
            if (modes.length) {
                modeSet.add(modes.join(" + "));
            }
        });

        return Array.from(modeSet);
    };

    const filterCourses = () => {
        let filtered = [...coursePricing];
        if (selectedAccess) {

            filtered = coursePricing?.filter(course => {
                const selectedModes = selectedAccess.split(" + ");

                const matchesSelection = (
                    (selectedModes.includes("Live Access") ? course.liveAccess === true : course.liveAccess === null) &&
                    (selectedModes.includes("Recorded") ? course.onlineContentAccess === true : course.onlineContentAccess === null) &&
                    (selectedModes.includes("Pendrive") ? course.offlineContentAccess === true : course.offlineContentAccess === null) &&
                    (selectedModes.includes("Quiz Access") ? course.quizAccess === true : course.quizAccess === null) &&
                    (selectedModes.includes("Face to Face") ? course.faceToFaceAccess === true : course.faceToFaceAccess === null)
                );

                return matchesSelection;
            });
        };

        const variationsList = newgetVariationList(filtered);
        setVariationsList(variationsList)

        if (selectedVariant) {
            filtered = filtered?.filter((course) =>
                selectedVariant === "None"
                    ? !course.variation || course.variation.trim() === ""
                    : course.variation === selectedVariant
            );
        }

        const validityTypes = [...new Set(filtered.map(course => course.validityType))];
        settValidityTypeList(validityTypes);


        if (selectedValidityType) {
            filtered = filtered?.filter(course => course.validityType === selectedValidityType);
        }

        const validityDates = [
            ...new Set(
                filtered.map(course =>
                    selectedValidityType === "validity"
                        ? formatMilliseconds(course.duration)
                        : formatTimestamp(course.expiry)
                ).filter(value => value !== "N/A")
            )
        ];

        setValidityDateList(validityDates);

        if (selectedDuration) {
            filtered = filtered?.filter(course =>
                selectedValidityType === "validity"
                    ? formatMilliseconds(course.duration) === selectedDuration
                    : formatTimestamp(course.expiry) === selectedDuration
            );
        }

        const watchTimeList = filtered?.map(course =>
            course.watchTime ? course.watchTime : "Unlimited"
        );
        setWatchTimeList([...new Set(watchTimeList)]);

        if (selectedWatchTime !== null && selectedWatchTime !== undefined) {

            filtered = filtered?.filter(course =>
                selectedWatchTime === "Unlimited"
                    ? course.watchTime === null || course.watchTime === undefined || course.watchTime === ""
                    : Number(course.watchTime) === Number(selectedWatchTime)
            );
        }

        setFinalCoursePricing(filtered);
    };

    const newgetVariationList = (filtered) => {
        const variationsSet = new Set();

        filtered?.forEach((course) => {
            if (course.variation && course.variation.trim() !== "") {
                variationsSet.add(course.variation);
            }
        });

        if (filtered?.some((course) => !course.variation || course.variation === null || course.variation.trim() === "")) {
            variationsSet.add("None");
        }

        return Array.from(variationsSet);
    };

    function formatMilliseconds(ms) {
        if (!ms) return "N/A";

        const millisecondsInYear = 365 * 24 * 60 * 60 * 1000;
        const millisecondsInMonth = 30 * 24 * 60 * 60 * 1000;
        const millisecondsInDay = 24 * 60 * 60 * 1000;

        const years = Math.floor(ms / millisecondsInYear);
        ms %= millisecondsInYear;

        const months = Math.floor(ms / millisecondsInMonth);
        ms %= millisecondsInMonth;

        const days = Math.floor(ms / millisecondsInDay);

        let result = [];
        if (years > 0) result.push(`${years} Year${years > 1 ? 's' : ''}`);
        if (months > 0) result.push(`${months} Month${months > 1 ? 's' : ''}`);
        if (days > 0) result.push(`${days} Day${days > 1 ? 's' : ''}`);

        return result.length > 0 ? result.join(" ") : "N/A";
    }

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "N/A";

        return new Date(timestamp).toLocaleDateString();
    };

    const handleChangeAccess = (mode) => {
        setSelectedAccess(mode);
        // Reset all dependent selections when changing access mode
        setSelectedVariant('');
        setSelectedValidityType('');
        setSelectedDuration(null);
        setSelectedWatchTime(null);
    };
    const handleSelectVariant = (variant) => {
        setSelectedVariant(variant);
        // Reset dependent selections when changing variant
        setSelectedValidityType('');
        setSelectedDuration(null);
        setSelectedWatchTime(null);
    };
    const handleSelectValidityType = (type) => {
        setSelectedValidityType(type);
        // Reset dependent selections when changing validity type
        setSelectedDuration(null);
        setSelectedWatchTime(null);
    };
    const handleSelectDuration = (duration) => setSelectedDuration(duration);
    const handleSelectWatchTime = (time) => setSelectedWatchTime(time !== "Unlimited" ? Number(time) : time);

    const handleAddedInCart = (course, combination) => {
        if (!combination) {
            console.error('Error: Missing combination pricing object');
            return;
        }

        setCartCourses((prevCart) => {
            const isAlreadyAdded = prevCart.some((item) => item.coursePricingId === combination.id);

            if (isAlreadyAdded) {
                const updatedCart = prevCart.filter((item) => item.coursePricingId !== combination.id);
                updateFinalAmount(updatedCart);
                return updatedCart;
            } else {
                const discount = combination.discount ?? 0;
                const price = combination.price ?? 0;
                const discountedAmount = (price * discount) / 100;
                const finalPrice = price - discountedAmount;
                const updatedCourse = {
                    ...course,
                    finalPrice,
                    coursePricingId: combination.id
                };

                const updatedCart = [...prevCart, updatedCourse];
                updateFinalAmount(updatedCart);
                localStorage.setItem('cartCourses', JSON.stringify(updatedCart));
                window.dispatchEvent(new Event('cartUpdated'));

                return updatedCart;
            }
        });
        handleClose();
    };

    const updateFinalAmount = (cartItems) => {
        const totalAmount = cartItems.reduce((sum, item) => {
            const taxLab = item.taxLab ?? 0;
            const taxLabAmount = (item.finalPrice * taxLab) / 100;
            return sum + (item.finalPrice + taxLabAmount);
        }, 0);

        setFinalAmounts(totalAmount);
    };

    return (
        <Box
            sx={{
                background: muiTheme.palette.background.paper,
                borderRadius: '12px',
                overflow: 'hidden',
            }}
        >
            {/* Modern Header with Gradient */}
            <Box
                sx={{
                    background: muiTheme.palette.mode === 'dark'
                        ? muiTheme.palette.primary.main
                        : (routeData ? primaryColor : 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)'),
                    p: { xs: 1.5, sm: 2 },
                    position: 'relative',
                }}
            >
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        top: { xs: 8, sm: 12 },
                        right: { xs: 8, sm: 12 },
                        color: '#fff',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.3)',
                            transform: 'rotate(90deg)',
                        },
                    }}
                >
                    <CancelIcon />
                </IconButton>

                <Typography
                    variant="h5"
                    sx={{
                        color: '#fff',
                        fontWeight: 600,
                        mb: 0,
                        pr: { xs: 4, sm: 5 },
                        fontSize: { xs: '0.9rem', sm: '0.95rem' },
                    }}
                >
                    {course?.title}
                </Typography>
                {/* <Typography
                    variant="body2"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        lineHeight: 1.6,
                    }}
                >
                    {course?.shortDescription === null ? 'Configure your course preferences' : course?.shortDescription}
                </Typography> */}
            </Box>

            {/* Content Section */}
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {/* Lecture Mode */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Lecture Mode
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                {getUniqueLearningModes()?.map((mode) => (
                                    <Button
                                        key={mode}
                                        onClick={() => handleChangeAccess(mode)}
                                        variant={selectedAccess === mode ? "contained" : "outlined"}
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            borderRadius: '16px',
                                            padding: '4px 14px',
                                            minHeight: '28px',
                                            background: selectedAccess === mode
                                                ? primaryColor
                                                : 'transparent',
                                            borderColor: selectedAccess === mode ? 'transparent' : primaryColor,
                                            color: selectedAccess === mode ? '#fff' : primaryColor,
                                            boxShadow: selectedAccess === mode
                                                ? `0 2px 6px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.3)`
                                                : 'none',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: selectedAccess === mode
                                                    ? primaryColor
                                                    : `rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.08)`,
                                                borderColor: selectedAccess === mode ? 'transparent' : primaryColor,
                                                transform: 'translateY(-1px)',
                                                boxShadow: `0 3px 10px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.25)`,
                                            },
                                        }}
                                    >
                                        {mode}
                                    </Button>
                                ))}
                            </Box>
                        </Box>

                        {/* Variant */}
                        {variationsList?.length > 0 && !(variationsList?.length === 1 && variationsList[0] === "None") && selectedAccess && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Variant
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                    {variationsList.map((variant) => (
                                        <Button
                                            key={variant}
                                            onClick={() => handleSelectVariant(variant)}
                                            variant={selectedVariant === variant ? "contained" : "outlined"}
                                            sx={{
                                                textTransform: 'none',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                borderRadius: '16px',
                                                padding: '4px 14px',
                                                minHeight: '28px',
                                                background: selectedVariant === variant
                                                    ? primaryColor
                                                    : 'transparent',
                                                borderColor: selectedVariant === variant ? 'transparent' : primaryColor,
                                                color: selectedVariant === variant ? '#fff' : primaryColor,
                                                boxShadow: selectedVariant === variant
                                                    ? `0 2px 6px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.3)`
                                                    : 'none',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: selectedVariant === variant
                                                        ? primaryColor
                                                        : `rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.08)`,
                                                    borderColor: selectedVariant === variant ? 'transparent' : primaryColor,
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: `0 3px 10px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.25)`,
                                                },
                                            }}
                                        >
                                            {variant}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Validity Types */}
                        {!(validityTypeList?.length === 1 && validityTypeList[0] !== "lifetime") && selectedAccess && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Validity Types
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                    {validityTypeList?.map((type) => (
                                        <Button
                                            key={type}
                                            onClick={() => handleSelectValidityType(type)}
                                            variant={selectedValidityType === type ? "contained" : "outlined"}
                                            sx={{
                                                textTransform: 'capitalize',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                borderRadius: '16px',
                                                padding: '4px 14px',
                                                minHeight: '28px',
                                                background: selectedValidityType === type
                                                    ? primaryColor
                                                    : 'transparent',
                                                borderColor: selectedValidityType === type ? 'transparent' : primaryColor,
                                                color: selectedValidityType === type ? '#fff' : primaryColor,
                                                boxShadow: selectedValidityType === type
                                                    ? `0 2px 6px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.3)`
                                                    : 'none',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: selectedValidityType === type
                                                        ? primaryColor
                                                        : `rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.08)`,
                                                    borderColor: selectedValidityType === type ? 'transparent' : primaryColor,
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: `0 3px 10px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.25)`,
                                                },
                                            }}
                                        >
                                            {type}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Validity Date */}
                        {selectedValidityType && selectedValidityType !== "lifetime" && validityDateList?.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {selectedValidityType
                                        ? `${selectedValidityType.charAt(0).toUpperCase() + selectedValidityType.slice(1)} Date`
                                        : "Validity Date"}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                    {validityDateList?.map((duration) => (
                                        <Button
                                            key={duration}
                                            onClick={() => handleSelectDuration(duration)}
                                            variant={selectedDuration === duration ? "contained" : "outlined"}
                                            sx={{
                                                textTransform: 'none',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                borderRadius: '16px',
                                                padding: '4px 14px',
                                                minHeight: '28px',
                                                background: selectedDuration === duration
                                                    ? primaryColor
                                                    : 'transparent',
                                                borderColor: selectedDuration === duration ? 'transparent' : primaryColor,
                                                color: selectedDuration === duration ? '#fff' : primaryColor,
                                                boxShadow: selectedDuration === duration
                                                    ? `0 2px 6px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.3)`
                                                    : 'none',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: selectedDuration === duration
                                                        ? primaryColor
                                                        : `rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.08)`,
                                                    borderColor: selectedDuration === duration ? 'transparent' : primaryColor,
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: `0 3px 10px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.25)`,
                                                },
                                            }}
                                        >
                                            {duration}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Watch Time */}
                        {selectedValidityType && watchTimeList?.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Watch Time
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                    {watchTimeList?.map((watchTime) => (
                                        <Button
                                            key={watchTime}
                                            onClick={() => handleSelectWatchTime(watchTime)}
                                            variant={selectedWatchTime === watchTime || (selectedWatchTime === "Unlimited" && watchTime === "Unlimited") || Number(selectedWatchTime) === Number(watchTime) ? "contained" : "outlined"}
                                            sx={{
                                                textTransform: 'none',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                borderRadius: '16px',
                                                padding: '4px 14px',
                                                minHeight: '28px',
                                                background: (selectedWatchTime === watchTime || (selectedWatchTime === "Unlimited" && watchTime === "Unlimited") || Number(selectedWatchTime) === Number(watchTime))
                                                    ? routeData ? '#ffb610' : '#818cf8'
                                                    : 'transparent',
                                                borderColor: (selectedWatchTime === watchTime || (selectedWatchTime === "Unlimited" && watchTime === "Unlimited") || Number(selectedWatchTime) === Number(watchTime)) ? 'transparent' : primaryColor,
                                                color: (selectedWatchTime === watchTime || (selectedWatchTime === "Unlimited" && watchTime === "Unlimited") || Number(selectedWatchTime) === Number(watchTime)) ? '#fff' : primaryColor,
                                                boxShadow: (selectedWatchTime === watchTime || (selectedWatchTime === "Unlimited" && watchTime === "Unlimited") || Number(selectedWatchTime) === Number(watchTime))
                                                    ? `0 2px 6px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.3)`
                                                    : 'none',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: (selectedWatchTime === watchTime || (selectedWatchTime === "Unlimited" && watchTime === "Unlimited") || Number(selectedWatchTime) === Number(watchTime))
                                                        ? primaryColor
                                                        : `rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.08)`,
                                                    borderColor: (selectedWatchTime === watchTime || (selectedWatchTime === "Unlimited" && watchTime === "Unlimited") || Number(selectedWatchTime) === Number(watchTime)) ? 'transparent' : primaryColor,
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: `0 3px 10px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.25)`,
                                                },
                                            }}
                                        >
                                            {watchTime !== "Unlimited" ? `${watchTime}x` : watchTime}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Grid>
                </Grid>

                {/* Pricing Summary Card */}
                {finalCoursePricing[0] && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.5,
                            mb: 1.5,
                            borderRadius: '8px',
                            background: muiTheme.palette.mode === 'dark'
                                ? muiTheme.palette.background.paper
                                : `rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.05)`,
                            border: `1.5px solid ${primaryColor}`,
                        }}
                    >
                        <Stack spacing={0.75}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '11px' }}>Base Price</Typography>
                                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '11px' }}>
                                    ₹{price.toFixed(2)}
                                </Typography>
                            </Stack>
                            {discount > 0 && (
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="success.main" sx={{ fontSize: '11px' }}>Discount ({discount}%)</Typography>
                                    <Typography variant="body2" color="success.main" sx={{ fontSize: '11px' }}>
                                        -₹{discountedAmount.toFixed(2)}
                                    </Typography>
                                </Stack>
                            )}
                            {taxLab > 0 && (
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '11px' }}>Tax ({taxLab}%)</Typography>
                                    <Typography variant="body2" sx={{ fontSize: '11px' }}>
                                        +₹{taxLabAmount.toFixed(2)}
                                    </Typography>
                                </Stack>
                            )}
                            <Divider sx={{ my: 0.5 }} />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body1" fontWeight={600} sx={{ fontSize: '13px' }}>Total Amount</Typography>
                                <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    sx={{
                                        fontSize: '15px',
                                        color: primaryColor,
                                    }}
                                >
                                    ₹{finalAmount.toFixed(2)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Paper>
                )}

                {/* Add to Cart Button */}
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleAddedInCart(addedSuggestCourse, finalCoursePricing[0])}
                    disabled={!finalCoursePricing[0]}
                    sx={{
                        background: 'transparent',
                        border: `2px solid ${primaryColor}`,
                        color: primaryColor,
                        fontWeight: 600,
                        fontSize: '13px',
                        py: 1.25,
                        borderRadius: '8px',
                        textTransform: 'none',
                        boxShadow: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: `rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.06)`,
                            border: `2px solid ${primaryColor}`,
                            color: primaryColor,
                            transform: 'translateY(-1px)',
                            boxShadow: `0 2px 8px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.15)`,
                        },
                        '&:disabled': {
                            background: 'transparent',
                            border: '2px solid rgba(0, 0, 0, 0.12)',
                            color: 'rgba(0, 0, 0, 0.26)',
                            boxShadow: 'none',
                        },
                    }}
                >
                    Add to Cart
                    {finalCoursePricing[0] && ` • ₹${finalAmount.toFixed(2)}`}
                </Button>
            </Box>
        </Box>
    )
}

export default SuggestedCourseDialog