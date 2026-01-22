import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { Box, CssBaseline } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
    Menu, X, LogIn, UserPlus, Phone, MessageCircle, LogOut,
    Home, Image, Video, Bell, Shield, FileText,
    CreditCard, ChevronLeft, ChevronRight, Store,
    ShoppingBag, BookOpen, Rss, Award, User, Settings,
    ChevronDown, Edit, Mail, MapPin, Smartphone, ShoppingCart, Calendar, Users, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import Endpoints from '../../context/endpoints';
import instId from '../../context/instituteId';
import Network from '../../context/Network';
import Footer from './Footer';
import StudentEditDetailsDialog from './StudentEditDetailsDialog';
import NewFooter from './NewFooter';
import ThemeSwitcher from './ThemeSwitcher';

const UnifiedLayout = ({ children, currentPage, onPageChange, onAuthAction, isAuthenticated, onSidebarToggle: externalSidebarToggle, sidebarCollapsed: externalSidebarCollapsed, hideLayoutControls = false }) => {

    const { institute, instituteAppSettingsModals, logout } = useAuth();
    const { clearStudentAuth, getStudentInfo } = useStudent();
    const muiTheme = useMuiTheme();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(externalSidebarCollapsed || false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [latestAnnouncement, setLatestAnnouncement] = useState(null);
    const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);
    const [expandedMenuId, setExpandedMenuId] = useState(null);
    const [domains, setDomains] = useState([]);
    const [selectedParentDomain, setSelectedParentDomain] = useState(null);
    const [currentLevel, setCurrentLevel] = useState('first');
    const [domainLoading, setDomainLoading] = useState(false);
    const [selectedFirstLevelDomain, setSelectedFirstLevelDomain] = useState(null);
    const [selectedSecondLevelDomain, setSelectedSecondLevelDomain] = useState(null);
    // Books menu state
    const [booksDomains, setBooksDomains] = useState([]);
    const [booksSelectedParentDomain, setBooksSelectedParentDomain] = useState(null);
    const [booksCurrentLevel, setBooksCurrentLevel] = useState('first');
    const [booksLoading, setBooksLoading] = useState(false);
    const [booksSelectedFirstLevelDomain, setBooksSelectedFirstLevelDomain] = useState(null);
    const [booksSelectedSecondLevelDomain, setBooksSelectedSecondLevelDomain] = useState(null);
    const studentInfo = getStudentInfo();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [shouldHideLayoutControls, setShouldHideLayoutControls] = useState(false);
    // console.log('instituteinstitute', institute, Endpoints, instituteAppSettingsModals);

    console.log('studentInfo', studentInfo);

    // Check if layout controls should be hidden (from Store or CartPage with routeData)
    useEffect(() => {
        const checkHideLayoutControls = () => {
            const hideFlag = sessionStorage.getItem('hideLayoutControls');
            setShouldHideLayoutControls(hideFlag === 'true');
        };

        checkHideLayoutControls();

        // Listen for storage changes
        window.addEventListener('storage', checkHideLayoutControls);

        // Check periodically since sessionStorage changes in same tab don't trigger storage event
        const interval = setInterval(checkHideLayoutControls, 500);

        return () => {
            window.removeEventListener('storage', checkHideLayoutControls);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (externalSidebarCollapsed !== undefined) {
            setIsSidebarCollapsed(externalSidebarCollapsed);
        }
    }, [externalSidebarCollapsed]);

    // Load cart count from localStorage
    useEffect(() => {
        const updateCartCount = () => {
            const cartData = localStorage.getItem('cartCourses');
            if (cartData) {
                try {
                    const cart = JSON.parse(cartData);
                    setCartItemsCount(Array.isArray(cart) ? cart.length : 0);
                } catch (error) {
                    console.error('Error parsing cart data:', error);
                    setCartItemsCount(0);
                }
            } else {
                setCartItemsCount(0);
            }
        };

        // Initial load
        updateCartCount();

        // Listen for storage events (cart updates from other tabs/windows)
        window.addEventListener('storage', updateCartCount);

        // Listen for custom cart update event (same tab)
        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    // Fetch latest announcement
    useEffect(() => {
        const fetchLatestAnnouncement = async () => {
            try {
                const response = await Network.getAnnouncementList(instId);
                if (response?.announcement && response.announcement.length > 0) {
                    setLatestAnnouncement(response.announcement[0]);
                }
            } catch (error) {
                console.error('Error fetching latest announcement:', error);
            }
        };

        fetchLatestAnnouncement();
    }, []);


    const fetchDomainsForMenu = async () => {
        try {
            setDomainLoading(true);
            const response = await Network.fetchDomain(instId);
            const availableDomains = response?.domains || [];
            setDomains(availableDomains);
            setCurrentLevel('first');
            setSelectedParentDomain(null);
            setDomainLoading(false);
        } catch (error) {
            console.error('Error fetching domains:', error);
            setDomainLoading(false);
        }
    };

    const fetchBooksDomainsForMenu = async () => {
        try {
            setBooksLoading(true);
            const response = await Network.fetchDomain(instId);
            const availableDomains = response?.domains || [];
            setBooksDomains(availableDomains);
            setBooksCurrentLevel('first');
            setBooksSelectedParentDomain(null);
            setBooksLoading(false);
        } catch (error) {
            console.error('Error fetching books domains:', error);
            setBooksLoading(false);
        }
    };

    const fetchFacultyMenu = async () => {
        try {
            const employeeResponse = await fetch(`${Endpoints.baseURL}/admin/employee/fetch-public-employee/${instId}`);
            if (employeeResponse.ok) {
                const employeeData = await employeeResponse.json();
                setEmployees(employeeData.employees || []);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Intelligent domain hierarchy logic
    const shouldShowSecondLevel = domains.length === 1;
    const firstLevelDomains = shouldShowSecondLevel ? domains[0].child || [] : domains;
    const secondLevelDomains = selectedParentDomain?.child || [];

    // Books domain hierarchy logic
    const booksShowSecondLevel = booksDomains.length === 1;
    const booksFirstLevelDomains = booksShowSecondLevel ? booksDomains[0].child || [] : booksDomains;
    const booksSecondLevelDomains = booksSelectedParentDomain?.child || [];

    const handleFirstLevelDomainClick = (domain) => {
        setSelectedFirstLevelDomain(domain);

        // Check if this domain has children
        const hasChildren = domain.child && domain.child.length > 0;

        if (hasChildren) {
            // If it has children, show submenu
            if (shouldShowSecondLevel) {
                handleDomainClick(domain);
            } else {
                setSelectedParentDomain(domain);
                setCurrentLevel('second');
                setSelectedSecondLevelDomain(null);
            }
        } else {
            // If no children, directly go to store with this domain
            handleDomainClick(domain);
        }
    };

    const handleSecondLevelDomainClick = (domain) => {
        setSelectedSecondLevelDomain(domain);
        if (selectedParentDomain) {
            handleDomainClick(domain);
        }
    };
    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee)
        onPageChange('store', { facultyFilter: employee });
    }

    const handleBackToFirstLevel = () => {
        setCurrentLevel('first');
        setSelectedParentDomain(null);
        setSelectedSecondLevelDomain(null);
    };

    // Books menu handlers
    const handleBooksFirstLevelDomainClick = (domain) => {
        setBooksSelectedFirstLevelDomain(domain);

        // Check if this domain has children
        const hasChildren = domain.child && domain.child.length > 0;

        if (hasChildren) {
            // If it has children, show submenu
            if (booksShowSecondLevel) {
                handleBooksDomainClick(domain);
            } else {
                setBooksSelectedParentDomain(domain);
                setBooksCurrentLevel('second');
                setBooksSelectedSecondLevelDomain(null);
            }
        } else {
            // If no children, directly go to store with this domain
            handleBooksDomainClick(domain);
        }
    };

    const handleBooksSecondLevelDomainClick = (domain) => {
        setBooksSelectedSecondLevelDomain(domain);
        if (booksSelectedParentDomain) {
            handleBooksDomainClick(domain);
        }
    };

    const handleBooksBackToFirstLevel = () => {
        setBooksCurrentLevel('first');
        setBooksSelectedParentDomain(null);
        setBooksSelectedSecondLevelDomain(null);
    };

    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Close mobile menu and restore body scroll when switching to desktop
            if (!mobile && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
                document.body.style.overflow = 'unset';
                document.body.style.position = 'static';
                document.body.style.height = 'auto';
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
            // Clean up body overflow on unmount
            document.body.style.overflow = 'unset';
            document.body.style.position = 'static';
            document.body.style.height = 'auto';
        };
    }, [isMobileMenuOpen]);

    // Enhanced body scroll lock effect
    useEffect(() => {
        if (isMobile && isMobileMenuOpen) {
            // Lock body scroll completely
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';

            return () => {
                // Restore body scroll
                document.body.style.position = 'static';
                document.body.style.top = 'auto';
                document.body.style.left = 'auto';
                document.body.style.right = 'auto';
                document.body.style.overflow = 'unset';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isMobile, isMobileMenuOpen]);

    // Base public menu items (always visible)
    const publicMenuItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'announcement', label: 'Announcements', icon: Bell },
        { id: 'video_lecture', label: 'Video lectures', icon: Video },
        { id: 'test_series', label: 'Test Series', icon: Video },
        { id: 'books', label: 'Books', icon: BookOpen },
        { id: 'faculties', label: 'Our Faculties', icon: Users },
        { id: 'gallery', label: 'Result', icon: Image },
        { id: 'shorts', label: 'Students Feedback', icon: MessageCircle },
        { id: 'content', label: 'Free Resources', icon: BookOpen },
        // { id: 'store', label: 'Store', icon: Store },
    ];

    // Policy menu items (always at bottom)
    const policyMenuItems = [
        { id: 'privacy', label: 'Privacy Policy', icon: Shield },
        { id: 'terms', label: 'Terms & Conditions', icon: FileText },
        // { id: 'refund', label: 'Refund Policy', icon: CreditCard },
    ];

    // Private menu items (only visible when authenticated)
    const privateMenuItems = [
        { id: 'purchases', label: 'My Purchases', icon: ShoppingBag },
        { id: 'feed', label: 'Feed', icon: Rss },
    ];

    // Authentication menu items (only visible when not authenticated)
    const authMenuItems = [
        { id: 'login', label: 'Login', icon: LogIn },
        { id: 'signup', label: 'Sign Up', icon: UserPlus },
    ];

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        if (externalSidebarToggle) {
            externalSidebarToggle(newState);
        }
    };

    const handleSidebarToggle = (shouldCollapse) => {
        setIsSidebarCollapsed(shouldCollapse);
        if (externalSidebarToggle) {
            externalSidebarToggle(shouldCollapse);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        // Body scroll locking is now handled by useEffect
    };

    const closeMobileMenu = () => {
        if (isMobile && isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
            // Body scroll restoration is now handled by useEffect
        }
    };

    const handleMenuItemClick = (pageId) => {
        // Handle expandable menu items
        if (pageId === 'video_lecture') {
            setExpandedMenuId(expandedMenuId === 'video_lecture' ? null : 'video_lecture');
            if (expandedMenuId !== 'video_lecture' && domains.length === 0) {
                fetchDomainsForMenu();
            }
        } else if (pageId === 'books') {
            setExpandedMenuId(expandedMenuId === 'books' ? null : 'books');
            if (expandedMenuId !== 'books' && booksDomains.length === 0) {
                fetchBooksDomainsForMenu();
            }
        } else if (pageId === 'faculties') {
            setExpandedMenuId(expandedMenuId === 'faculties' ? null : 'faculties');
            if (expandedMenuId !== 'faculties' && booksDomains.length === 0) {
                fetchFacultyMenu();
            }
        } else if (pageId === 'test_series') {
            // Navigate to home page and scroll to TestSeriesBanner section
            onPageChange('home');
            closeMobileMenu();
            setTimeout(() => {
                const testSeriesSection = document.querySelector('[data-section="test-series"]');
                if (testSeriesSection) {
                    testSeriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            // For regular menu items, navigate and close mobile menu
            onPageChange(pageId);
            closeMobileMenu();
            setExpandedMenuId(null);
        }
    };

    const handleDomainClick = (domain) => {
        onPageChange('store', { selectedDomain: domain, selectedExamStage: null, productType: 'lecture' });
        closeMobileMenu();
        setExpandedMenuId(null);
    };

    const handleBooksDomainClick = (domain) => {
        onPageChange('store', { selectedDomain: domain, selectedExamStage: null, productType: 'books' });
        closeMobileMenu();
        setExpandedMenuId(null);
    };


    const handleCallNow = () => {
        const phoneNumber = '9900010922';
        window.open(`tel:${phoneNumber}`, '_self');
    };

    const handleWhatsApp = () => {
        const whatsappNumber = '9900010922';
        window.open(`https://wa.me/${whatsappNumber}`, '_blank');
    };

    const handleOurApp = () => {
        // First navigate to home page
        onPageChange('home');

        // Wait for navigation and DOM update, then scroll to app section
        setTimeout(() => {
            const appSection = document.getElementById('app-download-section');
            if (appSection) {
                appSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleStore = () => {
        onPageChange('store');
    }
    const handleFreeResourse = () => {
        onPageChange('content');
    }

    const handleSocialMedia = (platform) => {
        const socialLinks = {
            facebook: instituteAppSettingsModals?.facebookLink,
            instagram: instituteAppSettingsModals?.instagramLink,
            twitter: instituteAppSettingsModals?.twitterLink,
            youtube: instituteAppSettingsModals?.youtubeLink,
            linkedin: instituteAppSettingsModals?.linkedinLink,
        };

        if (socialLinks[platform]) {
            window.open(socialLinks[platform], '_blank');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();        // AuthContext: API call + clear auth data
            clearStudentAuth();    // StudentContext: update authentication state
            onPageChange('home');  // Navigate to home
        } catch (error) {
            // Fallback: even if API fails, clear local data
            clearStudentAuth();
            onPageChange('home');
        }
    };

    // Combine menu items based on authentication status
    const allMenuItems = [
        ...publicMenuItems,
        ...(isAuthenticated ? privateMenuItems : []),
        ...policyMenuItems
    ];

    const menuItemsToShow = isAuthenticated ?
        [...publicMenuItems, ...privateMenuItems, ...policyMenuItems] :
        [...publicMenuItems, ...policyMenuItems, ...authMenuItems];


    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Hidden when shouldHideLayoutControls is true */}
            {!shouldHideLayoutControls && (
                <div
                    className={`${isSidebarCollapsed ? 'w-16' : 'w-64'
                        } bg-white shadow-lg transition-all duration-300 ease-in-out fixed left-0 top-0 h-screen z-40 flex flex-col ${isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'
                        } ${isMobile ? 'rounded-tr-2xl rounded-br-2xl' : ''}`}
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain'
                    }}
                >
                    {/* Sidebar Header */}
                    <div className="flex-shrink-0 p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            {!isSidebarCollapsed && (
                                <div className="flex items-center">
                                    {instituteAppSettingsModals?.logo ? (
                                        <img
                                            style={{ borderRadius: "8px", width: "80px", height: "80px" }}
                                            src={Endpoints.mediaBaseUrl + instituteAppSettingsModals.logo}
                                            alt={institute?.institue || 'Logo'}
                                            className=""
                                        />
                                    ) : (
                                        <div className="text-lg font-bold text-blue-600">
                                            {/* {institute?.institue ? institute?.institue : <>
                                                PS Academy
                                            </>} */}
                                            <img
                                                style={{ borderRadius: "8px" }}
                                                src='/ps_logo.png'
                                                alt={institute?.institue || 'Logo'}
                                                className=""
                                            />
                                        </div>
                                    )}
                                </div>

                            )}
                            <div className="flex items-center space-x-2">
                                {/* Mobile close button */}
                                {isMobile && isMobileMenuOpen && (
                                    <button
                                        onClick={closeMobileMenu}
                                        className="p-1 rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                                {/* Collapse/Expand button */}
                                <button
                                    onClick={toggleSidebar}
                                    className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                                >
                                    {isSidebarCollapsed ? (
                                        <ChevronRight className="h-5 w-5" />
                                    ) : (
                                        <ChevronLeft className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Navigation */}
                    <nav
                        className={`flex-1 min-h-0 p-4 overflow-y-auto flex flex-col ${isMobile ? 'max-h-100' : ''}`}
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            overscrollBehavior: 'contain',
                            scrollbarWidth: 'thin',
                            touchAction: 'manipulation', // Better touch handling for iOS
                            overflowX: 'hidden', // Prevent horizontal scroll
                            height: isMobile ? '100vh' : '100%', // Reduced content height for mobile
                            maxHeight: isMobile ? '70vh' : 'calc(100vh - 120px)' // Reduced scrollable area for mobile
                        }}
                    >
                        <div className="flex-1">
                            {/* Main Menu Items */}
                            <ul className="space-y-2">
                                {publicMenuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isExpanded = expandedMenuId === item.id;
                                    const isExpandable = item.id === 'video_lecture' || item.id === 'books' || item?.id === "faculties";

                                    return (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => handleMenuItemClick(item.id)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 ${currentPage === item.id || isExpanded
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                                                    }`}
                                                title={isSidebarCollapsed ? item.label : ''}
                                            >
                                                <div className="flex items-center">
                                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                                    {!isSidebarCollapsed && (
                                                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                                                    )}
                                                </div>
                                                {isExpandable && !isSidebarCollapsed && (
                                                    <ChevronRightIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                )}
                                            </button>

                                            {/* Submenu for video_lecture and books */}
                                            {isExpandable && isExpanded && !isSidebarCollapsed && (
                                                <div className={`ml-3 mt-2 space-y-1 rounded-lg border p-2 shadow-md ${item.id === 'video_lecture' ? 'bg-gradient-to-b from-indigo-50 to-blue-50 border-indigo-200' : 'bg-gradient-to-b from-amber-50 to-orange-50 border-amber-200'}`}>
                                                    {/* VIDEO LECTURE SUBMENU */}
                                                    {item.id === 'video_lecture' && (
                                                        <>
                                                            {domainLoading ? (
                                                                <div className="px-3 py-2.5 text-xs text-gray-600 animate-pulse flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-blue-400 animate-bounce"></div>
                                                                    <span className="font-medium">Loading categories...</span>
                                                                </div>
                                                            ) : currentLevel === 'first' && firstLevelDomains.length === 0 ? (
                                                                <div className="px-3 py-2.5 text-xs text-gray-500 italic">No categories available</div>
                                                            ) : currentLevel === 'second' && secondLevelDomains.length === 0 ? (
                                                                <div className="px-3 py-2.5 text-xs text-gray-500 italic">No subcategories available</div>
                                                            ) : (
                                                                <>
                                                                    {currentLevel === 'second' && (
                                                                        <button onClick={handleBackToFirstLevel} className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 mb-2 flex items-center gap-1.5 rounded-md transition-all duration-200 shadow-sm hover:shadow-md">
                                                                            <ChevronLeft className="w-3.5 h-3.5" />
                                                                            <span>Back to Categories</span>
                                                                        </button>
                                                                    )}
                                                                    {currentLevel === 'first' && firstLevelDomains.map((domain) => (
                                                                        <button key={domain.id} onClick={() => handleFirstLevelDomainClick(domain)} className={`w-full text-left px-3 py-2.5 rounded-md text-xs transition-all duration-200 flex items-center justify-between group ${selectedFirstLevelDomain?.id === domain.id ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white font-bold shadow-md' : 'text-gray-700 hover:bg-white hover:text-blue-700 hover:shadow-sm'}`}>
                                                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${selectedFirstLevelDomain?.id === domain.id ? 'bg-white shadow-lg' : 'bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:scale-125'}`}></span>
                                                                                <span className="truncate font-medium">{domain.name}</span>
                                                                            </div>
                                                                            {!shouldShowSecondLevel && domain.child && domain.child.length > 0 && (
                                                                                <div className={`flex items-center gap-1.5 ml-1.5 flex-shrink-0 ${selectedFirstLevelDomain?.id === domain.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all duration-200`}>
                                                                                    <span className="text-xs font-semibold">{domain.child.length}</span>
                                                                                    <ChevronRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                    {currentLevel === 'second' && selectedParentDomain && (
                                                                        <>
                                                                            <div className="px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 mb-2 rounded-md flex items-center gap-2 shadow-sm">
                                                                                <div className="w-2 h-5 rounded-full bg-white opacity-80"></div>
                                                                                <span>{selectedParentDomain.name}</span>
                                                                            </div>
                                                                            {secondLevelDomains.map((domain) => (
                                                                                <button key={domain.id} onClick={() => handleSecondLevelDomainClick(domain)} className={`w-full text-left px-3 py-2.5 rounded-md text-xs transition-all duration-200 flex items-center gap-2.5 group ${selectedSecondLevelDomain?.id === domain.id ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-bold shadow-md' : 'text-gray-700 hover:bg-white hover:text-emerald-700 hover:shadow-sm'}`}>
                                                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${selectedSecondLevelDomain?.id === domain.id ? 'bg-white shadow-lg scale-125' : 'bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:scale-125'}`}></span>
                                                                                    <span className="truncate font-medium">{domain.name}</span>
                                                                                </button>
                                                                            ))}
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* BOOKS SUBMENU */}
                                                    {item.id === 'books' && (
                                                        <>
                                                            {booksLoading ? (
                                                                <div className="px-3 py-2.5 text-xs text-gray-600 animate-pulse flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-bounce"></div>
                                                                    <span className="font-medium">Loading categories...</span>
                                                                </div>
                                                            ) : booksCurrentLevel === 'first' && booksFirstLevelDomains.length === 0 ? (
                                                                <div className="px-3 py-2.5 text-xs text-gray-500 italic">No categories available</div>
                                                            ) : booksCurrentLevel === 'second' && booksSecondLevelDomains.length === 0 ? (
                                                                <div className="px-3 py-2.5 text-xs text-gray-500 italic">No subcategories available</div>
                                                            ) : (
                                                                <>
                                                                    {booksCurrentLevel === 'second' && (
                                                                        <button onClick={handleBooksBackToFirstLevel} className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 mb-2 flex items-center gap-1.5 rounded-md transition-all duration-200 shadow-sm hover:shadow-md">
                                                                            <ChevronLeft className="w-3.5 h-3.5" />
                                                                            <span>Back to Categories</span>
                                                                        </button>
                                                                    )}
                                                                    {booksCurrentLevel === 'first' && booksFirstLevelDomains.map((domain) => (
                                                                        <button key={domain.id} onClick={() => handleBooksFirstLevelDomainClick(domain)} className={`w-full text-left px-3 py-2.5 rounded-md text-xs transition-all duration-200 flex items-center justify-between group ${booksSelectedFirstLevelDomain?.id === domain.id ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold shadow-md' : 'text-gray-700 hover:bg-white hover:text-amber-700 hover:shadow-sm'}`}>
                                                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${booksSelectedFirstLevelDomain?.id === domain.id ? 'bg-white shadow-lg' : 'bg-gradient-to-r from-amber-400 to-orange-400 group-hover:scale-125'}`}></span>
                                                                                <span className="truncate font-medium">{domain.name}</span>
                                                                            </div>
                                                                            {!booksShowSecondLevel && domain.child && domain.child.length > 0 && (
                                                                                <div className={`flex items-center gap-1.5 ml-1.5 flex-shrink-0 ${booksSelectedFirstLevelDomain?.id === domain.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all duration-200`}>
                                                                                    <span className="text-xs font-semibold">{domain.child.length}</span>
                                                                                    <ChevronRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                    {booksCurrentLevel === 'second' && booksSelectedParentDomain && (
                                                                        <>
                                                                            <div className="px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 mb-2 rounded-md flex items-center gap-2 shadow-sm">
                                                                                <div className="w-2 h-5 rounded-full bg-white opacity-80"></div>
                                                                                <span>{booksSelectedParentDomain.name}</span>
                                                                            </div>
                                                                            {booksSecondLevelDomains.map((domain) => (
                                                                                <button key={domain.id} onClick={() => handleBooksSecondLevelDomainClick(domain)} className={`w-full text-left px-3 py-2.5 rounded-md text-xs transition-all duration-200 flex items-center gap-2.5 group ${booksSelectedSecondLevelDomain?.id === domain.id ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold shadow-md' : 'text-gray-700 hover:bg-white hover:text-orange-700 hover:shadow-sm'}`}>
                                                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${booksSelectedSecondLevelDomain?.id === domain.id ? 'bg-white shadow-lg scale-125' : 'bg-gradient-to-r from-orange-400 to-red-400 group-hover:scale-125'}`}></span>
                                                                                    <span className="truncate font-medium">{domain.name}</span>
                                                                                </button>
                                                                            ))}
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    {item.id === 'faculties' && (
                                                        <>
                                                            {employees && employees.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {employees.map((emp) => (
                                                                        <button
                                                                            key={emp.id}
                                                                            onClick={() => handleEmployeeClick(emp)}
                                                                            className={`w-full text-left px-3 py-2.5 rounded-md text-xs transition-all duration-200 flex items-center justify-between group ${selectedEmployee?.id === emp.id
                                                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-lg scale-105'
                                                                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md'
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                                                <span
                                                                                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${selectedEmployee?.id === emp.id
                                                                                        ? 'bg-white shadow-lg scale-110'
                                                                                        : 'bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:scale-150'
                                                                                        }`}
                                                                                ></span>
                                                                                <span className="truncate font-medium">
                                                                                    {emp.firstName} {emp.lastName}
                                                                                </span>
                                                                            </div>
                                                                            {selectedEmployee?.id === emp.id && (
                                                                                <div className="flex-shrink-0 ml-2">
                                                                                    <svg className="w-4 h-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="px-3 py-2.5 text-xs text-gray-500 italic text-center">
                                                                    No faculties available
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Private Menu Items (only when authenticated) */}
                            {isAuthenticated && privateMenuItems.length > 0 && (
                                <div className="mt-8 pt-4 border-t border-gray-200">
                                    {!isSidebarCollapsed && (
                                        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            My Account
                                        </p>
                                    )}
                                    <ul className="space-y-2">
                                        {privateMenuItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <li key={item.id}>
                                                    <button
                                                        onClick={() => handleMenuItemClick(item.id)}
                                                        className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${currentPage === item.id
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                                                            }`}
                                                        title={isSidebarCollapsed ? item.label : ''}
                                                    >
                                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                                        {!isSidebarCollapsed && (
                                                            <span className="ml-3 text-sm font-medium">{item.label}</span>
                                                        )}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {/* Policy Items - Show right after main menu when not authenticated */}
                            {!isAuthenticated && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    {!isSidebarCollapsed && (
                                        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            Policies
                                        </p>
                                    )}
                                    <ul className="space-y-2">
                                        {policyMenuItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <li key={item.id}>
                                                    <button
                                                        onClick={() => {
                                                            handleMenuItemClick(item.id);
                                                        }}
                                                        className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${currentPage === item.id
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                                                            }`}
                                                        title={isSidebarCollapsed ? item.label : ''}
                                                    >
                                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                                        {!isSidebarCollapsed && (
                                                            <span className="ml-3 text-sm font-medium">{item.label}</span>
                                                        )}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Bottom Section - Only for authenticated users or auth menu items */}
                        <div className="mt-auto">
                            {/* Policy Items (for authenticated users - at bottom) */}
                            {isAuthenticated && (
                                <div className="border-t border-gray-200 pt-4">
                                    {!isSidebarCollapsed && (
                                        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            Policies
                                        </p>
                                    )}
                                    <ul className="space-y-2">
                                        {policyMenuItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <li key={item.id}>
                                                    <button
                                                        onClick={() => {
                                                            handleMenuItemClick(item.id);
                                                        }}
                                                        className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${currentPage === item.id
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                                                            }`}
                                                        title={isSidebarCollapsed ? item.label : ''}
                                                    >
                                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                                        {!isSidebarCollapsed && (
                                                            <span className="ml-3 text-sm font-medium">{item.label}</span>
                                                        )}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}




                        </div>
                    </nav>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {!shouldHideLayoutControls && isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                        // Body scroll restoration is handled by useEffect
                    }}
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                    onScroll={(e) => e.preventDefault()}
                    style={{
                        touchAction: 'none',
                        overscrollBehavior: 'contain',
                        position: 'fixed',
                        overflow: 'hidden'
                    }}
                />
            )}

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isMobile ? 'ml-0' : shouldHideLayoutControls ? 'ml-0' : isSidebarCollapsed ? 'ml-16' : 'ml-64'
                    }`}
            >
                {/* Top Header - Hidden when shouldHideLayoutControls is true */}
                {!shouldHideLayoutControls && (
                    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30 transition-all duration-300" style={{ marginLeft: isMobile ? 0 : isSidebarCollapsed ? '4rem' : '16rem' }}>
                        <div className="px-4 sm:px-6 lg:px-8 h-16 w-full">
                            <div className="flex justify-between items-center h-16 gap-2">
                                {/* Mobile Menu Button */}
                                {isMobile && (
                                    <button
                                        onClick={toggleMobileMenu}
                                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
                                    >
                                        <Menu className="h-6 w-6" />
                                    </button>
                                )}

                                {/* Page Title */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <h1 className="text-lg md:text-xl font-semibold text-gray-900 whitespace-nowrap truncate">
                                        {isAuthenticated ? (
                                            <span>
                                                <span className="hidden sm:inline">Welcome to </span>
                                                <span className="text-blue-600">{institute?.institute || (instId === 331 ? "Percept Academy App" : instId === 262 ? "LecturWala App" : "")}</span>
                                            </span>
                                        ) : (
                                            <span className="capitalize">
                                                {menuItemsToShow.find(item => item.id === currentPage)?.label || 'Home'}
                                            </span>
                                        )}
                                    </h1>

                                    {/* Latest Announcement - Scrolling Section */}
                                    {latestAnnouncement && !isAnnouncementDismissed && (
                                        <div className="hidden lg:block flex-1 overflow-hidden min-w-0">
                                            <style dangerouslySetInnerHTML={{
                                                __html: `
                                                @keyframes scrollAnnouncement {
                                                    0% { transform: translateX(100%); }
                                                    100% { transform: translateX(-100%); }
                                                }
                                                .announcement-scroll {
                                                    animation: scrollAnnouncement 25s linear infinite;
                                                }
                                                .announcement-scroll:hover {
                                                    animation-play-state: paused;
                                                }
                                            `
                                            }} />
                                            <div
                                                className="announcement-scroll cursor-pointer"
                                                onClick={() => onPageChange('announcement')}
                                            >
                                                <div className="inline-flex items-center gap-2 bg-white border border-blue-200 rounded-full px-4 py-1.5 shadow-sm whitespace-nowrap hover:bg-blue-50 transition-colors duration-200">
                                                    {/* Bell Icon */}
                                                    {/* <div className="flex-shrink-0">
                                                    <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center">
                                                        <Bell className="w-3 h-3 text-blue-600" />
                                                    </div>
                                                </div> */}
                                                    {/* Announcement Text */}
                                                    <span className="text-xs font-medium text-gray-700">
                                                        📢 {latestAnnouncement.title || 'New Announcement'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Cart and Authentication Section */}
                                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                                    {/* Theme Switcher */}
                                    <ThemeSwitcher />

                                    {/* Cart Icon */}
                                    {cartItemsCount > 0 && (
                                        <button
                                            onClick={() => onPageChange('cart')}
                                            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                            title="View Cart"
                                        >
                                            <ShoppingCart className="w-5 h-5 text-gray-700" />
                                            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {cartItemsCount}
                                            </span>
                                        </button>
                                    )}

                                    {!isAuthenticated ? (
                                        // Login/Signup buttons when not authenticated
                                        <>
                                            <button
                                                onClick={() => onAuthAction('login')}
                                                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                            >
                                                <LogIn className="w-4 h-4" />
                                                <span>Login</span>
                                            </button>
                                            {/* <button
                                            onClick={() => onAuthAction('signup')}
                                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            <span>Sign Up</span>
                                        </button> */}
                                        </>
                                    ) : (
                                        // Profile dropdown when authenticated
                                        studentInfo && (
                                            <div className="relative z-[10000]">
                                                <button
                                                    onClick={() => {
                                                        setIsProfileDropdownOpen(!isProfileDropdownOpen);
                                                    }}
                                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                                    type="button"
                                                >
                                                    {/* Profile Picture */}
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                        {studentInfo?.profile ? (
                                                            <img
                                                                src={Endpoints.mediaBaseUrl + studentInfo.profile}
                                                                alt={studentInfo?.fullName || 'User'}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>

                                                    {/* User Name & Dropdown Arrow */}
                                                    <div className="hidden md:flex items-center space-x-1 truncate">
                                                        <div className="text-left truncate">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {studentInfo?.fullName}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {studentInfo?.email}
                                                            </p>
                                                        </div>
                                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isProfileDropdownOpen ? 'rotate-180' : ''
                                                            }`} />
                                                    </div>
                                                </button>

                                                {/* Profile Dropdown Menu */}
                                                {isProfileDropdownOpen && (
                                                    <>
                                                        {/* Click outside overlay */}
                                                        <div
                                                            className="fixed inset-0 z-40"
                                                            onClick={() => {
                                                                setIsProfileDropdownOpen(false);
                                                            }}
                                                        />
                                                        <div
                                                            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            {/* User Info Section */}
                                                            <div className="px-4 py-3 border-b border-gray-100">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                                        {studentInfo?.profile ? (
                                                                            <img
                                                                                src={Endpoints.mediaBaseUrl + studentInfo.profile}
                                                                                alt={studentInfo?.fullName || 'User'}
                                                                                className="w-12 h-12 rounded-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <User className="w-6 h-6 text-white" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                                            {studentInfo?.fullName}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 truncate">
                                                                            {studentInfo?.email}
                                                                        </p>
                                                                        {studentInfo?.contact && (
                                                                            <p className="text-xs text-gray-500">
                                                                                {studentInfo.contact}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Profile Actions */}
                                                            <div className="py-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        setIsProfileEditOpen(true);
                                                                        setIsProfileDropdownOpen(false);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 cursor-pointer"
                                                                    style={{ pointerEvents: 'auto' }}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                    <span>Edit Profile</span>
                                                                </button>

                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        onPageChange('purchases');
                                                                        setIsProfileDropdownOpen(false);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 cursor-pointer"
                                                                    style={{ pointerEvents: 'auto' }}
                                                                >
                                                                    <ShoppingBag className="w-4 h-4" />
                                                                    <span>My Purchases</span>
                                                                </button>

                                                                <div className="border-t border-gray-100 my-2"></div>

                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        handleLogout();
                                                                        setIsProfileDropdownOpen(false);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 cursor-pointer"
                                                                    style={{ pointerEvents: 'auto' }}
                                                                >
                                                                    <LogOut className="w-4 h-4" />
                                                                    <span>Logout</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <Box
                    component="main"
                    className={`flex-1 overflow-auto ${shouldHideLayoutControls ? 'pt-0' : 'pt-16'}`}
                    sx={{
                        backgroundColor: muiTheme.palette.background.default,
                        color: muiTheme.palette.text.primary,
                        transition: 'background-color 0.3s ease, color 0.3s ease',
                    }}
                >
                    <CssBaseline />
                    {React.cloneElement(children, { onSidebarToggle: handleSidebarToggle })}
                </Box>

                {/* Footer - Hide on login/signup pages or when layout controls are hidden */}
                {currentPage !== 'login' && currentPage !== 'signup' && !shouldHideLayoutControls && (
                    <div className={isMobile ? 'mb-16' : ''}>
                        <NewFooter onPageChange={onPageChange} />
                    </div>
                )}
            </div>

            {/* Floating Action Buttons */}
            {
                !shouldHideLayoutControls && (
                    <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
                        {/* WhatsApp Button */}
                        {instituteAppSettingsModals?.whatsappNumber && (
                            <button
                                onClick={handleWhatsApp}
                                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors duration-200"
                                title="Chat on WhatsApp"
                            >
                                <MessageCircle className="h-6 w-6" />
                            </button>
                        )}

                        {/* Call Now Button */}
                        {instituteAppSettingsModals?.phoneNumber && (
                            <button
                                onClick={handleCallNow}
                                className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors duration-200"
                                title="Call Now"
                            >
                                <Phone className="h-6 w-6" />
                            </button>
                        )}
                    </div>
                )
            }
            {/* Social Media Links */}
            {
                !shouldHideLayoutControls && (
                    <div className="fixed bottom-6 left-6 flex space-x-2 z-40">
                        {instituteAppSettingsModals?.facebookLink && (
                            <button
                                onClick={() => handleSocialMedia('facebook')}
                                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors duration-200"
                                title="Facebook"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </button>
                        )}

                        {instituteAppSettingsModals?.instagramLink && (
                            <button
                                onClick={() => handleSocialMedia('instagram')}
                                className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-pink-700 transition-colors duration-200"
                                title="Instagram"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.33-1.297C4.198 14.553 3.708 13.402 3.708 12.105s.49-2.448 1.411-3.33c.882-.882 2.033-1.297 3.33-1.297s2.448.415 3.33 1.297c.882.882 1.297 2.033 1.297 3.33s-.415 2.448-1.297 3.33c-.882.807-2.033 1.297-3.33 1.297zm7.718-6.695c-.49 0-.882-.392-.882-.882s.392-.882.882-.882.882.392.882.882-.392.882-.882.882zm-4.167 2.695c0-.882-.49-1.797-1.297-2.604-.807-.807-1.722-1.297-2.604-1.297s-1.797.49-2.604 1.297c-.807.807-1.297 1.722-1.297 2.604s.49 1.797 1.297 2.604c.807.807 1.722 1.297 2.604 1.297s1.797-.49 2.604-1.297c.807-.807 1.297-1.722 1.297-2.604z" />
                                </svg>
                            </button>
                        )}

                        {instituteAppSettingsModals?.youtubeLink && (
                            <button
                                onClick={() => handleSocialMedia('youtube')}
                                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-700 transition-colors duration-200"
                                title="YouTube"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </button>
                        )}
                    </div>
                )
            }

            {/* Profile Edit Dialog */}
            {isProfileEditOpen && (
                <StudentEditDetailsDialog
                    isOpen={isProfileEditOpen}
                    onClose={() => setIsProfileEditOpen(false)}
                    studentData={studentInfo}
                    onSave={(updatedData) => {
                        // The dialog will handle localStorage updates, we just need to close it
                        // The context will automatically pick up the changes from localStorage
                        setIsProfileEditOpen(false);
                        // Force a small delay to allow localStorage to be updated
                        setTimeout(() => {
                            window.location.reload(); // Refresh to show updated data
                        }, 100);
                    }}
                />
            )}

            {/* Mobile Fixed Footer - Only visible on mobile */}
            {!shouldHideLayoutControls && isMobile && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden"
                    style={{
                        paddingBottom: 'env(safe-area-inset-bottom)'
                    }}
                >
                    <div className="flex items-center justify-around py-2 px-3">
                        {/* Call Button */}
                        <button
                            onClick={handleCallNow}
                            className="flex flex-col items-center justify-center space-y-0.5 flex-1 hover:bg-gray-50 active:bg-gray-100 rounded-lg py-1.5 transition-colors duration-200"
                        >
                            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md">
                                <Phone className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-700">Call</span>
                        </button>

                        {/* WhatsApp Button */}
                        <button
                            onClick={handleWhatsApp}
                            className="flex flex-col items-center justify-center space-y-0.5 flex-1 hover:bg-gray-50 active:bg-gray-100 rounded-lg py-1.5 transition-colors duration-200"
                        >
                            <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white shadow-md">
                                <MessageCircle className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-700">WhatsApp</span>
                        </button>

                        {/* Our App Button */}
                        <button
                            onClick={handleOurApp}
                            className="flex flex-col items-center justify-center space-y-0.5 flex-1 hover:bg-gray-50 active:bg-gray-100 rounded-lg py-1.5 transition-colors duration-200"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-md">
                                <Smartphone className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-700">Our App</span>
                        </button>
                        <button
                            onClick={handleStore}
                            className="flex flex-col items-center justify-center space-y-0.5 flex-1 hover:bg-gray-50 active:bg-gray-100 rounded-lg py-1.5 transition-colors duration-200"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-md">
                                <Store className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-700">Store</span>
                        </button>
                        <button
                            onClick={handleFreeResourse}
                            className="flex flex-col items-center justify-center space-y-0.5 flex-1 hover:bg-gray-50 active:bg-gray-100 rounded-lg py-1.5 transition-colors duration-200"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-md">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-700">Free Resourse</span>
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default UnifiedLayout;
