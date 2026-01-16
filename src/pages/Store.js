import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingCart, Star, Clock, Users, CheckCircle, Filter, X } from 'lucide-react';
import Network from '../context/Network';
import instId from '../context/instituteId';
import { Box, Button, Card, Dialog, DialogActions, DialogContent, Divider, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, Tooltip, Typography, useMediaQuery, Chip, Avatar } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import parse from "html-react-parser";
import SuggestedCourseDialog from './SuggestedCourseDialog';
import DripCourses from './DripCourses';
import Endpoints from '../context/endpoints';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Store = ({ onQuizNavigation, onSidebarToggle, onCourseExplore }) => {

  const FILTER_SELECTION_TYPE = {
    paper: 'multiple',   // checkbox
    product: 'single',   // radio
    batch: 'single',     // radio
    price: 'single',     // radio
  };

  const location = useLocation();
  const navigate = useNavigate();
  // Support both state (from React Router navigation) and query params (from direct URL visits)
  const routeData = location.state?.isMobile || new URLSearchParams(window.location.search).get('isMobile');
  const tokenFromUrl = new URLSearchParams(window.location.search).get('token');
  const isMobile = useMediaQuery("(min-width:600px)");
  const { addPurchase } = useAuth();
  const { customColor, currentTheme } = useTheme();
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [courseExpandedDescriptions, setCourseExpandedDescriptions] = useState(false);
  const [loading, setLoading] = useState(false)
  const [fullDes, setFullDes] = useState('');
  const [cartCourses, setCartCourses] = useState([]);
  const [addedSuggestCourse, setAddedSuggestCourse] = useState({});
  const [suggestedCourseId, setSuggestedCourseId] = useState(null);
  const [suggestedCourseDialog, setSuggestedCourseDialog] = useState(false);
  const [finalAmounts, setFinalAmounts] = useState(0);
  const [finalAmountsss, setFinalAmountsss] = useState(0);
  const [selectedSceduleList, setSelectedSceduleList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [dripCourseList, setDripCourseList] = useState([]);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showAllDripCourses, setShowAllDripCourses] = useState(false);

  // New filter states
  const [domains, setDomains] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null); // Radio button - single selection
  const [selectedExamStage, setSelectedExamStage] = useState(null); // Radio button - single selection
  const [selectedFaculties, setSelectedFaculties] = useState([]); // Checkbox - multiple selection
  const [selectedPapers, setSelectedPapers] = useState([]); // Checkbox - multiple selection
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState(null); // Single selection
  const [productTypes, setProductTypes] = useState([]); // Available product types
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredDripCourses, setFilteredDripCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allDripCourses, setAllDripCourses] = useState([]);
  const [priceSorting, setPriceSorting] = useState(''); // '' | 'low-to-high' | 'high-to-low'
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileFilterTab, setMobileFilterTab] = useState('exam-type'); // 'exam-type' | 'exam-stage' | 'faculty'
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [isProcessingSubmenu, setIsProcessingSubmenu] = useState(false); // Track if we're processing a sidebar submenu selection
  const paperCount = selectedPapers.length;
  const productCount = selectedProductType ? 1 : 0;
  const batchCount = selectedTag ? 1 : 0;
  const priceCount = priceSorting ? 1 : 0;

  // Check if dark mode based on localStorage theme ('logo' = dark, 'default' = light)
  const isDarkMode = currentTheme === 'logo';

  // Get primary color - use custom color from URL if available and isMobile, otherwise use default
  const getPrimaryColor = () => {
    if (routeData && customColor) {
      return customColor;
    }
    return isDarkMode ? '#fbbf24' : '#3b82f6'; // amber for dark mode, blue for light mode
  };

  const primaryColor = getPrimaryColor();

  console.log('isDarkMode', isDarkMode, primaryColor);


  // Convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 37, g: 99, b: 235 };
  };

  const ChevronDownIcon = () => (
    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );


  // Hide layout controls when routeData or token is present
  useEffect(() => {
    if (routeData || tokenFromUrl) {
      sessionStorage.setItem('hideLayoutControls', 'true');
      sessionStorage.setItem('studentToken', tokenFromUrl);
    } else {
      sessionStorage.removeItem('hideLayoutControls');
      sessionStorage.removeItem('studentToken');
    }
    return () => {
      if (!tokenFromUrl) {
        sessionStorage.removeItem('hideLayoutControls');
      }
    };
  }, [routeData, tokenFromUrl]);

  useEffect(() => {

    window.scrollTo(0, 0);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    getAllCourses();
    fetchDomains();
    fetchFaculties();
    fetchTags();
    if (onSidebarToggle) onSidebarToggle(true);

    // Check if coming from faculty click with facultyFilter
    const facultyFilter = location.state?.facultyFilter;
    const selectedDomainFromLevel = location.state?.selectedDomain;
    const selectedExamStageFromLevel = location.state?.selectedExamStage;
    const productTypeFromNavigation = location.state?.productType;
    const fromCoursesTag = location.state?.fromCoursesTag;

    // Check if coming from CourseExplore or if this is a page refresh
    const fromCourseExplore = sessionStorage.getItem('fromCourseExplore');
    const storePageActive = sessionStorage.getItem('storePageActive');

    if (selectedDomainFromLevel && selectedExamStageFromLevel) {
      // Coming from CourseLevels with both parent domain and exam stage
      setSelectedDomain(selectedDomainFromLevel);
      setSelectedExamStage(selectedExamStageFromLevel);
      setFiltersInitialized(true);
    } else if (selectedDomainFromLevel && productTypeFromNavigation) {
      // Coming from VideoLecturePage or BooksPage with domain and product type (lecture or books)
      // The selectedDomain could be either:
      // 1. A submenu item (exam stage) - need to find its parent (exam type)
      // 2. A main domain (exam type) - use it directly

      // Check if selectedDomainFromLevel has a parentId (it's a submenu/exam stage)
      if (selectedDomainFromLevel.parentId && selectedDomainFromLevel.parentId > 0) {
        // It's a submenu item - find its parent domain and set both
        // We'll set these after domains are loaded, via another useEffect
        // Store it temporarily for the next useEffect to process
        sessionStorage.setItem('pendingExamStageSelection', JSON.stringify(selectedDomainFromLevel));
        // Mark that we're processing a submenu selection
        setIsProcessingSubmenu(true);
      } else {
        // It's a main domain (exam type) - use it directly as before
        setSelectedDomain(selectedDomainFromLevel);
        setSelectedExamStage(selectedDomainFromLevel);
      }

      if (productTypeFromNavigation === 'lecture' || productTypeFromNavigation === 'books') {
        setSelectedProductType(productTypeFromNavigation);
      }
      setFiltersInitialized(true);
    } else if (facultyFilter) {
      // Coming from faculty click - set only the selected faculty (but NOT exam stage)
      // Only exam type will be set by default, exam stage will NOT be set
      setFiltersInitialized(true);
    } else if (fromCoursesTag) {
      // Coming from CoursesByTag - set only exam type (but NOT exam stage)
      setFiltersInitialized(true);
    } else if (fromCourseExplore === 'true') {
      // Coming from CourseExplore - restore filters and clear the flag
      const savedFilters = sessionStorage.getItem('storeFilters');
      if (savedFilters) {
        try {
          const filters = JSON.parse(savedFilters);
          if (filters.selectedDomain) setSelectedDomain(filters.selectedDomain);
          if (filters.selectedExamStage) setSelectedExamStage(filters.selectedExamStage);
          if (filters.selectedFaculties !== undefined) setSelectedFaculties(filters.selectedFaculties);
          if (filters.selectedPapers) setSelectedPapers(filters.selectedPapers);
          if (filters.selectedTag) setSelectedTag(filters.selectedTag);
          if (filters.selectedProductType) setSelectedProductType(filters.selectedProductType);
          if (filters.priceSorting !== undefined) setPriceSorting(filters.priceSorting);
          if (filters.searchTerm !== undefined) setSearchTerm(filters.searchTerm);
          setFiltersInitialized(true);
        } catch (error) {
          console.error('Error restoring filters:', error);
        }
      }
      sessionStorage.removeItem('fromCourseExplore');
    } else if (storePageActive === 'true') {
      // Page refresh or browser back/forward - restore filters
      const savedFilters = sessionStorage.getItem('storeFilters');
      if (savedFilters) {
        try {
          const filters = JSON.parse(savedFilters);
          if (filters.selectedDomain) setSelectedDomain(filters.selectedDomain);
          if (filters.selectedExamStage) setSelectedExamStage(filters.selectedExamStage);
          if (filters.selectedFaculties !== undefined) setSelectedFaculties(filters.selectedFaculties);
          if (filters.selectedPapers) setSelectedPapers(filters.selectedPapers);
          if (filters.selectedTag) setSelectedTag(filters.selectedTag);
          if (filters.selectedProductType) setSelectedProductType(filters.selectedProductType);
          if (filters.priceSorting !== undefined) setPriceSorting(filters.priceSorting);
          if (filters.searchTerm !== undefined) setSearchTerm(filters.searchTerm);
          setFiltersInitialized(true);
        } catch (error) {
          console.error('Error restoring filters:', error);
        }
      }
    } else {
      // Coming from other routes (Home, Gallery, etc.) - clear filters and reset to defaults
      sessionStorage.removeItem('storeFilters');
    }

    // Mark that Store page is now active
    sessionStorage.setItem('storePageActive', 'true');

    // Cleanup on unmount
    return () => {
      // Clear storePageActive when leaving Store (unless going to CourseExplore)
      // The flag will be set again by handlePurchaseCourse if navigating to CourseExplore
      const isGoingToCourseExplore = sessionStorage.getItem('fromCourseExplore');
      if (isGoingToCourseExplore !== 'true') {
        sessionStorage.removeItem('storePageActive');
        sessionStorage.removeItem('storeFilters');
      }
    };

  }, [])

  // Handle pending exam stage selection (when coming from sidebar submenu)
  useEffect(() => {
    const pendingStage = sessionStorage.getItem('pendingExamStageSelection');

    if (pendingStage && isProcessingSubmenu && domains.length > 0) {
      try {
        const examStage = JSON.parse(pendingStage);
        // Find the parent domain of this exam stage
        const parentDomain = domains.find(d => d.id === examStage.parentId);
        if (parentDomain) {
          setSelectedDomain(parentDomain);
          setSelectedExamStage(examStage);
        }
        // Clear the pending selection
        sessionStorage.removeItem('pendingExamStageSelection');
      } catch (error) {
        console.error('Error processing pending exam stage:', error);
        sessionStorage.removeItem('pendingExamStageSelection');
      }
    }
  }, [domains, isProcessingSubmenu]);

  // Set default selections when data is loaded
  useEffect(() => {
    const facultyFilter = location.state?.facultyFilter;
    const fromCoursesTag = location.state?.fromCoursesTag;

    // Skip default selection if we're processing a submenu selection
    if (isProcessingSubmenu) {
      return;
    }

    if (domains.length > 0 && !selectedDomain) {
      // Select first exam type by default
      const firstDomain = domains.find(d => d.parentId === 0);
      if (firstDomain) {
        setSelectedDomain(firstDomain);

        // Only select first exam stage by default if NOT coming from CoursesByTag or Faculty
        if (!fromCoursesTag && !facultyFilter && firstDomain.child && firstDomain.child.length > 0) {
          setSelectedExamStage(firstDomain.child[0]);
        }
      }
    }
  }, [domains, location.state, isProcessingSubmenu]);

  // Auto-select exam stage based on selected domain (when coming from VideoLecturePage)
  useEffect(() => {
    const facultyFilter = location.state?.facultyFilter;
    const fromCoursesTag = location.state?.fromCoursesTag;

    // Skip auto-selection if coming from CoursesByTag or Faculty
    if ((facultyFilter || fromCoursesTag) && selectedExamStage) {
      return;
    }

    // Skip auto-selection if we're processing a submenu selection (it was already set by pending handler)
    if (isProcessingSubmenu && selectedExamStage) {
      // Clear the flag now that exam stage is set
      setIsProcessingSubmenu(false);
      return;
    }

    if (selectedDomain && !selectedExamStage && domains.length > 0) {
      // Find the parent domain to get its children (exam stages)
      const parentDomain = domains.find(d => d.id === selectedDomain.parentId);
      if (parentDomain && parentDomain.child && parentDomain.child.length > 0) {
        // Find the matching exam stage in the parent's children
        const matchingStage = parentDomain.child.find(c => c.id === selectedDomain.id);
        if (matchingStage) {
          setSelectedExamStage(matchingStage);
        } else {
          // Set the first exam stage from the parent's children
          setSelectedExamStage(parentDomain.child[0]);
        }
      }
    }
  }, [selectedDomain, domains, location.state, isProcessingSubmenu, selectedExamStage]);

  // Select all faculties by default or specific faculty if coming from faculty click
  useEffect(() => {
    const facultyFilter = location.state?.facultyFilter;

    if (facultyFilter && faculties.length > 0) {
      // Coming from faculty click - select only the specific faculty
      const matchingFaculty = faculties.find(f => f.id === facultyFilter.id);
      if (matchingFaculty) {
        setSelectedFaculties([matchingFaculty]);
      }
    } else if (faculties.length > 0 && selectedFaculties.length === 0 && !filtersInitialized) {
      // Default behavior - select all faculties
      setSelectedFaculties(faculties);
    }
  }, [faculties, filtersInitialized, location.state]);

  // Select 'lecture' product type by default
  // useEffect(() => {
  //   if (productTypes.length > 0 && !selectedProductType) {
  //     const lectureType = productTypes.find(type => type.toLowerCase() === 'lecture');
  //     if (lectureType) {
  //       setSelectedProductType(lectureType);
  //     }
  //   }
  // }, [productTypes]);


  const FilterOption = ({ label, selected, onClick, theme }) => {
    return (
      <label
        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs
        ${selected ? theme.activeBg : 'hover:bg-gray-100'}
      `}
      >
        <span className="truncate">{label}</span>

        <input
          type="radio"
          checked={selected}
          onChange={onClick}
          className="accent-current ml-3 scale-125" // 👈 increase size
        />
      </label>
    );
  };


  // Fetch domains
  const fetchDomains = async () => {
    try {
      const response = await fetch(`${Endpoints.baseURL}domain/fetch-public?instId=${instId}`);
      const data = await response.json();
      if (data.status && data.domains) {
        setDomains(data.domains);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  // Fetch faculties
  const fetchFaculties = async () => {
    try {
      const response = await fetch(`${Endpoints.baseURL}admin/employee/fetch-public-employee/${instId}`);
      const data = await response.json();
      if (data.status && data.employees) {
        setFaculties(data.employees);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  // Fetch tags
  const fetchTags = async () => {
    try {
      const data = await Network.fetchTags(instId);
      if (data.status && data.tags) {
        let newList = data.tags.filter(tag => tag.availablePublic === true);
        setTags(newList);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  // Filter courses based on selected filters
  useEffect(() => {
    filterCourses();

    // Save current filter state whenever filters change (but only if we have data loaded)
    if (domains.length > 0 || faculties.length > 0) {
      const filterState = {
        selectedDomain,
        selectedExamStage,
        selectedFaculties,
        selectedPapers,
        selectedTag,
        selectedProductType,
        priceSorting,
        searchTerm
      };
      sessionStorage.setItem('storeFilters', JSON.stringify(filterState));
    }
  }, [selectedDomain, selectedExamStage, selectedFaculties, selectedPapers, selectedTag, selectedProductType, priceSorting, searchTerm, allCourses, allDripCourses]);

  const filterCourses = () => {
    let filtered = [...allCourses];
    let filteredDrip = [...allDripCourses];

    // Helper function to get all child domain IDs recursively
    const getAllChildIds = (domainId) => {
      const ids = [domainId];
      const findChildren = (id) => {
        domains.forEach(d => {
          if (d.parentId === id) {
            ids.push(d.id);
            findChildren(d.id);
          }
        });
      };
      findChildren(domainId);
      return ids;
    };

    // Filter by domain (first level - exam type)
    if (selectedDomain) {
      const domainIds = getAllChildIds(selectedDomain.id);
      filtered = filtered.filter(course =>
        course.domain && course.domain.some(d => domainIds.includes(d.id))
      );
      filteredDrip = filteredDrip.filter(course =>
        course.domain && course.domain.some(d => domainIds.includes(d.id))
      );
    }

    // Filter by exam stage (second level)
    if (selectedExamStage) {
      const stageIds = getAllChildIds(selectedExamStage.id);
      filtered = filtered.filter(course =>
        course.domain && course.domain.some(d => stageIds.includes(d.id))
      );
      filteredDrip = filteredDrip.filter(course =>
        course.domain && course.domain.some(d => stageIds.includes(d.id))
      );
    }

    // Filter by papers (third level and beyond - multiple selection)
    if (selectedPapers.length > 0) {
      const paperIds = [];
      selectedPapers.forEach(paper => {
        paperIds.push(...getAllChildIds(paper.id));
      });
      filtered = filtered.filter(course =>
        course.domain && course.domain.some(d => paperIds.includes(d.id))
      );
      filteredDrip = filteredDrip.filter(course =>
        course.domain && course.domain.some(d => paperIds.includes(d.id))
      );
    }

    // Filter by faculties (multiple selection)
    if (selectedFaculties.length > 0) {
      // Collect all courseIds from selected faculties
      const allowedCourseIds = new Set();
      selectedFaculties.forEach(faculty => {
        if (faculty.courseIds && Array.isArray(faculty.courseIds)) {
          faculty.courseIds.forEach(courseId => allowedCourseIds.add(courseId));
        }
      });

      // Filter courses that are in the faculty's courseIds array
      filtered = filtered.filter(course =>
        allowedCourseIds.has(course.id)
      );
      filteredDrip = filteredDrip.filter(course =>
        allowedCourseIds.has(course.id)
      );
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(course =>
        course.tags && course.tags.some(t => t.id === selectedTag.id)
      );
      filteredDrip = filteredDrip.filter(course =>
        course.tags && course.tags.some(t => t.id === selectedTag.id)
      );
    }

    // Filter by product type (single selection)
    if (selectedProductType) {
      filtered = filtered.filter(course =>
        course.type && course.type === selectedProductType
      );
      filteredDrip = filteredDrip.filter(course =>
        course.type && course.type === selectedProductType
      );
    }

    // Filter by search term (course title)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title && course.title.toLowerCase().includes(searchLower)
      );
      filteredDrip = filteredDrip.filter(course =>
        course.title && course.title.toLowerCase().includes(searchLower)
      );
    }

    // Sort by price
    const sortByPrice = (courses) => {
      if (!priceSorting) return courses;

      return [...courses].sort((a, b) => {
        const getPriceA = () => {
          if (a.coursePricing && a.coursePricing.length > 0) {
            return Math.min(...a.coursePricing.map(p => {
              const price = p.discount && p.discount > 0
                ? p.price - (p.price * (p.discount / 100))
                : p.price;
              return price;
            }));
          }
          return 0;
        };

        const getPriceB = () => {
          if (b.coursePricing && b.coursePricing.length > 0) {
            return Math.min(...b.coursePricing.map(p => {
              const price = p.discount && p.discount > 0
                ? p.price - (p.price * (p.discount / 100))
                : p.price;
              return price;
            }));
          }
          return 0;
        };

        const priceA = getPriceA();
        const priceB = getPriceB();

        return priceSorting === 'low-to-high' ? priceA - priceB : priceB - priceA;
      });
    };

    filtered = sortByPrice(filtered);
    filteredDrip = sortByPrice(filteredDrip);

    setFilteredCourses(filtered);
    setFilteredDripCourses(filteredDrip);
  };

  const clearAllFilters = () => {
    // Reset to first domain and exam stage
    const firstDomain = domains.find(d => d.parentId === 0);
    if (firstDomain) {
      setSelectedDomain(firstDomain);
      // if (firstDomain.child && firstDomain.child.length > 0) {
      //   setSelectedExamStage(firstDomain.child[0]);
      // }
      setSelectedExamStage(null);
      setSelectedFaculties([])
    } else {
      setSelectedDomain(null);
      setSelectedExamStage(null);
    }

    // Reset to all faculties
    // setSelectedFaculties(faculties);
    setSelectedPapers([]);
    setSelectedTag(null);
    setSelectedProductType(null);
    setPriceSorting('');
    setSearchTerm('');
  };

  // Load cart from localStorage on mount and listen for updates
  useEffect(() => {
    const loadCart = () => {
      const cartData = localStorage.getItem('cartCourses');
      if (cartData) {
        try {
          const cart = JSON.parse(cartData);
          // Filter for regular courses only (items without plan property)
          const regularCartItems = Array.isArray(cart) ? cart.filter(item => !item.plan) : [];
          setCartCourses(regularCartItems);
        } catch (error) {
          console.error('Error loading cart:', error);
          setCartCourses([]);
        }
      }
    };

    // Load cart on mount
    loadCart();

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('storage', handleCartUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleCartUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [])

  const getAllCourses = async () => {
    try {
      setLoading(true);
      const response = await Network.getFreeCourseList(instId);
      const activeCourses = (response?.courses || []).filter(c => c.active === true && c.paid === true);

      const dripCourses = [];
      const normalCourses = [];

      const schedulePromises = activeCourses.map(async (course) => {
        const scheduleResponse = await getMergedSchedules(course.id, 0);
        const hasDrip = Array.isArray(scheduleResponse?.contentList)
          ? scheduleResponse.contentList.some(item => item.drip === true)
          : false;

        return { course, hasDrip };
      });

      const results = await Promise.allSettled(schedulePromises);

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.hasDrip) dripCourses.push(result.value.course);
          else normalCourses.push(result.value.course);
        }
      });

      setDripCourseList(dripCourses);
      setCourseList(normalCourses);
      setAllCourses(normalCourses);
      setAllDripCourses(dripCourses);
      setFilteredCourses(normalCourses);
      setFilteredDripCourses(dripCourses);

      // Extract unique product types from all courses
      const allCoursesForTypes = [...normalCourses, ...dripCourses];
      const uniqueTypes = [...new Set(allCoursesForTypes.map(course => course.type).filter(Boolean))];
      setProductTypes(uniqueTypes);
    } catch (error) {
      console.error("Error in getAllCourses:", error);
    } finally {
      setLoading(false);
    }
  };


  const handlePurchase = (item) => {
    addPurchase(item);
    setPurchaseSuccess(item.title);
    setTimeout(() => {
      setPurchaseSuccess(null);
    }, 3000);
  };

  const truncateDescription = (description) => {
    // Replace &nbsp; and other HTML entities with plain text equivalents
    const decodedDescription = description
      ?.replace(/&nbsp;/g, ' ')
      ?.replace(/&amp;/g, '&') // Example for handling other entities, can add more if needed
      ?.replace(/&lt;/g, '<')
      ?.replace(/&gt;/g, '>')
      ?.replace(/&quot;/g, '"')
      ?.replace(/&#39;/g, "'");

    // Strip any remaining HTML tags
    const strippedDescription = decodedDescription
      ?.replace(/<[^>]*>/g, ' ') // Remove HTML tags
      ?.split(/\s+/)
      ?.slice(0, 10) // Get first 10 words
      ?.join(' ');

    return strippedDescription;
  };
  const toggleExpandDescription = (des) => {
    setFullDes(des)
    setCourseExpandedDescriptions(true);
  };

  const getMergedSchedules = async (courseId, folderId = 0) => {
    try {

      let response = await Network.fetchFreePublicScheduleApi(courseId, folderId);
      return response
    } catch (error) {
      console.log(error);

    }
  };

  const handlePurchaseCourse = (course) => {
    if (onCourseExplore) {
      // Save current filter state before navigating
      const filterState = {
        selectedDomain,
        selectedExamStage,
        selectedFaculties,
        selectedPapers,
        selectedTag,
        selectedProductType,
        priceSorting,
        searchTerm
      };
      sessionStorage.setItem('storeFilters', JSON.stringify(filterState));
      sessionStorage.setItem('fromCourseExplore', 'true'); // Flag to track navigation source
      sessionStorage.setItem('storePageActive', 'true'); // Mark that Store page is still active in session

      // Pass URL parameters when navigating to course explore
      if (routeData || tokenFromUrl) {
        let queryParams = [];
        if (routeData) queryParams.push(`isMobile=${routeData}`);
        if (tokenFromUrl) queryParams.push(`token=${tokenFromUrl}`);

        // Save course data to sessionStorage before navigating
        sessionStorage.setItem('currentCourse', JSON.stringify(course));
        sessionStorage.setItem('allCourses', JSON.stringify(courseList));

        // Navigate directly with parameters
        navigate(`/course-explore?${queryParams.join('&')}`);
      } else {
        // Default behavior without parameters
        onCourseExplore(course, courseList);
      }
    }
  }

  const handleAddtoCart = async (course) => {
    try {
      const isAlreadyAdded = cartCourses.some(item => item.id === course.id);

      if (isAlreadyAdded) {
        // Remove from cart directly without opening dialog
        const updatedCart = cartCourses.filter(item => item.id !== course.id);
        setCartCourses(updatedCart);

        // Update localStorage and dispatch event
        localStorage.setItem("cartCourses", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        // Add to cart - open suggested course dialog
        setAddedSuggestCourse(course);
        setSuggestedCourseId(course.id);
        setSuggestedCourseDialog(true);
      }
    } catch (error) {
      console.error("Error in handleAddtoCart:", error);
    }
  };


  const handleCloseSuggestedCourseDialog = () => {
    setSuggestedCourseDialog(false);
  };

  const handleFinalAmountUpdate = (amount) => {
    setFinalAmountsss(amount);
  };

  const handleShowCart = () => {
    if (routeData || tokenFromUrl) {
      let queryParams = [];
      if (routeData) queryParams.push(`isMobile=${routeData}`);
      if (tokenFromUrl) queryParams.push(`token=${tokenFromUrl}`);
      navigate(`/cart?${queryParams.join('&')}`);
    } else {
      onQuizNavigation && onQuizNavigation('cart');
    }
  }

  // Get exam stages based on selected domain (only if selected domain has children)
  const getExamStages = () => {
    // If a domain is selected and it has children, return its children as exam stages
    if (selectedDomain && selectedDomain.child && selectedDomain.child.length > 0) {
      return selectedDomain.child;
    }
    // Otherwise return empty array (no exam stages to show)
    return [];
  };

  // Get all papers (all remaining children recursively from selected exam stage only)
  const getPapers = () => {
    const papers = [];
    const collectPapers = (domain) => {
      if (domain.child && domain.child.length > 0) {
        domain.child.forEach(child => {
          papers.push(child);
          collectPapers(child);
        });
      }
    };

    // Collect papers only from selected exam stage
    if (selectedExamStage) {
      collectPapers(selectedExamStage);
    }

    return papers;
  };

  // Toggle faculty selection
  const toggleFaculty = (faculty) => {
    setSelectedFaculties(prev => {
      const exists = prev.find(f => f.id === faculty.id);
      if (exists) {
        return prev.filter(f => f.id !== faculty.id);
      } else {
        return [...prev, faculty];
      }
    });
  };

  // Toggle paper selection
  // const togglePaper = (paper) => {
  //   setSelectedPapers(prev => {
  //     const exists = prev.find(p => p.id === paper.id);
  //     if (exists) {
  //       return prev.filter(p => p.id !== paper.id);
  //     } else {
  //       return [...prev, paper];
  //     }
  //   });
  // };

  const togglePaper = (paper) => {
    setSelectedPapers(prev => {
      const exists = prev.some(p => p.id === paper.id);

      if (exists) {
        // ❌ REMOVE (deselect)
        return prev.filter(p => p.id !== paper.id);
      }

      // ✅ ADD (select)
      return [...prev, paper];
    });
  };


  //  useEffect(() => {
  //     if (selectCourse) {
  //         const filterCourseTags = course.filter(item => {
  //             const tagslists = item.tags || [];
  //             if (tagslists.some(tag => tag.id === selectCourse?.setting?.checkoutTag)) {
  //                 return item
  //             }
  //         });

  //         setSuggestedCourse(filterCourseTags);
  //     }
  // }, [selectCourse, course])


  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30">
      {/* Main Store Content */}
      {/* Header Section - Fixed on mobile only */}
      <div className={`lg:relative lg:z-auto fixed top-15 left-0 right-0 z-30 lg:bg-gradient-to-br lg:from-white lg:via-blue-50/30 lg:to-indigo-50/30 lg:border-0 border-b lg:shadow-none shadow-sm ${routeData && !isMobile
        ? 'bg-amber-50 border-amber-200'
        : !routeData && !isMobile ? 'bg-blue-50 border-blue-200' : ''
        }`}>
        <div className="max-w-[1800px] mx-auto px-2 py-4 md:px-3 md:py-2">
          {/* Header Section - Course Store Title + Sort, Search, Cart */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-1">
            {/* Left: Title */}
            {
              !routeData && (
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <ShoppingCart className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm md:text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Course Store
                    </h1>
                    <p className="text-[9px] text-gray-600 hidden md:block">Explore our premium courses</p>
                  </div>
                </div>
              )
            }
            {/* Right: Sort, Search, Cart in a row */}
            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-lg shadow-sm border transition-all mb-2"
                style={{
                  backgroundColor: 'white',
                  borderColor: primaryColor,
                  color: primaryColor
                }}
              >
                <Filter className="h-3.5 w-3.5" />
                <span className="text-xs">Filters</span>
                {(selectedPapers.length > 0 || selectedTag || selectedProductType || priceSorting) && (
                  <span className="text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    {selectedPapers.length + (selectedTag ? 1 : 0) + (selectedProductType ? 1 : 0) + (priceSorting ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Search Bar */}
              <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 py-1.5 border border-gray-200 min-w-[200px] flex-1 lg:flex-initial" style={{ marginBottom: !isMobile ? '8px' : '0px' }}>
                <div className="flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 text-xs text-gray-700 placeholder-gray-400 border-none outline-none bg-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="flex-shrink-0 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Top Filters - Only Show When routeData Exists (Mobile Only) */}
          {routeData && (
            <div
              className="lg:hidden px-3 py-1.5 overflow-x-auto whitespace-nowrap"
              style={{
                WebkitOverflowScrolling: 'touch',
                backgroundColor: `rgb(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.05)`,
                borderColor: primaryColor
              }}
            >
              <div className="flex items-center gap-2 flex-nowrap w-max">
                {/* Exam Type Filter Pill */}
                <button
                  onClick={() => {
                    setMobileFilterTab('exam-type');
                    setMobileFiltersOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0"
                  style={{
                    borderColor: selectedDomain ? primaryColor : '#d1d5db',
                    backgroundColor: selectedDomain ? `rgb(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.05)` : '#f9fafb',
                    color: selectedDomain ? primaryColor : '#374151'
                  }}
                >
                  {selectedDomain && (
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-white font-bold text-[7px]" style={{ backgroundColor: primaryColor }}>
                      1
                    </span>
                  )}
                  Exam Type
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Exam Stage Filter Pill */}
                <button
                  onClick={() => {
                    setMobileFilterTab('exam-stage');
                    setMobileFiltersOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0"
                  style={{
                    borderColor: selectedExamStage ? primaryColor : '#d1d5db',
                    backgroundColor: selectedExamStage ? `rgb(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.05)` : '#f9fafb',
                    color: selectedExamStage ? primaryColor : '#374151'
                  }}
                >
                  {selectedExamStage && (
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-white font-bold text-[7px]" style={{ backgroundColor: primaryColor }}>
                      1
                    </span>
                  )}
                  Exam Stage
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Faculty Filter Pill */}
                <button
                  onClick={() => {
                    setMobileFilterTab('faculty');
                    setMobileFiltersOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0"
                  style={{
                    borderColor: selectedFaculties.length > 0 ? primaryColor : '#d1d5db',
                    backgroundColor: selectedFaculties.length > 0 ? `rgb(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.05)` : '#f9fafb',
                    color: selectedFaculties.length > 0 ? primaryColor : '#374151'
                  }}
                >
                  {selectedFaculties.length > 0 && (
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-white font-bold text-[7px]" style={{ backgroundColor: primaryColor }}>
                      {selectedFaculties.length}
                    </span>
                  )}
                  Faculty
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setMobileFilterTab('paper');
                    setMobileFiltersOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0"
                  style={{
                    borderColor: paperCount > 0 ? primaryColor : '#d1d5db',
                    backgroundColor: paperCount > 0 ? `rgb(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.05)` : '#f9fafb',
                    color: paperCount > 0 ? primaryColor : '#374151'
                  }}
                >
                  {paperCount > 0 && (
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-white font-bold text-[7px]" style={{ backgroundColor: primaryColor }}>
                      {paperCount}
                    </span>
                  )}
                  Paper
                  <ChevronDownIcon />
                </button>


                <button
                  onClick={() => {
                    setMobileFilterTab('product');
                    setMobileFiltersOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0"
                  style={{
                    borderColor: productCount ? primaryColor : '#d1d5db',
                    backgroundColor: productCount ? `rgb(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.05)` : '#f9fafb',
                    color: productCount ? primaryColor : '#374151'
                  }}
                >
                  {productCount > 0 && (
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-white font-bold text-[7px]" style={{ backgroundColor: primaryColor }}>
                      1
                    </span>
                  )}
                  Product
                  <ChevronDownIcon />
                </button>
                <button
                  onClick={() => {
                    setMobileFilterTab('batch'); // same tab as product
                    setMobileFiltersOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0"
                  style={{
                    borderColor: batchCount ? primaryColor : '#d1d5db',
                    backgroundColor: batchCount ? `rgb(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.05)` : '#f9fafb',
                    color: batchCount ? primaryColor : '#374151'
                  }}
                >
                  {batchCount > 0 && (
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-white font-bold text-[7px]" style={{ backgroundColor: primaryColor }}>
                      1
                    </span>
                  )}
                  Batch
                  <ChevronDownIcon />
                </button>
                <button
                  onClick={() => {
                    setMobileFilterTab('price');
                    setMobileFiltersOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0"
                  style={{
                    borderColor: priceCount ? primaryColor : '#d1d5db',
                    backgroundColor: priceCount ? `rgb(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.05)` : '#f9fafb',
                    color: priceCount ? primaryColor : '#374151'
                  }}
                >
                  {priceCount > 0 && (
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-white font-bold text-[7px]" style={{ backgroundColor: primaryColor }}>
                      1
                    </span>
                  )}
                  Price
                  <ChevronDownIcon />
                </button>

                {/* Reset Button - Shows when filters are selected */}
                {(selectedDomain || selectedExamStage || selectedFaculties.length > 0 || selectedPapers.length > 0 || selectedTag || selectedProductType || priceSorting) && (
                  <button
                    onClick={() => {
                      setSelectedDomain(null);
                      setSelectedExamStage(null);
                      setSelectedFaculties([]);
                      setSelectedPapers([]);
                      setSelectedTag(null);
                      setSelectedProductType(null);
                      setPriceSorting('');
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0 ml-1 ${routeData
                      ? 'border-red-500 bg-red-50 text-red-500 hover:bg-red-100'
                      : 'border-red-500 bg-red-50 text-red-500 hover:bg-red-100'
                      }`}
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reset
                  </button>
                )}

              </div>
            </div>
          )}

          {/* View Cart Button */}
          {routeData && cartCourses?.length > 0 && (
            <div className="bg-white px-3 py-2">
              <Button
                onClick={handleShowCart}
                variant="contained"
                startIcon={<ShoppingCart className="h-3.5 w-3.5" />}
                fullWidth={!isMobile}
                sx={{
                  background: primaryColor,
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: `0 2px 8px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.2)`,
                  whiteSpace: 'nowrap',
                  width: !isMobile ? '100%' : 'auto',
                  '&:hover': {
                    background: primaryColor,
                    boxShadow: `0 4px 12px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.3)`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                View Cart ({cartCourses.length})
              </Button>
            </div>
          )}
          {/* View Cart Button - Desktop */}
          {!routeData && cartCourses?.length > 0 && (
            <Button
              onClick={handleShowCart}
              variant="contained"
              startIcon={<ShoppingCart className="h-3.5 w-3.5" />}
              fullWidth={!isMobile}
              sx={{
                background: primaryColor,
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '11px',
                padding: '8px 14px',
                borderRadius: '8px',
                textTransform: 'none',
                width: !isMobile ? '100%' : 'auto',
                boxShadow: `0 2px 8px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.2)`,
                whiteSpace: 'nowrap',
                '&:hover': {
                  background: primaryColor,
                  boxShadow: `0 4px 12px 0 rgba(${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}, 0.3)`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              View Cart ({cartCourses.length})
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - padding top only on mobile */}
      <div className="lg:pt-0" style={{ paddingTop: !isMobile && routeData ? cartCourses?.length === 0 ? "7.5rem" : "11rem" : isMobile && routeData ? "1rem" : !isMobile && !routeData ? "8.5rem" : "1rem" }}>
        <div className="max-w-[1800px] mx-auto px-4 md:px-4">
          {/* Main Layout - Sidebar + Content */}
          <div className="flex flex-col lg:flex-row gap-3">

            {/* Left Sidebar - Filters (Desktop Only) */}
            <div className="hidden lg:block w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                {(selectedPapers.length > 0 || selectedTag || selectedProductType || priceSorting || searchTerm) && (
                  <div className="mb-2 pb-2 border-b border-gray-200">
                    <Button
                      onClick={clearAllFilters}
                      size="small"
                      fullWidth
                      startIcon={<X className="h-3 w-3" />}
                      sx={{
                        color: '#ef4444',
                        borderColor: '#ef4444',
                        fontSize: '11px',
                        padding: '6px 12px',
                        '&:hover': {
                          borderColor: '#dc2626',
                          backgroundColor: '#fee2e2',
                        },
                      }}
                      variant="outlined"
                    >
                      Clear All
                    </Button>
                  </div>
                )}

                {/* Exam Type Filter - Radio */}
                <div className="mb-3">
                  <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Filter className="h-3 w-3 text-blue-500" />
                    Exam Type
                  </h3>
                  <div className="space-y-1">
                    {domains.filter(d => d.parentId === 0).map(domain => (
                      <div
                        key={domain.id}
                        onClick={() => {
                          // Don't allow deselection, only switching between exam types
                          if (selectedDomain?.id !== domain.id) {
                            setSelectedDomain(domain);
                          }
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md text-xs transition-all cursor-pointer flex items-center gap-2 hover:bg-gray-50 group"
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedDomain?.id === domain.id
                          ? 'border-blue-500 bg-blue-500 shadow-sm'
                          : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                          {selectedDomain?.id === domain.id && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className={`font-medium transition-colors ${selectedDomain?.id === domain.id
                          ? 'text-gray-900'
                          : 'text-gray-600 group-hover:text-gray-900'
                          }`}>{domain.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exam Stage Filter - Radio */}
                {getExamStages().length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Exam Stage</h3>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {getExamStages().map(stage => (
                        <div
                          key={stage.id}
                          onClick={() => {
                            setSelectedExamStage(selectedExamStage?.id === stage.id ? null : stage);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-md text-xs transition-all cursor-pointer flex items-center gap-2 hover:bg-gray-50 group"
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedExamStage?.id === stage.id
                            ? 'border-blue-500 bg-blue-500 shadow-sm'
                            : 'border-gray-300 group-hover:border-blue-400'
                            }`}>
                            {selectedExamStage?.id === stage.id && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className={`font-medium transition-colors ${selectedExamStage?.id === stage.id
                            ? 'text-gray-900'
                            : 'text-gray-600 group-hover:text-gray-900'
                            }`}>{stage.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Faculty Filter - Checkbox */}
                {faculties.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Faculty</h3>
                    <div className="space-y-1 overflow-y-auto">
                      {/* Select All / Deselect All */}
                      <div
                        onClick={() => {
                          if (selectedFaculties.length === faculties.length) {
                            setSelectedFaculties([]);
                          } else {
                            setSelectedFaculties([...faculties]);
                          }
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md text-xs transition-all cursor-pointer flex items-center gap-2 hover:bg-blue-50 group border-b border-gray-100 pb-1.5 mb-1"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedFaculties.length === faculties.length
                          ? 'border-blue-500 bg-blue-500 shadow-sm'
                          : selectedFaculties.length > 0
                            ? 'border-blue-500 bg-blue-500 shadow-sm'
                            : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                          {selectedFaculties.length === faculties.length ? (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : selectedFaculties.length > 0 ? (
                            <div className="w-2 h-0.5 bg-white rounded"></div>
                          ) : null}
                        </div>
                        <span className="font-semibold text-gray-700 group-hover:text-gray-900">
                          {selectedFaculties.length === faculties.length ? 'Deselect All' : 'Select All'}
                        </span>
                      </div>

                      {faculties.map(faculty => {
                        const isSelected = selectedFaculties.some(f => f.id === faculty.id);
                        return (
                          <div
                            key={faculty.id}
                            onClick={() => toggleFaculty(faculty)}
                            className="w-full text-left px-2 py-1.5 rounded-md text-xs transition-all cursor-pointer flex items-center gap-2 hover:bg-gray-50 group"
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isSelected
                              ? 'border-blue-500 bg-blue-500 shadow-sm'
                              : 'border-gray-300 group-hover:border-blue-400'
                              }`}>
                              {isSelected && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <Avatar
                              src={faculty.profile ? `${Endpoints.mediaBaseUrl}${faculty.profile}` : ''}
                              sx={{ width: 20, height: 20, fontSize: '10px' }}
                            >
                              {faculty.firstName?.charAt(0)}
                            </Avatar>
                            <span className={`truncate flex-1 font-medium transition-colors ${isSelected
                              ? 'text-gray-900'
                              : 'text-gray-600 group-hover:text-gray-900'
                              }`}>{faculty.firstName} {faculty.lastName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0">

              {/* Filters Section - Paper-wise, Product Type, Batch Tag - Desktop Only */}
              <div className="w-full hidden lg:block bg-white rounded-xl shadow-sm p-2.5 border border-gray-100 mb-2.5 ">
                {/* Paper-wise Filter */}
                {getPapers().length > 0 && (
                  <div className="mb-1.5">
                    <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Paper-wise</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        const papers = getPapers();

                        // Sort papers in specific sequence: Both Group, Group 1, Group 2, then others
                        const sortedPapers = [...papers].sort((a, b) => {
                          const nameA = a.name.toLowerCase().trim();
                          const nameB = b.name.toLowerCase().trim();

                          // Define priority order
                          const getPriority = (name) => {
                            if (name === 'both group') return 1;
                            if (name === 'group 1') return 2;
                            if (name === 'group 2') return 3;
                            return 4; // All others
                          };

                          const priorityA = getPriority(nameA);
                          const priorityB = getPriority(nameB);

                          // If priorities are different, sort by priority
                          if (priorityA !== priorityB) {
                            return priorityA - priorityB;
                          }

                          // If both have same priority (both are "others"), sort alphabetically
                          return nameA.localeCompare(nameB);
                        });

                        return (
                          <>
                            {sortedPapers.map(paper => {
                              const isSelected = selectedPapers.some(p => p.id === paper.id);
                              return (
                                <div key={paper.id} className="relative inline-block">
                                  <Button
                                    variant={isSelected ? "contained" : "outlined"}
                                    size="small"
                                    onClick={() => togglePaper(paper)}
                                    sx={{
                                      textTransform: "none",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      borderRadius: "16px",
                                      padding: "4px 14px",
                                      minHeight: "28px",
                                      background: isSelected
                                        ? "#ffb610"
                                        : "transparent",
                                      borderColor: isSelected ? "transparent" : routeData ? "#ffd666" : "rgba(102, 126, 234, 0.3)",
                                      color: isSelected ? "#fff" : routeData ? "#ffb610" : "#667eea",
                                      boxShadow: isSelected
                                        ? routeData ? '0 2px 8px 0 rgba(255, 182, 16, 0.4)' : '0 2px 8px 0 rgba(102, 126, 234, 0.4)'
                                        : 'none',
                                      transition: 'all 0.3s ease',
                                      paddingRight: isSelected ? "26px" : "14px",
                                      '&:hover': {
                                        background: isSelected
                                          ? "#ffb610"
                                          : routeData ? "rgba(255, 182, 16, 0.1)" : "rgba(102, 126, 234, 0.1)",
                                        borderColor: isSelected ? "transparent" : routeData ? "#ffd666" : "#667eea",
                                        transform: 'translateY(-1px)',
                                        boxShadow: routeData ? '0 4px 12px 0 rgba(255, 182, 16, 0.3)' : '0 4px 12px 0 rgba(102, 126, 234, 0.3)',
                                      },
                                    }}
                                  >
                                    {paper.name}
                                  </Button>
                                  {isSelected && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePaper(paper);
                                      }}
                                      className="absolute -top-0.5 -right-0.5 bg-white border border-red-400 rounded-full w-4 h-4 flex items-center justify-center shadow-sm hover:bg-red-50 hover:border-red-600 transition-all z-10"
                                    >
                                      <X className="h-2.5 w-2.5 text-red-500" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
                {getPapers().length > 0 && (productTypes.length > 0 || tags.length > 0) && (
                  <Divider sx={{ my: 2 }} />
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {/* Product Type Filter */}
                  {productTypes.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Product Type</h3>
                      <FormControl fullWidth size="small">
                        <Select
                          value={selectedProductType || ''}
                          onChange={(e) => setSelectedProductType(e.target.value || null)}
                          displayEmpty
                          MenuProps={{
                            disableScrollLock: true,
                            PaperProps: {
                              style: {
                                maxHeight: 200,
                              },
                            },
                          }}
                          sx={{
                            borderRadius: '8px',
                            fontSize: '11px',
                            height: '32px',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: selectedProductType ? '#3b82f6' : '#e5e7eb',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#3b82f6',
                            },
                          }}
                        >
                          <MenuItem value="" sx={{ fontSize: '11px' }}>
                            All Types
                          </MenuItem>
                          {productTypes.map(type => (
                            <MenuItem key={type} value={type} sx={{ fontSize: '11px', textTransform: 'capitalize' }}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  )}

                  {/* Batch Tag Filter */}
                  {tags.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Batch Type</h3>
                      <FormControl fullWidth size="small">
                        <Select
                          value={selectedTag?.id || ''}
                          onChange={(e) => {
                            const tag = tags.find(t => t.id === e.target.value);
                            setSelectedTag(tag || null);
                          }}
                          displayEmpty
                          MenuProps={{
                            disableScrollLock: true,
                            PaperProps: {
                              style: {
                                maxHeight: 200,
                              },
                            },
                          }}
                          sx={{
                            borderRadius: '8px',
                            fontSize: '11px',
                            height: '32px',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: selectedTag ? '#3b82f6' : '#e5e7eb',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#3b82f6',
                            },
                          }}
                        >
                          <MenuItem value="" sx={{ fontSize: '11px' }}>
                            All Tags
                          </MenuItem>
                          {tags.map(tag => (
                            <MenuItem key={tag.id} value={tag.id} sx={{ fontSize: '11px' }}>
                              {tag.tag}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  )}

                  {/* Sort by Price Filter */}
                  <div>
                    <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Sort by Price</h3>
                    <FormControl fullWidth size="small">
                      <Select
                        value={priceSorting}
                        onChange={(e) => setPriceSorting(e.target.value)}
                        displayEmpty
                        MenuProps={{
                          disableScrollLock: true,
                          PaperProps: {
                            style: {
                              maxHeight: 200,
                            },
                          },
                        }}
                        sx={{
                          borderRadius: '8px',
                          fontSize: '11px',
                          height: '32px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: priceSorting ? '#3b82f6' : '#e5e7eb',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3b82f6',
                          },
                        }}
                      >
                        <MenuItem value="" sx={{ fontSize: '11px' }}>
                          All Prices
                        </MenuItem>
                        <MenuItem value="low-to-high" sx={{ fontSize: '11px' }}>
                          Price: Low to High
                        </MenuItem>
                        <MenuItem value="high-to-low" sx={{ fontSize: '11px' }}>
                          Price: High to Low
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
              <div
                className="store-courses-scroll"
                style={{
                  height: isMobile ? "550px" : "",
                  overflowY: "scroll",
                  overflowX: "hidden"
                }}
              >
                {filteredCourses?.length > 0 && (
                  <div className="mb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-2.5">
                      {filteredCourses.map((item) => (
                        <div
                          onClick={() => handleAddtoCart(item)}
                          key={item.id}
                          className={`group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border flex flex-col ${routeData
                            ? 'border-gray-100 hover:border-amber-300'
                            : 'border-gray-100 hover:border-blue-200'
                            } transform hover:-translate-y-0.5 cursor-pointer`}
                        >
                          {/* Course Image with Overlay */}
                          <div className="relative w-full overflow-hidden bg-gray-50 flex items-center justify-center">
                            <img
                              src={Endpoints?.mediaBaseUrl + item.logo}
                              alt={item.title}
                              className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          {/* Course Content */}
                          <div className="p-2.5 flex-1 flex flex-col">
                            <div className="flex items-start justify-between gap-1.5 mb-1">
                              <h3 className={`text-xs md:text-sm font-bold line-clamp-2 flex-1 transition-colors ${routeData
                                ? 'text-gray-900 group-hover:text-amber-600'
                                : 'text-gray-900 group-hover:text-blue-600'
                                }`}>
                                {item.title}
                              </h3>
                            </div>

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {item.tags.slice(0, 2).map((tag) => (
                                  <Chip
                                    key={tag.id}
                                    label={tag.tag}
                                    size="small"
                                    sx={{
                                      height: '20px',
                                      fontSize: '10px',
                                      fontWeight: '600',
                                      backgroundColor: routeData ? '#fef3c7' : '#eff6ff',
                                      color: routeData ? '#92400e' : '#2563eb',
                                      '& .MuiChip-label': {
                                        padding: '0 6px',
                                      },
                                    }}
                                  />
                                ))}
                                {item.tags.length > 2 && (
                                  <Chip
                                    label={`+${item.tags.length - 2}`}
                                    size="small"
                                    sx={{
                                      height: '20px',
                                      fontSize: '10px',
                                      fontWeight: '600',
                                      backgroundColor: '#f3f4f6',
                                      color: '#6b7280',
                                      '& .MuiChip-label': {
                                        padding: '0 6px',
                                      },
                                    }}
                                  />
                                )}
                              </div>
                            )}

                            <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-relaxed">
                              {truncateDescription(item?.shortDescription)}
                              {item?.shortDescription?.length > 100 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpandDescription(item?.shortDescription);
                                  }}
                                  className={`font-medium ml-1 underline ${routeData ? 'text-amber-600 hover:text-amber-700' : 'text-blue-600 hover:text-blue-700'}`}
                                >
                                  more
                                </button>
                              )}
                            </p>

                            {/* Pricing Section */}
                            <div className="mb-2 mt-auto">
                              {(() => {
                                const cartItem = cartCourses.find(c => c.id === item.id);

                                const getPriceInfo = () => {
                                  if (item?.coursePricing && item.coursePricing.length > 0) {
                                    let minOriginalPrice = Infinity;
                                    let minFinalPrice = Infinity;
                                    let maxDiscount = 0;

                                    item.coursePricing.forEach(pricing => {
                                      const originalPrice = pricing.price;
                                      const discount = pricing.discount || 0;
                                      const finalPrice = discount > 0
                                        ? originalPrice - (originalPrice * (discount / 100))
                                        : originalPrice;

                                      if (finalPrice < minFinalPrice) {
                                        minFinalPrice = finalPrice;
                                        minOriginalPrice = originalPrice;
                                        maxDiscount = discount;
                                      }
                                    });

                                    return {
                                      originalPrice: minOriginalPrice,
                                      finalPrice: minFinalPrice,
                                      discount: maxDiscount
                                    };
                                  }
                                  return { originalPrice: 0, finalPrice: 0, discount: 0 };
                                };

                                const priceInfo = getPriceInfo();

                                if (cartItem && cartItem.finalPrice !== undefined && cartItem.finalPrice !== null) {
                                  // Get discount info from cart item's selected pricing
                                  const cartPricing = item?.coursePricing?.find(p => p.id === cartItem.pricingId);
                                  const discount = cartPricing?.discount || 0;
                                  const originalPrice = cartPricing?.price || parseFloat(cartItem.finalPrice) * 1.3;

                                  return (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] text-gray-500 italic">Starting</span>
                                        <span className={`text-sm font-bold ${routeData
                                          ? 'text-amber-600'
                                          : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
                                          }`}>
                                          ₹{parseFloat(cartItem.finalPrice).toFixed(2)}
                                        </span>
                                        {discount > 0 && (
                                          <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded">
                                            {discount}% OFF
                                          </span>
                                        )}
                                      </div>
                                      {discount > 0 && (
                                        <span className="text-[9px] text-gray-400 line-through block">
                                          ₹{originalPrice.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] text-gray-500 italic">Starting</span>
                                        <span className={`text-sm font-bold ${priceInfo.finalPrice === 0
                                          ? 'text-green-600'
                                          : routeData
                                            ? 'text-amber-600'
                                            : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
                                          }`}>
                                          {priceInfo.finalPrice === 0 ? '0' : `₹${priceInfo.finalPrice.toFixed(2)}`}
                                        </span>
                                        {priceInfo.discount > 0 && (
                                          <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded">
                                            {priceInfo.discount}% OFF
                                          </span>
                                        )}
                                      </div>
                                      {priceInfo.discount > 0 && (
                                        <span className="text-[9px] text-gray-400 line-through block">
                                          ₹{priceInfo.originalPrice.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  );
                                }
                              })()}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePurchaseCourse(item);
                                }}
                                className={`flex-1 border-2 font-semibold py-1.5 px-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 hover:scale-105 ${routeData
                                  ? 'border-amber-600 text-amber-600 hover:bg-amber-50'
                                  : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50'
                                  } transform`}
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Explore
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddtoCart(item);
                                }}
                                className={`flex-1 font-semibold py-2 px-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 transform hover:scale-105 border-2 ${cartCourses.some(a => a.id === item?.id)
                                  ? 'bg-white border-red-500 text-red-600 hover:bg-red-50 shadow-sm hover:shadow-red-200/30'
                                  : routeData
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent shadow-lg'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-transparent shadow-lg hover:shadow-blue-400/50'
                                  }`}
                              >
                                <ShoppingCart className="h-4 w-4" />
                                {cartCourses.some(a => a.id === item?.id) ? "Remove" : "Add to cart"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* View More Button - Removed */}
                  </div>
                )}

                {/* Drip Courses */}
                {filteredDripCourses?.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Test Series & Programs</h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                      {filteredDripCourses.map((item) => (
                        <div
                          onClick={() => handlePurchaseCourse(item)}
                          key={item.id}
                          className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1 cursor-pointer flex flex-col"
                        >
                          {/* Course Image with Overlay */}
                          <div className="relative w-full h-48 overflow-hidden bg-gray-50 flex items-center justify-center">
                            <img
                              src={Endpoints?.mediaBaseUrl + item.logo}
                              alt={item.title}
                              className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          {/* Course Content */}
                          <div className="p-2 flex-1 flex flex-col">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 flex-1 group-hover:text-purple-600 transition-colors">
                                {item.title}
                              </h3>
                            </div>

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {item.tags.slice(0, 2).map((tag) => (
                                  <Chip
                                    key={tag.id}
                                    label={tag.tag}
                                    size="small"
                                    sx={{
                                      height: '20px',
                                      fontSize: '10px',
                                      fontWeight: '600',
                                      backgroundColor: '#faf5ff',
                                      color: '#9333ea',
                                      '& .MuiChip-label': {
                                        padding: '0 6px',
                                      },
                                    }}
                                  />
                                ))}
                                {item.tags.length > 2 && (
                                  <Chip
                                    label={`+${item.tags.length - 2}`}
                                    size="small"
                                    sx={{
                                      height: '20px',
                                      fontSize: '10px',
                                      fontWeight: '600',
                                      backgroundColor: '#f3f4f6',
                                      color: '#6b7280',
                                      '& .MuiChip-label': {
                                        padding: '0 6px',
                                      },
                                    }}
                                  />
                                )}
                              </div>
                            )}

                            <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-relaxed">
                              {truncateDescription(item?.description)}
                              {item?.description?.length > 100 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpandDescription(item?.description);
                                  }}
                                  className="text-purple-600 hover:text-purple-700 font-medium ml-1 underline"
                                >
                                  more
                                </button>
                              )}
                            </p>

                            {/* Pricing Section */}
                            <div className="mb-2 mt-auto">
                              {(() => {
                                const cartItem = cartCourses.find(c => c.id === item.id);

                                const getPriceInfo = () => {
                                  if (item?.coursePricing && item.coursePricing.length > 0) {
                                    let minOriginalPrice = Infinity;
                                    let minFinalPrice = Infinity;
                                    let maxDiscount = 0;

                                    item.coursePricing.forEach(pricing => {
                                      const originalPrice = pricing.price;
                                      const discount = pricing.discount || 0;
                                      const finalPrice = discount > 0
                                        ? originalPrice - (originalPrice * (discount / 100))
                                        : originalPrice;

                                      if (finalPrice < minFinalPrice) {
                                        minFinalPrice = finalPrice;
                                        minOriginalPrice = originalPrice;
                                        maxDiscount = discount;
                                      }
                                    });

                                    return {
                                      originalPrice: minOriginalPrice,
                                      finalPrice: minFinalPrice,
                                      discount: maxDiscount
                                    };
                                  }
                                  return { originalPrice: 0, finalPrice: 0, discount: 0 };
                                };

                                const priceInfo = getPriceInfo();

                                if (cartItem && cartItem.finalPrice !== undefined && cartItem.finalPrice !== null) {
                                  // Get discount info from cart item's selected pricing
                                  const cartPricing = item?.coursePricing?.find(p => p.id === cartItem.pricingId);
                                  const discount = cartPricing?.discount || 0;
                                  const originalPrice = cartPricing?.price || parseFloat(cartItem.finalPrice) * 1.3;

                                  return (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                        ₹{parseFloat(cartItem.finalPrice).toFixed(2)}
                                      </span>
                                      {discount > 0 && (
                                        <>
                                          <span className="text-xs text-gray-400 line-through">
                                            ₹{originalPrice.toFixed(2)}
                                          </span>
                                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                            {discount}% OFF
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-base font-bold ${priceInfo.finalPrice === 0 ? 'text-green-600' : 'text-purple-600'}`}>
                                        {priceInfo.finalPrice === 0 ? '0' : `₹${priceInfo.finalPrice.toFixed(2)}`}
                                      </span>
                                      {priceInfo.discount > 0 && (
                                        <>
                                          <span className="text-xs text-gray-400 line-through">
                                            ₹{priceInfo.originalPrice.toFixed(2)}
                                          </span>
                                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                            {priceInfo.discount}% OFF
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  );
                                }
                              })()}
                            </div>

                            {/* Action Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePurchaseCourse(item);
                              }}
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-1.5 px-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Explore
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* View More Button - Removed */}
                  </div>
                )}

                {/* Empty State */}
                {filteredCourses?.length === 0 && filteredDripCourses?.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <div className="bg-white rounded-3xl shadow-xl p-4 max-w-md mx-auto border border-gray-100">
                      <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${routeData
                        ? 'bg-gradient-to-br from-amber-100 to-yellow-100'
                        : 'bg-gradient-to-br from-blue-100 to-purple-100'
                        }`}>
                        <ShoppingCart className={`h-16 w-16 ${routeData ? 'text-amber-600' : 'text-blue-600'}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">No Courses Found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your filters to see more courses!</p>
                      <button
                        onClick={clearAllFilters}
                        className={`text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg ${routeData
                          ? 'bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/50'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/50'
                          }`}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Dialog */}
      <Dialog
        fullWidth
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px 24px 0 0',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            margin: 0,
            height: '55vh',
            width: '100%',
            boxShadow: '0 -4px 16px 0 rgba(0, 0, 0, 0.08)',
          }
        }}
      >
        <div className="flex flex-col h-full bg-white">
          {/* Header - Clean Design */}
          <div className="bg-white px-4 py-2 flex items-center justify-between shadow-sm" style={{ borderBottom: `1px solid ${primaryColor}30` }}>
            <h2 className="text-base font-black text-black">Refine Filters</h2>
            {(selectedDomain || selectedExamStage || selectedFaculties.length > 0) && (
              <button
                onClick={() => {
                  setSelectedDomain(null);
                  setSelectedExamStage(null);
                  setSelectedFaculties([]);
                }}
                className="font-black text-xs transition-colors"
                style={{ color: primaryColor }}
              >
                Reset
              </button>
            )}
          </div>

          {/* Main Content - Tabs and Content Side by Side */}
          <div className="flex flex-1 overflow-hidden">
            {/* Tabs - Left Side - Filter Categories */}
            <div className="w-32 bg-gray-50 border-r border-gray-200 flex flex-col overflow-y-auto">
              <button
                onClick={() => setMobileFilterTab('exam-type')}
                className="text-left px-4 py-2 border-l-4 text-xs transition-all duration-200"
                style={{
                  backgroundColor: mobileFilterTab === 'exam-type' ? 'white' : 'transparent',
                  borderLeftColor: mobileFilterTab === 'exam-type' ? primaryColor : 'transparent',
                  color: mobileFilterTab === 'exam-type' ? primaryColor : '#4b5563',
                  fontWeight: mobileFilterTab === 'exam-type' ? '600' : '500'
                }}
              >
                Exam Type
              </button>
              <button
                onClick={() => setMobileFilterTab('exam-stage')}
                className="text-left px-4 py-2 border-l-4 text-xs transition-all duration-200"
                style={{
                  backgroundColor: mobileFilterTab === 'exam-stage' ? 'white' : 'transparent',
                  borderLeftColor: mobileFilterTab === 'exam-stage' ? primaryColor : 'transparent',
                  color: mobileFilterTab === 'exam-stage' ? primaryColor : '#4b5563',
                  fontWeight: mobileFilterTab === 'exam-stage' ? '600' : '500'
                }}
              >
                Exam Stage
              </button>
              <button
                onClick={() => setMobileFilterTab('paper')}
                className="text-left px-4 py-2 border-l-4 text-xs transition-all"
                style={{
                  backgroundColor: mobileFilterTab === 'paper' ? 'white' : 'transparent',
                  borderLeftColor: mobileFilterTab === 'paper' ? primaryColor : 'transparent',
                  color: mobileFilterTab === 'paper' ? primaryColor : '#4b5563',
                  fontWeight: mobileFilterTab === 'paper' ? '600' : '500'
                }}
              >
                Paper
              </button>

              <button
                onClick={() => setMobileFilterTab('faculty')}
                className="text-left px-4 py-2 border-l-4 text-xs transition-all duration-200"
                style={{
                  backgroundColor: mobileFilterTab === 'faculty' ? 'white' : 'transparent',
                  borderLeftColor: mobileFilterTab === 'faculty' ? primaryColor : 'transparent',
                  color: mobileFilterTab === 'faculty' ? primaryColor : '#4b5563',
                  fontWeight: mobileFilterTab === 'faculty' ? '600' : '500'
                }}
              >
                Faculty
              </button>
              <button
                onClick={() => setMobileFilterTab('product')}
                className="text-left px-4 py-2 border-l-4 text-xs transition-all"
                style={{
                  backgroundColor: mobileFilterTab === 'product' ? 'white' : 'transparent',
                  borderLeftColor: mobileFilterTab === 'product' ? primaryColor : 'transparent',
                  color: mobileFilterTab === 'product' ? primaryColor : '#4b5563',
                  fontWeight: mobileFilterTab === 'product' ? '600' : '500'
                }}
              >
                Product
              </button>
              <button
                onClick={() => setMobileFilterTab('batch')}
                className="text-left px-4 py-2 border-l-4 text-xs transition-all"
                style={{
                  backgroundColor: mobileFilterTab === 'batch' ? 'white' : 'transparent',
                  borderLeftColor: mobileFilterTab === 'batch' ? primaryColor : 'transparent',
                  color: mobileFilterTab === 'batch' ? primaryColor : '#4b5563',
                  fontWeight: mobileFilterTab === 'batch' ? '600' : '500'
                }}
              >
                Batch
              </button>


              <button
                onClick={() => setMobileFilterTab('price')}
                className="text-left px-4 py-2 border-l-4 text-xs transition-all"
                style={{
                  backgroundColor: mobileFilterTab === 'price' ? 'white' : 'transparent',
                  borderLeftColor: mobileFilterTab === 'price' ? primaryColor : 'transparent',
                  color: mobileFilterTab === 'price' ? primaryColor : '#4b5563',
                  fontWeight: mobileFilterTab === 'price' ? '600' : '500'
                }}
              >
                Price
              </button>
            </div>

            {/* Tab Content - Right Side */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {/* Exam Type Tab */}
              {mobileFilterTab === 'exam-type' && (
                <div className="space-y-1">
                  {domains.filter(d => d.parentId === 0).length > 0 ? (
                    domains.filter(d => d.parentId === 0).map(domain => (
                      <div
                        key={domain.id}
                        onClick={() => {
                          if (selectedDomain?.id !== domain.id) {
                            setSelectedDomain(domain);
                          }
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer flex items-center justify-between group hover:bg-gray-50 ${selectedDomain?.id === domain.id
                          ? routeData ? 'bg-amber-50' : 'bg-blue-50'
                          : ''
                          }`}
                      >
                        <span className="font-medium line-clamp-1 text-gray-700"
                        // style={{ color: selectedDomain?.id === domain.id ? primaryColor : (isDarkMode ? '#fff' : '#111827') }}
                        >{domain.name}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${selectedDomain?.id === domain.id
                          ? routeData ? 'border-amber-600 bg-amber-600' : 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                          }`}>
                          {selectedDomain?.id === domain.id && (
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-6 text-sm">No exam types</p>
                  )}
                </div>
              )}

              {/* Exam Stage Tab */}
              {mobileFilterTab === 'exam-stage' && (
                <div className="space-y-1">
                  {getExamStages().length > 0 ? (
                    getExamStages().map(stage => (
                      <div
                        key={stage.id}
                        onClick={() => {
                          setSelectedExamStage(selectedExamStage?.id === stage.id ? null : stage);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer flex items-center justify-between group hover:bg-gray-50 ${selectedExamStage?.id === stage.id
                          ? routeData ? 'bg-amber-50' : 'bg-blue-50'
                          : ''
                          }`}
                      >
                        <span className="font-medium line-clamp-1 text-gray-700"
                        // style={{ color: selectedExamStage?.id === stage.id ? primaryColor : (isDarkMode ? '#fff' : '#111827') }}
                        >{stage.name}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${selectedExamStage?.id === stage.id
                          ? routeData ? 'border-amber-600 bg-amber-600' : 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                          }`}>
                          {selectedExamStage?.id === stage.id && (
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-6 text-sm">No exam stages</p>
                  )}
                </div>
              )}

              {mobileFilterTab === 'paper' && (
                <div className="space-y-1">
                  {getPapers().map(paper => {
                    const isSelected = selectedPapers.some(p => p.id === paper.id);

                    return (
                      <div
                        key={paper.id}
                        onClick={() => togglePaper(paper)}
                        className={`w-full text-left px-4 py-2 rounded-lg text-xs cursor-pointer
            flex items-center justify-between hover:bg-gray-50
            ${isSelected
                            ? routeData ? 'bg-amber-50' : 'bg-blue-50'
                            : ''
                          }
          `}
                      >
                        <span className="font-medium line-clamp-1 text-gray-700">
                          {paper.name}
                        </span>

                        {/* Custom checkbox UI */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
   ${isSelected
                              ? routeData ? 'border-amber-600 bg-amber-600' : 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                            }
  `}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {mobileFilterTab === 'faculty' && (
                <div className="space-y-1">
                  {faculties.length > 0 ? (
                    <>
                      {/* Select All / Deselect All */}
                      <div
                        onClick={() => {
                          if (selectedFaculties.length === faculties.length) {
                            setSelectedFaculties([]);
                          } else {
                            setSelectedFaculties([...faculties]);
                          }
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer flex items-center justify-between group hover:bg-gray-50 border-b border-gray-200 mb-2 ${selectedFaculties.length > 0
                          ? routeData ? 'bg-amber-50' : 'bg-blue-50'
                          : ''
                          }`}
                      >
                        <span className="font-semibold text-gray-800">
                          {selectedFaculties.length === faculties.length ? 'Deselect All' : 'Select All'}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selectedFaculties.length > 0
                          ? routeData ? 'border-amber-600 bg-amber-600' : 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                          }`}>
                          {selectedFaculties.length === faculties.length ? (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : selectedFaculties.length > 0 ? (
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          ) : null}
                        </div>
                      </div>

                      {/* Faculty List */}
                      {faculties.map(faculty => {
                        const isSelected = selectedFaculties.some(f => f.id === faculty.id);
                        return (
                          <div
                            key={faculty.id}
                            onClick={() => toggleFaculty(faculty)}
                            className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer flex items-center justify-between group hover:bg-gray-50 ${isSelected
                              ? routeData ? 'bg-amber-50' : 'bg-blue-50'
                              : ''
                              }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <Avatar
                                src={faculty.profile ? `${Endpoints.mediaBaseUrl}${faculty.profile}` : ''}
                                sx={{ width: 28, height: 28, fontSize: '11px', fontWeight: 'bold', flexShrink: 0 }}
                              >
                                {faculty.firstName?.charAt(0)}
                              </Avatar>
                              <span className="font-medium text-gray-700 line-clamp-1">{faculty.firstName} {faculty.lastName}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected
                              ? routeData ? 'border-amber-600 bg-amber-600' : 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                              }`}>
                              {isSelected && (
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-6 text-sm">No faculties</p>
                  )}
                </div>
              )}

              {mobileFilterTab === 'product' && (
                <div className="space-y-1">
                  {/* ALL PRODUCT TYPES */}
                  <div
                    onClick={() => setSelectedProductType(null)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer flex items-center justify-between group hover:bg-gray-50 ${!selectedProductType
                      ? routeData ? 'bg-amber-50' : 'bg-blue-50'
                      : ''
                      }`}
                  >
                    <span className="font-medium text-gray-700 line-clamp-1">All Types</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${!selectedProductType
                      ? routeData ? 'border-amber-600 bg-amber-600' : 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                      }`}>
                      {!selectedProductType && (
                        <div className="w-full h-full rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {productTypes.map(type => (
                    <div
                      key={type}
                      onClick={() => setSelectedProductType(type)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer flex items-center justify-between group hover:bg-gray-50 ${selectedProductType === type
                        ? routeData ? 'bg-amber-50' : 'bg-blue-50'
                        : ''
                        }`}
                    >
                      <span className="font-medium text-gray-700 line-clamp-1">{type}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${selectedProductType === type
                        ? routeData ? 'border-amber-600 bg-amber-600' : 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                        }`}>
                        {selectedProductType === type && (
                          <div className="w-full h-full rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {mobileFilterTab === 'batch' && (
                <div className="space-y-1">
                  {/* ALL BATCHES */}
                  <div
                    onClick={() => setSelectedTag(null)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer flex items-center justify-between group hover:bg-gray-50 ${!selectedTag
                      ? routeData ? 'bg-amber-50' : 'bg-blue-50'
                      : ''
                      }`}
                  >
                    <span className="font-medium text-gray-700 line-clamp-1">All Batches</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${!selectedTag
                      ? routeData ? 'border-amber-600 bg-amber-600' : 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                      }`}>
                      {!selectedTag && (
                        <div className="w-full h-full rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {tags.map(tag => (
                    <div
                      key={tag.id}
                      onClick={() => setSelectedTag(tag)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer flex items-center justify-between group hover:bg-gray-50 ${selectedTag?.id === tag.id
                        ? routeData ? 'bg-amber-50' : 'bg-blue-50'
                        : ''
                        }`}
                    >
                      <span className="font-medium text-gray-700 line-clamp-1">{tag.tag}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${selectedTag?.id === tag.id
                        ? routeData ? 'border-amber-600 bg-amber-600' : 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                        }`}>
                        {selectedTag?.id === tag.id && (
                          <div className="w-full h-full rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}


              {mobileFilterTab === 'price' && (
                <div className="space-y-1">
                  {[
                    { label: 'All', value: '' },
                    { label: 'Low to High', value: 'low-to-high' },
                    { label: 'High to Low', value: 'high-to-low' },
                  ].map(p => (
                    <div
                      key={p.value}
                      onClick={() => setPriceSorting(p.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer flex items-center justify-between group hover:bg-gray-50 ${priceSorting === p.value
                        ? routeData ? 'bg-amber-50' : 'bg-blue-50'
                        : ''
                        }`}
                    >
                      <span className="font-medium text-gray-700 line-clamp-1">{p.label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${priceSorting === p.value
                        ? routeData ? 'border-amber-600 bg-amber-600' : 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                        }`}>
                        {priceSorting === p.value && (
                          <div className="w-full h-full rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Footer - Buttons */}
          <div className="bg-white border-t border-gray-200 p-4 shadow-lg flex gap-3">
            <Button
              onClick={() => setMobileFiltersOpen(false)}
              variant="outlined"
              fullWidth
              sx={{
                color: '#6b7280',
                borderColor: '#d1d5db',
                fontWeight: '600',
                fontSize: '15px',
                padding: '12px 16px',
                borderRadius: '8px',
                textTransform: 'none',
                border: '2px solid #d1d5db',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                  borderColor: '#9ca3af',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setMobileFiltersOpen(false)}
              variant="contained"
              fullWidth
              sx={{
                background: '#6b7280',
                color: '#fff',
                fontWeight: '600',
                fontSize: '15px',
                padding: '12px 16px',
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 1px 4px 0 rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: '#4b5563',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                },
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </Dialog >

      {/* Modals */}
      < Dialog
        open={suggestedCourseDialog}
        onClose={() => setSuggestedCourseDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
          }
        }}
      >
        <SuggestedCourseDialog
          addedSuggestCourse={addedSuggestCourse}
          suggestedCourseId={suggestedCourseId}
          handleClose={handleCloseSuggestedCourseDialog}
          onFinalAmountUpdate={handleFinalAmountUpdate}
          setCartCourses={setCartCourses}
          setFinalAmounts={setFinalAmounts}
          routeData={routeData}
        />
      </Dialog >

      <Dialog
        open={courseExpandedDescriptions}
        onClose={() => setCourseExpandedDescriptions(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
          }
        }}
      >
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant='body1' sx={{ lineHeight: 1.8 }}>
            {parse(fullDes)}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCourseExpandedDescriptions(false)}
            variant="contained"
            sx={{
              background: routeData ? '#ffb610' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div >
  );
};

export default Store;