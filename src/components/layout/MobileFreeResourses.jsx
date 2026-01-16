import React, { useEffect, useState } from 'react'
import Slider from 'react-slick';
import {
    PlayCircle,
    FileText,
    Clock,
    Download,
    X,
    BookOpen,
    ChevronDown,
    Folder,
    FolderOpen
} from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Network from '../../context/Network';
import instId from '../../context/instituteId';
import Endpoints from '../../context/endpoints';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import YouTubePlayer from './YouTubePlayer';
import { Box, Dialog, IconButton } from '@mui/material';

const MobileFreeResources = ({ onPageChange, onQuizNavigation, onAuthAction }) => {

    const navigate = useNavigate();
    const { authToken } = useAuth();
    const { isAuthenticated } = useStudent();
    const [coursesList, setCoursesList] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [activeCoursesList, setActiveCoursesList] = useState([]);
    const [selectedSceduleList, setSelectedSceduleList] = useState([]);
    const [number, setNumber] = useState('');
    const [name, setName] = useState('');
    const [selectCourse, setSelectCourse] = useState("");
    const [selectedItem, setSelectedItem] = useState({});
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [courseId, setCourseId] = useState(null);
    const [parentId, setParentId] = useState(null);
    const [showLoginWarning, setShowLoginWarning] = useState(false);
    const [selectedQuizItem, setSelectedQuizItem] = useState(null);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [enrollingCourse, setEnrollingCourse] = useState(null);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState(new Set());
    const [openDialog, setopenDialog] = useState(false);


    const handleCloseVideo = () => {
        setopenDialog(false)
    }

    const getAllCourses = async () => {
        try {
            const response = await Network.getFreeCourseList(instId);
            const course = response?.courses || [];
            const ActivefilteredCourses = course.filter(course =>
                course?.active === true
            );
            setActiveCoursesList(ActivefilteredCourses);

            const filteredCourses = course.filter(course =>
                course?.active === true &&
                course?.tags?.some(tagObj => tagObj?.tag?.toLowerCase() === "Free Resources".toLowerCase())
            );

            setCoursesList(filteredCourses);
        } catch (error) {
            console.log(error);
        };
    };

    const getMergedSchedules = async (courseId, folderId = 0) => {
        try {

            let response = await Network.fetchFreePublicScheduleApi(courseId, folderId);

            if (response?.contentList) {
                setSelectedSceduleList(response.contentList);
            } else {
                setSelectedSceduleList([]);
            }
        } catch (error) {
            setSelectedSceduleList([]);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        setIsVisible(true);
        getAllCourses();
    }, []);

    useEffect(() => {
        if (coursesList?.length > 0) {
            setSelectedSceduleList(coursesList);
            setCourseId(null);
            setParentId(null);
        }
    }, [coursesList]);

    const handleCardClick = (item) => {
        const authToken = localStorage.getItem('authToken');
        const studentData = localStorage.getItem('studentData');

        if (!courseId && !item?.entityType) {
            if (item?.setting?.restrictFreeContent === true && !enrolledCourses.has(item?.id)) {
                // Check if user is logged in
                const authToken = localStorage.getItem('authToken');
                const studentData = localStorage.getItem('studentData');

                if (!authToken || !studentData) {
                    setSelectedQuizItem(item);
                    setShowLoginWarning(true);
                    return;
                }

                // Show enrollment modal
                setEnrollingCourse(item);
                setShowEnrollModal(true);
                return;
            }

            setCourseId(item?.id);
            setParentId(null);
            getMergedSchedules(item?.id, 0);
            return;
        }

        if (item?.entityType) {
            if (item?.entityType?.toLowerCase() === "folder") {
                setParentId(item?.id);
                getMergedSchedules(courseId, item?.id);
                return;
            }

            // For non-folder items, check if user is logged in
            if (!authToken || !studentData) {
                setSelectedQuizItem(item);
                setShowLoginWarning(true);
                return;
            }

            if (item?.entityType === "quiz") {
                onQuizNavigation && onQuizNavigation('mcq-test', item);
                return;
            }

            if (item?.entityType === "blog") {
                onPageChange && onPageChange('blog', item);
                return;
            }
            if (item?.entityType === "note") {
                if (item?.note?.note) {
                    window.open(Endpoints.mediaBaseUrl + item?.note?.note, "_blank");
                }
                return;
            }
            if (item?.entityType === "video" && authToken && isAuthenticated) {
                if (item?.video?.youtubeUrl) {
                    setSelectedQuizItem(item);
                    setopenDialog(true)
                }
                return;
            } else {
                setShowLoginWarning(true)
            }

            // For other content types, open the form modal
            setSelectedItem(item);
            // setShowEnrollModal(true);
            return;
        }

        if (item?.id && !item?.entityType) {
            setCourseId(item?.id);
            setParentId(null);
            getMergedSchedules(item?.id, 0);
        }
    };

    const handleClose = () => {
        setFormModalOpen(false);
        setSelectedItem({});
        setName('');
        setNumber('');
        setSelectCourse('');
    };

    const handleChangeCourse = (course) => {
        setSelectCourse(course);
        setIsDropdownOpen(false);
    };

    const handleLoginWarningConfirm = () => {
        setShowLoginWarning(false);
        setSelectedQuizItem(null);
        if (!authToken && !isAuthenticated) {
            navigate('/login', { state: { data: "freeResource" } })
        }
        // onAuthAction && onAuthAction('login');
    };

    const handleLoginWarningCancel = () => {
        setShowLoginWarning(false);
        setSelectedQuizItem(null);
    };

    const handleCancelEnroll = () => {
        setShowEnrollModal(false);
        setEnrollingCourse(null);
    };

    const handleEnrollNow = async () => {
        if (!enrollingCourse) return;

        setIsEnrolling(true);
        try {
            const authToken = localStorage.getItem('authToken');
            const body = {
                contentId: enrollingCourse.id,
                contentPurchaseType: "course"
            };

            const response = await Network.assignFreeAccess(authToken, body);

            if (response?.errorCode === 0) {
                setEnrolledCourses(prev => new Set([...prev, enrollingCourse.id]));
                setShowEnrollModal(false);

                // Now open the course
                setCourseId(enrollingCourse.id);
                setParentId(null);
                getMergedSchedules(enrollingCourse.id, 0);
                setEnrollingCourse(null);
            } else {
                alert(response?.message || 'Failed to enroll. Please try again.');
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            alert('An error occurred during enrollment. Please try again.');
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const body = {
                instId: instId,
                firstName: name,
                lastName: name,
                contact: number,
                campaignId: null,
                contentId: selectCourse?.id,
                enquiryType: "course"
            }
            let response = await Network.createLeadFormAPI(body, instId);
            if (response?.errorCode !== 0) {
            } else if (response?.errorCode === 0) {

                handleClose();

                setTimeout(() => {
                    if (selectedItem?.entityType === "video" && selectedItem?.video?.video) {
                        window.open(Endpoints.mediaBaseUrl + selectedItem?.video?.video, "_blank");
                    } else if (selectedItem?.entityType === "note" && selectedItem?.note?.note) {
                        window.open(Endpoints.mediaBaseUrl + selectedItem?.note?.note, "_blank");
                    } else if (selectedItem?.entityType === "blog" && selectedItem?.blog?.blog) {
                        window.open(Endpoints.mediaBaseUrl + selectedItem?.blog?.blog, "_blank");
                    } else if (selectedItem?.entityType === "pdf" && selectedItem?.pdf?.pdf) {
                        window.open(Endpoints.mediaBaseUrl + selectedItem?.pdf?.pdf, "_blank");
                    } else if (selectedItem?.entityType === "document" && selectedItem?.document?.document) {
                        window.open(Endpoints.mediaBaseUrl + selectedItem?.document?.document, "_blank");
                    } else {
                        const fallbackUrl = selectedItem?.url || selectedItem?.link || selectedItem?.contentUrl;
                        if (fallbackUrl) {
                            window.open(fallbackUrl.startsWith('http') ? fallbackUrl : Endpoints.mediaBaseUrl + fallbackUrl, "_blank");
                        }
                    }
                }, 300);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Custom Arrow Components for Slider
    const NextArrow = ({ onClick }) => (
        <button
            onClick={onClick}
            className="
      absolute right-[-30px] top-1/2 -translate-y-1/2
      w-6 h-6 rounded-full bg-white shadow-md 
      flex items-center justify-center
      transition-all duration-200 
      hover:shadow-lg hover:scale-105
      border border-blue-200
      z-20
    "
        >
            <span className="text-[14px] text-blue-600 font-bold">{">"}</span>
        </button>
    );

    const PrevArrow = ({ onClick }) => (
        <button
            onClick={onClick}
            className="
      absolute left-[-30px] top-1/2 -translate-y-1/2
      w-6 h-6 rounded-full bg-white shadow-md
      flex items-center justify-center
      transition-all duration-200
      hover:shadow-lg hover:scale-105
      border border-blue-200
      z-20
    "
        >
            <span className="text-[14px] text-blue-600 font-bold">{"<"}</span>
        </button>
    );


    const settings = {
        dots: false,
        infinite: selectedSceduleList?.length > 1,
        speed: 400,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
    };

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
            {/* Header Section */}
            <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-4">
                    🎁 Free Educational Resources
                </h2>
                <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-2 sm:px-4">
                    Access premium educational content at no cost. Unlock valuable resources to boost your learning journey.
                </p>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="mb-6 flex gap-2 px-2">
                {/* Back to Courses button - show when we're inside a course */}
                {courseId && (
                    <button
                        onClick={() => {
                            setCourseId(null);
                            setParentId(null);
                            setSelectedSceduleList(coursesList);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-300"
                    >
                        ← Back to Courses
                    </button>
                )}

                {/* Back to Course Root button - show when we're inside a folder */}
                {parentId && courseId && (
                    <button
                        onClick={() => {
                            setParentId(null);
                            getMergedSchedules(courseId, 0);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-300"
                    >
                        ← Back to Course Root
                    </button>
                )}
            </div>

            {/* Resources Grid - Full Width */}
            {selectedSceduleList?.length > 0 && (
                <div className="w-full px-2 pb-4">
                    <div className="grid grid-cols-1 gap-4">
                        {selectedSceduleList?.map((item, index) => (
                            <div key={index}>
                                <div
                                    onClick={() => handleCardClick(item)}
                                    className="bg-white shadow-lg border rounded-xl cursor-pointer w-full transition hover:shadow-xl p-4"
                                >
                                    {/* Image Section */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-200 to-purple-200 h-40 mb-4 rounded-lg">
                                        <div className="flex items-center justify-center bg-white w-full h-full overflow-hidden">
                                            {item?.thumb || item?.logo ? (
                                                <img
                                                    src={Endpoints.mediaBaseUrl + (item?.thumb || item?.logo)}
                                                    className="w-full h-full object-cover"
                                                    alt=""
                                                />
                                            ) : (
                                                <BookOpen className="w-10 h-10 text-blue-600" />
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold mb-2 text-gray-800 line-clamp-2">
                                        {item?.title || 'Resource Title'}
                                    </h3>

                                    {/* Content Type Badge */}
                                    {/* <div className="flex items-center gap-2 text-blue-600 text-xs mb-2">
                                        {!courseId && !item?.entityType ? (
                                            <>
                                                <BookOpen className="w-4 h-4" />
                                                <span>Course</span>
                                            </>
                                        ) : item?.entityType?.toLowerCase() === "folder" ? (
                                            <>
                                                <Folder className="w-4 h-4" />
                                                <span>Folder</span>
                                            </>
                                        ) : item?.entityType === "quiz" ? (
                                            <>
                                                <div className="w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">?</div>
                                                <span>Quiz</span>
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="w-4 h-4" />
                                                <span>{item?.entityType || 'Content'}</span>
                                            </>
                                        )}
                                    </div> */}

                                    {/* Date Badge */}
                                    {/* {item?.createdAt && (
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full font-semibold inline-block mb-2">
                                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    )} */}

                                    {/* Action Button */}
                                    <button className={`w-full mt-3 py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 ${!courseId && !item?.entityType
                                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/30"
                                        : item?.entityType?.toLowerCase() === "folder"
                                            ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 hover:shadow-yellow-500/30"
                                            : item?.entityType === "quiz"
                                                ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/30"
                                                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30"
                                        } text-white`}>
                                        {!courseId && !item?.entityType ? (
                                            <>
                                                <BookOpen className="w-3 h-3" />
                                                View Course
                                            </>
                                        ) : item?.entityType?.toLowerCase() === "folder" ? (
                                            <>
                                                <FolderOpen className="w-3 h-3" />
                                                Open Folder
                                            </>
                                        ) : item?.entityType === "quiz" ? (
                                            <>
                                                <div className="w-3 h-3 bg-white text-purple-600 rounded-full flex items-center justify-center text-[8px] font-bold">?</div>
                                                Start Quiz
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-3 h-3" />
                                                Access Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* {selectedSceduleList?.length > 0 && (
                            <div className="max-w-[320px] sm:max-w-[350px] mx-auto relative px-2">
                                <Slider {...settings}>
                                    {selectedSceduleList?.map((item, index) => (
                                        <div key={index}>
                                            <div
                                                onClick={() => handleCardClick(item)}
                                                className="bg-white shadow-lg border rounded-xl cursor-pointer text-center w-full mx-auto transition hover:shadow-xl"
                                            >
                                                <div className="min-h-[170px] mx-auto mb-4 overflow-hidden bg-gradient-to-br from-blue-200 to-purple-200 p-[3px]">
                                                    <div className="flex items-center justify-center bg-white w-full h-full overflow-hidden">
                                                        {item?.thumb || item?.logo ? (
                                                            <img
                                                                src={Endpoints.mediaBaseUrl + (item?.thumb || item?.logo)}
                                                                className="w-full h-full object-cover rounded-lg"
                                                                alt=""
                                                            />
                                                        ) : (
                                                            <BookOpen className="w-10 h-10 text-blue-600" />
                                                        )}
                                                    </div>
                                                </div>
            
                                                <h3 className="text-lg font-bold mb-2 text-gray-800 line-clamp-2">
                                                    {item?.title || 'Resource Title'}
                                                </h3>
            
                                                <div className="flex items-center justify-center gap-2 text-blue-600 text-sm mb-3">
                                                    {!courseId && !item?.entityType ? (
                                                        <>
                                                            <BookOpen className="w-4 h-4" />
                                                            <span>Course</span>
                                                        </>
                                                    ) : item?.entityType?.toLowerCase() === "folder" ? (
                                                        <>
                                                            <Folder className="w-4 h-4" />
                                                            <span>Folder</span>
                                                        </>
                                                    ) : item?.entityType === "quiz" ? (
                                                        <>
                                                            <div className="w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">?</div>
                                                            <span>Quiz</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PlayCircle className="w-4 h-4" />
                                                            <span>{item?.entityType || 'Content'}</span>
                                                        </>
                                                    )}
                                                </div>
            
                                                {item?.createdAt && (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-semibold">
                                                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                )}
            
                                                <button className={`w-full mt-4 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 ${!courseId && !item?.entityType
                                                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/30"
                                                    : item?.entityType?.toLowerCase() === "folder"
                                                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 hover:shadow-yellow-500/30"
                                                        : item?.entityType === "quiz"
                                                            ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/30"
                                                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30"
                                                    } text-white`}>
                                                    {!courseId && !item?.entityType ? (
                                                        <>
                                                            <BookOpen className="w-4 h-4" />
                                                            View Course
                                                        </>
                                                    ) : item?.entityType?.toLowerCase() === "folder" ? (
                                                        <>
                                                            <FolderOpen className="w-4 h-4" />
                                                            Open Folder
                                                        </>
                                                    ) : item?.entityType === "quiz" ? (
                                                        <>
                                                            <div className="w-4 h-4 bg-white text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">?</div>
                                                            Start Quiz
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="w-4 h-4" />
                                                            Access Now
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        )} */}

            {/* No Resources Found */}
            {selectedSceduleList?.length === 0 && (
                <div className="text-center py-12 sm:py-16 px-4">
                    <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Free Resources Available</h3>
                    <p className="text-sm sm:text-base text-gray-500">Check back later for new free educational content.</p>
                </div>
            )}

            {/* Modal Form */}
            {formModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && handleClose()}
                >
                    <div className="bg-gradient-to-br from-white/98 to-gray-50/98 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 text-gray-800 relative overflow-hidden border-b border-gray-100">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent"></div>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleClose();
                                }}
                                className="absolute right-4 top-4 bg-gray-100/80 backdrop-blur-sm hover:bg-gray-200/80 text-gray-600 hover:text-gray-800 p-3 rounded-full transition-all duration-300 hover:scale-110 z-50 cursor-pointer"
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <BookOpen className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    🎯 Claim Your Free Resource
                                </h2>
                                <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
                                    Enter your details to unlock premium educational content at no cost
                                </p>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 space-y-6">
                            {/* Name Field */}
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50/80 border border-blue-500/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-500/30"
                                />
                            </div>

                            {/* Mobile Field */}
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">
                                    Mobile Number *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter your mobile number"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50/80 border border-blue-500/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-500/30"
                                />
                            </div>

                            {/* Course Selection */}
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">
                                    Interested Course *
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full px-4 py-3 bg-gray-50/80 border border-blue-500/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-500/30 flex items-center justify-between text-left"
                                    >
                                        <span className={selectCourse ? "text-gray-900" : "text-gray-500"}>
                                            {selectCourse?.title || "Select your course of interest"}
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                                            {activeCoursesList?.map((course, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleChangeCourse(course)}
                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                                                >
                                                    {course?.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!name || !number || !selectCourse?.id}
                                    className={`w-full py-4 px-4 rounded-xl text-white font-semibold text-base transition-all duration-300 ${!name || !number || !selectCourse?.id
                                        ? 'bg-blue-500/30 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30'
                                        }`}
                                >
                                    🚀 Access Free Resource
                                </button>

                                {/* Security Note */}
                                <p className="text-center text-white text-xs mt-4">
                                    🔒 Your information is secure and will only be used for educational purposes
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Warning Modal */}
            {showLoginWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🔐</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                                <p className="text-white/90 text-sm">
                                    You need to be logged in to access this content
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {selectedQuizItem?.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Please login or create an account to access this content and track your progress.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleLoginWarningCancel}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLoginWarningConfirm}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    Login Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enrollment Modal */}
            {showEnrollModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🎓</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Enroll in Free Course</h2>
                                <p className="text-white/90 text-sm">
                                    Get instant access to this premium content
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {enrollingCourse?.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    This course requires enrollment. Click "Enroll Now" to get free access and start learning immediately.
                                </p>
                            </div>

                            {/* Benefits */}
                            <div className="bg-orange-50 rounded-xl p-4 mb-6">
                                <h4 className="font-semibold text-gray-800 mb-2 text-sm">What you'll get:</h4>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-orange-500 mr-2">✓</span>
                                        <span>Lifetime access to course content</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-orange-500 mr-2">✓</span>
                                        <span>Track your learning progress</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-orange-500 mr-2">✓</span>
                                        <span>Access to quizzes and assignments</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-orange-500 mr-2">✓</span>
                                        <span>100% FREE - No hidden charges</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelEnroll}
                                    disabled={isEnrolling}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEnrollNow}
                                    disabled={isEnrolling}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    {isEnrolling ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Enrolling...</span>
                                        </>
                                    ) : (
                                        <>
                                            <BookOpen className="w-4 h-4" />
                                            <span>Enroll Now</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Dialog
                open={openDialog}
                onClose={handleCloseVideo}
                maxWidth={false}
                fullScreen={true}
                sx={{
                    '& .MuiDialog-container': {
                        '& .MuiPaper-root': {
                            width: '100vw',
                            height: '100vh',
                            maxWidth: '100vw',
                            maxHeight: '100vh',
                            margin: 0,
                            borderRadius: 0,
                            background: 'rgba(0, 0, 0, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: 'none',
                            overflow: 'hidden',
                        },
                    },
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        backdropFilter: 'blur(10px)',
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 0, // Remove all padding
                        m: 0, // Remove all margin
                    }}
                >
                    {/* Close Button */}
                    <IconButton
                        onClick={handleCloseVideo}
                        sx={{
                            position: 'fixed',
                            top: { xs: 10, md: 20 },
                            right: { xs: 10, md: 20 },
                            zIndex: 1300,
                            background: 'rgba(255, 215, 0, 0.9)',
                            color: '#000',
                            border: '2px solid #FFD700',
                            width: { xs: 40, md: 50 },
                            height: { xs: 40, md: 50 },
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
                            '&:hover': {
                                background: 'rgba(255, 215, 0, 1)',
                                transform: 'scale(1.05)',
                                boxShadow: '0 6px 25px rgba(255, 215, 0, 0.5)',
                            }
                        }}
                    >
                        <CancelRoundedIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                    </IconButton>

                    <Box
                        sx={{
                            width: '100%',
                            height: 'auto',
                            maxWidth: { xs: 'none', md: '1200px' },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pt: { xs: 6, md: 8 },
                            px: { xs: 3, md: 2 }, // Equal padding on mobile
                            boxSizing: 'border-box',
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: { xs: '100%', md: '100%' },
                                aspectRatio: '16/9',
                                '& iframe': {
                                    width: '100% !important',
                                    height: '100% !important',
                                    borderRadius: { xs: '10px', md: '15px' }, // Small border radius on mobile
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                                }
                            }}
                        >
                            <YouTubePlayer videoUrl={selectedQuizItem?.video?.youtubeUrl} />
                        </Box>
                    </Box>
                </Box>
            </Dialog>
        </div>
    )
}

export default MobileFreeResources