import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Play, Clock, Award, Book, FileText, Headphones, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button, Chip, Dialog, useMediaQuery } from '@mui/material';
import Endpoints from '../context/endpoints';
import parse from 'html-react-parser';
import SuggestedCourseDialog from './SuggestedCourseDialog';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const CourseExplore = ({ course: propCourse, allCourses: propAllCourses, onBack, onSidebarToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract URL parameters
  const routeData = location.state?.isMobile || new URLSearchParams(window.location.search).get('isMobile');
  const tokenFromUrl = sessionStorage.getItem('studentToken') || new URLSearchParams(window.location.search).get('token');;
  const urlStudentName = new URLSearchParams(window.location.search).get('studentname');
  const urlContact = new URLSearchParams(window.location.search).get('contact');
  const urlEmail = new URLSearchParams(window.location.search).get('email');
  const isMobile = useMediaQuery("(min-width:600px)");
  const [course, setCourse] = useState(propCourse);
  const [allCourses, setAllCourses] = useState(propAllCourses || []);
  const [suggestedCourses, setSuggestedCourses] = useState([]);
  const [coursePricing, setCoursePricing] = useState([]);
  const [finalCoursePricing, setFinalCoursePricing] = useState([]);
  const [selectedAccess, setSelectedAccess] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedValidityType, setSelectedValidityType] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedWatchTime, setSelectedWatchTime] = useState(null);
  const [variationsList, setVariationsList] = useState([]);
  const [validityTypeList, setValidityTypeList] = useState([]);
  const [validityDateList, setValidityDateList] = useState([]);
  const [watchTimeList, setWatchTimeList] = useState([]);
  const [cartCourses, setCartCourses] = useState([]);
  const [suggestedCourseDialog, setSuggestedCourseDialog] = useState(false);
  const [selectedSuggestedCourse, setSelectedSuggestedCourse] = useState(null);
  const [finalAmounts, setFinalAmounts] = useState(0);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  const discount = finalCoursePricing[0]?.discount ?? 0;
  const taxLab = course?.taxLab ?? 0;
  const price = finalCoursePricing[0]?.price ?? 0;

  const discountedAmount = (price * discount) / 100;
  const finalPrice = price - discountedAmount;
  const taxLabAmount = (finalPrice * taxLab) / 100;
  const finalAmount = finalPrice + taxLabAmount;

  // console.log('course===explore', course);


  // Hide layout controls when URL parameters are present
  useEffect(() => {
    if (routeData || tokenFromUrl || urlStudentName || urlContact || urlEmail) {
      sessionStorage.setItem('hideLayoutControls', 'true');
    } else {
      sessionStorage.removeItem('hideLayoutControls');
    }

    return () => {
      if (!tokenFromUrl) {
        sessionStorage.removeItem('hideLayoutControls');
      }
    };
  }, [routeData, tokenFromUrl, urlStudentName, urlContact, urlEmail]);



  // Load course data from sessionStorage on mount (for page refresh)
  useEffect(() => {
    if (!propCourse) {
      const savedCourse = sessionStorage.getItem('currentCourse');
      const savedAllCourses = sessionStorage.getItem('allCourses');

      if (savedCourse) {
        setCourse(JSON.parse(savedCourse));
      }
      if (savedAllCourses) {
        setAllCourses(JSON.parse(savedAllCourses));
      }
    } else {
      // Save to sessionStorage when props are provided
      sessionStorage.setItem('currentCourse', JSON.stringify(propCourse));
      if (propAllCourses && propAllCourses.length > 0) {
        sessionStorage.setItem('allCourses', JSON.stringify(propAllCourses));
      }
      setCourse(propCourse);
      setAllCourses(propAllCourses || []);
    }
  }, [propCourse, propAllCourses]);

  useEffect(() => {
    if (course?.coursePricing) {
      setCoursePricing(course.coursePricing);
    }
  }, [course]);

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
    window.scrollTo(0, 0);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (onSidebarToggle) onSidebarToggle(true);
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cartCourses');
    if (savedCart) {
      setCartCourses(JSON.parse(savedCart));
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem('cartCourses');
      if (updatedCart) {
        setCartCourses(JSON.parse(updatedCart));
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

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
    // Get suggested courses based on checkout tag
    if (course?.setting?.checkoutTag && allCourses) {

      const filterCourseTags = allCourses.filter(item => {
        const tagslists = item.tags || [];

        return tagslists.some(tag => tag.id === course.setting.checkoutTag);
      });

      setSuggestedCourses(filterCourseTags);
    }
  }, [course, allCourses]);

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
    }

    const variationsList = getVariationList(filtered);
    setVariationsList(variationsList);

    if (selectedVariant) {
      filtered = filtered?.filter((course) =>
        selectedVariant === "None"
          ? !course.variation || course.variation.trim() === ""
          : course.variation === selectedVariant
      );
    }

    const validityTypes = [...new Set(filtered.map(course => course.validityType))];
    setValidityTypeList(validityTypes);

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

  const getVariationList = (filtered) => {
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

  const calculatePrice = (pricing, accessType) => {
    if (!pricing || !accessType) return;

    const basePrice = pricing.price || 0;
    const discountPercent = pricing.discount || 0;

    setOriginalPrice(basePrice);
    setDiscount(discountPercent);

    if (discountPercent > 0) {
      const discountedPrice = basePrice - (basePrice * (discountPercent / 100));
      setFinalPrice(discountedPrice);
    } else {
      setFinalPrice(basePrice);
    }
  };

  const handleAccessChange = (accessKey) => {
    setSelectedAccess(accessKey);
    if (selectedPricing) {
      calculatePrice(selectedPricing, accessKey);
    }
  };

  const getAccessOptions = () => {
    if (!selectedPricing) return [];

    const options = [];
    const accessTypes = [
      { key: 'liveAccess', label: 'Live Access', icon: <Play className="w-4 h-4" /> },
      { key: 'onlineContentAccess', label: 'Online Content', icon: <FileText className="w-4 h-4" /> },
      { key: 'offlineContentAccess', label: 'Offline Content', icon: <Book className="w-4 h-4" /> },
      { key: 'faceToFaceAccess', label: 'Face to Face', icon: <Award className="w-4 h-4" /> },
    ];

    accessTypes.forEach(access => {
      if (selectedPricing[access.key] !== null) {
        options.push({
          ...access,
          value: selectedPricing[access.key]
        });
      }
    });

    return options;
  };

  const getValidityText = () => {
    if (!selectedPricing) return '';

    if (selectedPricing.validityType === 'lifetime') {
      return 'Lifetime Access';
    } else if (selectedPricing.duration) {
      return `${selectedPricing.duration} Days Access`;
    } else if (selectedPricing.watchTime) {
      return `${selectedPricing.watchTime} Hours Watch Time`;
    }
    return 'Limited Access';
  };

  const handleShowCart = () => {
    if (routeData || tokenFromUrl) {
      let queryParams = [];
      if (routeData) queryParams.push(`isMobile=${routeData}`);
      if (tokenFromUrl) queryParams.push(`token=${tokenFromUrl}`);
      navigate(`/cart?${queryParams.join('&')}`);
    } else {
      navigate('/cart');
    }
  };

  const handleAddToCart = () => {
    if (!finalCoursePricing[0]) return;

    const cartItem = {
      ...course,
      pricingId: finalCoursePricing[0]?.id,
      finalPrice: finalAmount,
      coursePricingId: finalCoursePricing[0]?.id
    };

    const isAlreadyInCart = cartCourses.some(item => item.coursePricingId === cartItem.coursePricingId);

    let updatedCart;
    if (isAlreadyInCart) {
      updatedCart = cartCourses.filter(item => item.coursePricingId !== cartItem.coursePricingId);
    } else {
      updatedCart = [...cartCourses, cartItem];
    }

    setCartCourses(updatedCart);
    localStorage.setItem('cartCourses', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handlePurchase = () => {
    // Add to cart first if not already in cart
    if (finalCoursePricing[0]) {
      const cartItem = {
        ...course,
        pricingId: finalCoursePricing[0]?.id,
        finalPrice: finalAmount,
        coursePricingId: finalCoursePricing[0]?.id
      };

      const isAlreadyInCart = cartCourses.some(item => item.coursePricingId === cartItem.coursePricingId);

      if (!isAlreadyInCart) {
        const updatedCart = [...cartCourses, cartItem];
        setCartCourses(updatedCart);
        localStorage.setItem('cartCourses', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
      }

      // Navigate to cart page with only isMobile and token
      if (routeData || tokenFromUrl) {
        let queryParams = [];
        if (routeData) queryParams.push(`isMobile=${routeData}`);
        if (tokenFromUrl) queryParams.push(`token=${tokenFromUrl}`);
        navigate(`/cart?${queryParams.join('&')}`);
      } else {
        navigate('/cart');
      }
    }
  };

  const handleSuggestedCourseAddToCart = (suggestedCourse) => {
    // Check if already in cart - if yes, remove directly without opening dialog
    const isAlreadyInCart = cartCourses.some(item => item.id === suggestedCourse.id);

    if (isAlreadyInCart) {
      // Remove from cart directly
      const updatedCart = cartCourses.filter(item => item.id !== suggestedCourse.id);
      setCartCourses(updatedCart);
      localStorage.setItem('cartCourses', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      // Open dialog to select pricing options
      setSelectedSuggestedCourse(suggestedCourse);
      setSuggestedCourseDialog(true);
    }
  };

  const handleCloseSuggestedCourseDialog = () => {
    setSuggestedCourseDialog(false);
    setSelectedSuggestedCourse(null);
  };

  const handleFinalAmountUpdate = (amount) => {
    setFinalAmounts(amount);
  };

  const handleSuggestedCoursePurchase = (suggestedCourse) => {
    // Open dialog for purchase
    setSelectedSuggestedCourse(suggestedCourse);
    setSuggestedCourseDialog(true);
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  console.log('course', course);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-20">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              // Navigate back with only isMobile and token
              if (routeData || tokenFromUrl) {
                let queryParams = [];
                if (routeData) queryParams.push(`isMobile=${routeData}`);
                if (tokenFromUrl) queryParams.push(`token=${tokenFromUrl}`);
                navigate(`/store?${queryParams.join('&')}`);
              } else if (onBack) {
                onBack();
              } else {
                navigate('/store');
              }
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-sm sm:text-base">Back to Store</span>
          </button>
          {
            !routeData && (
              <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Course Details
              </h1>
            )
          }
          {
            routeData && (
              <>
                {cartCourses?.length > 0 && (
                  <Button
                    onClick={handleShowCart}
                    variant="contained"
                    startIcon={<ShoppingCart className="h-3.5 w-3.5" />}
                    sx={{
                      background: '#ffb610',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      textTransform: 'none',
                      boxShadow: '0 4px 15px 0 rgba(255, 182, 16, 0.4)',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        background: '#ffb610',
                        boxShadow: '0 6px 20px 0 rgba(255, 182, 16, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    View Cart ({cartCourses.length})
                  </Button>
                )}
              </>
            )
          }

        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-5">
          {/* Main Content: 2 columns (image/desc + config) */}
          <div className="lg:col-span-9">
            <div className="lg:grid lg:grid-cols-2 lg:gap-5">
              {/* Left: Image + Short Desc */}
              <div>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full">
                  <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                    <img
                      src={Endpoints?.mediaBaseUrl + course.logo}
                      alt={course.title}
                      className="w-full"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      {course.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3 break-words">
                      {course.shortDescription}
                    </p>
                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3 max-w-full">
                        {course.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag.id}
                            label={tag.tag}
                            size="small"
                            sx={{
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              fontWeight: '600',
                              fontSize: '11px',
                              height: '24px',
                              maxWidth: '100%',
                            }}
                          />
                        ))}
                        {course.tags.length > 3 && (
                          <Chip
                            label={`+${course.tags.length - 3}`}
                            size="small"
                            sx={{
                              backgroundColor: '#f3f4f6',
                              color: '#6b7280',
                              fontWeight: '600',
                              fontSize: '11px',
                              height: '24px',
                            }}
                          />
                        )}
                      </div>
                    )}
                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                      {course.totalVideos > 0 && (
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-500">Videos</p>
                            <p className="text-sm font-semibold text-gray-900">{course.totalVideos}</p>
                          </div>
                        </div>
                      )}
                      {course.totalQuiz > 0 && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-500">Quizzes</p>
                            <p className="text-sm font-semibold text-gray-900">{course.totalQuiz}</p>
                          </div>
                        </div>
                      )}
                      {course.totalDocs > 0 && (
                        <div className="flex items-center gap-2">
                          <Book className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-500">Documents</p>
                            <p className="text-sm font-semibold text-gray-900">{course.totalDocs}</p>
                          </div>
                        </div>
                      )}
                      {course.totalAudios > 0 && (
                        <div className="flex items-center gap-2">
                          <Headphones className="w-4 h-4 text-orange-600" />
                          <div>
                            <p className="text-xs text-gray-500">Audios</p>
                            <p className="text-sm font-semibold text-gray-900">{course.totalAudios}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Right: Course Configuration (restored full code) */}
              <div style={{ marginTop: !isMobile ? "10px" : "" }}>
                <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-3 border border-gray-100 sticky top-24 overflow-hidden h-full">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">Course Configuration</h3>
                  {/* Lecture Mode */}
                  <div className="mb-3 w-full overflow-hidden">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Lecture Mode</label>
                    <div className="flex flex-wrap gap-1.5 max-w-full">
                      {getUniqueLearningModes().map((mode) => (
                        <button
                          key={mode}
                          onClick={() => handleChangeAccess(mode)}
                          className={`px-2 py-1.5 rounded-lg border-2 transition-all text-xs flex-shrink-0 ${routeData
                            ? (selectedAccess === mode
                              ? 'border-amber-400 bg-amber-50 text-amber-600 font-semibold'
                              : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50 text-gray-700')
                            : (selectedAccess === mode
                              ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700')
                            }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Variant */}
                  {variationsList?.length > 0 && !(variationsList?.length === 1 && variationsList[0] === "None") && selectedAccess && (
                    <div className="mb-3 w-full overflow-hidden">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Variant</label>
                      <div className="flex flex-wrap gap-1.5 max-w-full">
                        {variationsList.map((variant) => (
                          <button
                            key={variant}
                            onClick={() => handleSelectVariant(variant)}
                            className={`px-2 py-1.5 rounded-lg border-2 transition-all text-xs flex-shrink-0 ${routeData
                              ? (selectedVariant === variant
                                ? 'border-amber-400 bg-amber-50 text-amber-600 font-semibold'
                                : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50 text-gray-700')
                              : (selectedVariant === variant
                                ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700')
                              }`}
                          >
                            {variant}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Validity Types */}
                  {!(validityTypeList?.length === 1 && validityTypeList[0] !== "lifetime") && selectedAccess && (
                    <div className="mb-3 w-full overflow-hidden">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Validity Types</label>
                      <div className="flex flex-wrap gap-1.5 max-w-full">
                        {validityTypeList?.map((type) => (
                          <button
                            key={type}
                            onClick={() => handleSelectValidityType(type)}
                            className={`px-2 py-1.5 rounded-lg border-2 transition-all capitalize text-xs flex-shrink-0 ${routeData
                              ? (selectedValidityType === type
                                ? 'border-amber-400 bg-amber-50 text-amber-600 font-semibold'
                                : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50 text-gray-700')
                              : (selectedValidityType === type
                                ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700')
                              }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Validity Date */}
                  {selectedValidityType && selectedValidityType !== "lifetime" && validityDateList?.length > 0 && (
                    <div className="mb-3 w-full overflow-hidden">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        {selectedValidityType
                          ? `${selectedValidityType.charAt(0).toUpperCase() + selectedValidityType.slice(1)} Date`
                          : "Validity Date"}
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-w-full">
                        {validityDateList?.map((duration) => (
                          <button
                            key={duration}
                            onClick={() => handleSelectDuration(duration)}
                            className={`px-2 py-1.5 rounded-lg border-2 transition-all text-xs flex-shrink-0 ${routeData
                              ? (selectedDuration === duration
                                ? 'border-amber-400 bg-amber-50 text-amber-600 font-semibold'
                                : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50 text-gray-700')
                              : (selectedDuration === duration
                                ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700')
                              }`}
                          >
                            {duration}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Watch Time */}
                  {selectedValidityType && watchTimeList?.length > 0 && (
                    <div className="mb-3 w-full overflow-hidden">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Watch Time</label>
                      <div className="flex flex-wrap gap-1.5 max-w-full">
                        {watchTimeList?.map((watchTime) => (
                          <button
                            key={watchTime}
                            onClick={() => handleSelectWatchTime(watchTime)}
                            className={`px-2 py-1.5 rounded-lg border-2 transition-all text-xs flex-shrink-0 ${routeData
                              ? (selectedWatchTime === watchTime || (selectedWatchTime === "Unlimited" && watchTime === "Unlimited") || Number(selectedWatchTime) === Number(watchTime)
                                ? 'border-amber-400 bg-amber-50 text-amber-600 font-semibold'
                                : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50 text-gray-700')
                              : (selectedWatchTime === watchTime || (selectedWatchTime === "Unlimited" && watchTime === "Unlimited") || Number(selectedWatchTime) === Number(watchTime)
                                ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700')
                              }`}
                          >
                            {watchTime !== "Unlimited" ? `${watchTime}x` : watchTime}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Price Section */}
                  {finalCoursePricing[0] && (
                    <>
                      <div className={`rounded-xl p-2.5 mb-3 overflow-x-hidden bg-gradient-to-r ${routeData
                        ? 'from-amber-50 to-yellow-50'
                        : 'from-blue-50 to-purple-50'
                        }`}>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-gray-600 text-xs whitespace-nowrap">Base Price</span>
                            <span className="text-gray-400 line-through text-xs">₹{price.toFixed(2)}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-green-600 text-xs whitespace-nowrap">Discount ({discount}%)</span>
                              <span className="text-green-600 font-semibold text-xs">-₹{discountedAmount.toFixed(2)}</span>
                            </div>
                          )}
                          {taxLab > 0 && (
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-gray-600 text-xs whitespace-nowrap">Tax ({taxLab}%)</span>
                              <span className="text-gray-700 text-xs">+₹{taxLabAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-300 pt-2 mt-2">
                            <div className="flex justify-between items-center gap-2">
                              <span className="font-bold text-gray-800 text-xs sm:text-sm whitespace-nowrap">Total Amount</span>
                              <span className={`text-lg sm:text-xl font-bold ${routeData
                                ? 'text-amber-600'
                                : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
                                }`}>
                                ₹{finalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="space-y-1.5 w-full">
                        <Button
                          onClick={handlePurchase}
                          variant="contained"
                          fullWidth
                          disabled={!finalCoursePricing[0]}
                          sx={{
                            background: routeData ? '#ffb610' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: { xs: '12px', sm: '13px' },
                            padding: { xs: '8px 12px', sm: '10px 16px' },
                            borderRadius: '10px',
                            textTransform: 'none',
                            boxShadow: routeData ? '0 4px 15px 0 rgba(255, 182, 16, 0.4)' : '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            '&:hover': {
                              background: routeData ? '#ffb610' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                              boxShadow: routeData ? '0 6px 20px 0 rgba(255, 182, 16, 0.6)' : '0 6px 20px 0 rgba(102, 126, 234, 0.6)',
                              transform: 'translateY(-2px)',
                            },
                            '&:disabled': {
                              background: 'rgba(0, 0, 0, 0.12)',
                              color: 'rgba(0, 0, 0, 0.26)',
                              boxShadow: 'none',
                            },
                          }}
                        >
                          Buy Now • ₹{finalAmount.toFixed(2)}
                        </Button>
                        <Button
                          onClick={handleAddToCart}
                          variant="outlined"
                          fullWidth
                          disabled={!finalCoursePricing[0]}
                          startIcon={<ShoppingCart className="w-4 h-4" />}
                          sx={{
                            borderColor: routeData ? '#ffb610' : (cartCourses.some(item => item.coursePricingId === finalCoursePricing[0]?.id) ? '#ef4444' : '#ffb66366f110'),
                            color: routeData ? '#ffb610' : (cartCourses.some(item => item.coursePricingId === finalCoursePricing[0]?.id) ? '#ef4444' : '#000'),
                            fontWeight: 'bold',
                            fontSize: { xs: '12px', sm: '13px' },
                            padding: { xs: '8px 12px', sm: '10px 16px' },
                            borderRadius: '10px',
                            textTransform: 'none',
                            borderWidth: '2px',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            '&:hover': {
                              borderColor: routeData ? '#ffb610' : (cartCourses.some(item => item.coursePricingId === finalCoursePricing[0]?.id) ? '#dc2626' : '#6366f1'),
                              backgroundColor: routeData ? 'rgba(255, 182, 16, 0.05)' : (cartCourses.some(item => item.coursePricingId === finalCoursePricing[0]?.id) ? 'rgba(239, 68, 68, 0.05)' : 'rgba(102, 126, 234, 0.05)'),
                              borderWidth: '2px',
                            },
                            '&:disabled': {
                              borderColor: 'rgba(0, 0, 0, 0.12)',
                              color: 'rgba(0, 0, 0, 0.26)',
                            },
                          }}
                        >
                          {cartCourses.some(item => item.coursePricingId === finalCoursePricing[0]?.id) ? 'Remove from Cart' : 'Add to Cart'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Bottom: Description spanning both columns */}
            {course.description && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div
                  className="text-gray-600 text-xs leading-relaxed prose prose-sm max-w-none overflow-y-auto"
                  style={{
                    maxHeight: !isMobile ? '500px' : "",
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    maxWidth: !isMobile ? '400px' : '',
                  }}
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </div>
            )}
          </div>
          {/* Suggested Courses Column (restored full code) */}
          {suggestedCourses.length > 0 && (
            <div className="lg:col-span-3 lg:row-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4 border border-gray-100 lg:h-[calc(100vh-120px)] overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-1 w-10 rounded-full flex-shrink-0 ${routeData
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'
                    }`}></div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Suggested Courses</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4 lg:overflow-y-auto lg:pr-2" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                  {suggestedCourses.map((suggestedCourse) => (
                    <div
                      key={suggestedCourse.id}
                      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border transform hover:-translate-y-1 overflow-hidden flex flex-col ${routeData
                        ? 'border-gray-100 hover:border-amber-300'
                        : 'border-gray-100 hover:border-blue-200'
                        }`}
                    >
                      <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${routeData
                        ? 'from-amber-100 to-yellow-100'
                        : 'from-blue-100 to-purple-100'
                        }`}>
                        <img
                          src={suggestedCourse.logo ? `${Endpoints.mediaBaseUrl}${suggestedCourse.logo}` : '/api/placeholder/400/300'}
                          alt={suggestedCourse.title}
                          className="w-full h-full object-cover block"
                        />
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 min-h-[40px] break-words">
                          {suggestedCourse.title}
                        </h3>
                        {/* <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                            {suggestedCourse.shortDescription}
                          </p> */}
                        <div className="flex items-center gap-2 mb-3">
                          {(() => {
                            const pricing = suggestedCourse.coursePricing?.[0];
                            const price = pricing?.price || 0;
                            const discount = pricing?.discount || 0;
                            const finalPrice = discount > 0 ? price - (price * (discount / 100)) : price;
                            return (
                              <>
                                <span className={`text-base font-bold ${routeData
                                  ? 'text-amber-600'
                                  : 'text-blue-600'
                                  }`}>
                                  ₹{finalPrice.toFixed(2)}
                                </span>
                                {discount > 0 && (
                                  <>
                                    <span className="text-xs text-gray-400 line-through">
                                      ₹{price.toFixed(2)}
                                    </span>
                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                      {discount}% OFF
                                    </span>
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSuggestedCourseAddToCart(suggestedCourse)}
                            className={`flex-1 font-semibold py-2 px-3 text-xs rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md ${cartCourses.some(item => item.id === suggestedCourse.id)
                              ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                              : routeData
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                              }`}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            {cartCourses.some(item => item.id === suggestedCourse.id) ? 'Remove' : 'Add to cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Suggested Course Configuration Dialog */}
      <Dialog
        open={suggestedCourseDialog}
        onClose={handleCloseSuggestedCourseDialog}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
          }
        }}
      >
        {selectedSuggestedCourse && (
          <SuggestedCourseDialog
            addedSuggestCourse={selectedSuggestedCourse}
            suggestedCourseId={selectedSuggestedCourse.id}
            handleClose={handleCloseSuggestedCourseDialog}
            onFinalAmountUpdate={handleFinalAmountUpdate}
            setCartCourses={setCartCourses}
            setFinalAmounts={setFinalAmounts}
            routeData={routeData}
          />
        )}
      </Dialog>

      {/* Course Description Modal */}
      <Dialog
        open={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxHeight: '85vh',
            m: 2,
          }
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Course Description</h3>
            <button
              onClick={() => setIsDescriptionModalOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div
            className="overflow-y-auto overflow-x-hidden pr-2"
          // style={{ maxHeight: 'calc(85vh - 140px)' }}
          >
            <style>{`
              .prose *, .prose p, .prose div, .prose span, .prose li, .prose td, .prose th {
                overflow-wrap: anywhere !important;
                word-break: break-word !important;
                word-wrap: break-word !important;
                white-space: normal !important;
                max-width: 100% !important;
              }
            `}</style>
            <div
              className="prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed"
              style={{
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                maxWidth: '100%'
              }}
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
            <Button
              onClick={() => setIsDescriptionModalOpen(false)}
              variant="contained"
              sx={{
                background: routeData ? '#ffb610' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '10px 24px',
                borderRadius: '10px',
                textTransform: 'none',
                '&:hover': {
                  background: routeData ? '#ffb610' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CourseExplore;
