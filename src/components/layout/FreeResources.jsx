import React, { useEffect, useState } from 'react'
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
import Network from '../../context/Network';
import instId from '../../context/instituteId';
import Endpoints from '../../context/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { useNavigate } from 'react-router-dom';
import { Box, Dialog, IconButton } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import YouTubePlayer from './YouTubePlayer';

const FreeResources = ({ onPageChange, onQuizNavigation, onAuthAction }) => {

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


    return (
        <div className="max-w-7xl mx-auto px-4">
            {/* Header Section */}
            <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                    🎁 Free Educational Resources
                </h2>
                <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                    Access premium educational content at no cost. Unlock valuable resources to boost your learning journey.
                </p>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="mb-6 flex gap-2">
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

            {/* Resources Grid */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                {selectedSceduleList?.length > 0 && selectedSceduleList?.map((item, i) => {
                    return (
                        <div
                            key={i}
                            className={`w-full sm:w-72 max-w-sm px-2 sm:px-0 transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                            style={{ transitionDelay: `${100 + (i * 100)}ms` }}
                        >
                            <div
                                onClick={() => handleCardClick(item)}
                                className="group bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden h-full cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-black/10 flex flex-col relative"
                            >
                                {/* Free Badge */}
                                {/* <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 transform group-hover:scale-110 transition-transform duration-300">
                                    FREE
                                </div> */}

                                {/* Image Section */}
                                <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                    {item?.thumb || item?.logo ? (
                                        <img
                                            src={Endpoints.mediaBaseUrl + (item?.thumb || item?.logo)}
                                            alt={item?.title}
                                            className="w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-yellow-50">
                                            {/* Show different icons based on context and entity type */}
                                            {!courseId && !item?.entityType ? (
                                                // Course card (Level 1)
                                                <div className="flex flex-col items-center">
                                                    <BookOpen className="w-16 h-16 text-blue-500 opacity-70" />
                                                    <span className="text-blue-600 font-semibold text-sm mt-1">COURSE</span>
                                                </div>
                                            ) : item?.entityType?.toLowerCase() === "folder" ? (
                                                // Folder card (Level 2/3)
                                                <div className="flex flex-col items-center">
                                                    <FolderOpen className="w-16 h-16 text-yellow-500 opacity-70" />
                                                    <span className="text-yellow-600 font-semibold text-sm mt-1">FOLDER</span>
                                                </div>
                                            ) : item?.entityType === "video" || item?.entityType === "blog" ? (
                                                // Video/Blog card
                                                <PlayCircle className="w-15 h-15 text-blue-500 opacity-70" size={60} />
                                            ) : item?.entityType === "quiz" ? (
                                                // Quiz card
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
                                                        <span className="text-white font-bold text-2xl">?</span>
                                                    </div>
                                                    <span className="text-purple-600 font-semibold text-sm">QUIZ</span>
                                                </div>
                                            ) : (
                                                // Other content types
                                                <FileText className="w-15 h-15 text-red-500 opacity-70" size={60} />
                                            )}
                                        </div>
                                    )}

                                    {/* Content Type Icon */}
                                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-xl p-2">
                                        {!courseId && !item?.entityType ? (
                                            // Course icon
                                            <BookOpen className="w-5 h-5 text-white transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
                                        ) : item?.entityType?.toLowerCase() === "folder" ? (
                                            // Folder icon
                                            <Folder className="w-5 h-5 text-yellow-300 transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
                                        ) : item?.entityType === "video" || item?.entityType === "blog" ? (
                                            // Video/Blog icon
                                            <PlayCircle className="w-5 h-5 text-white transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
                                        ) : item?.entityType === "quiz" ? (
                                            // Quiz icon
                                            <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300">
                                                ?
                                            </div>
                                        ) : (
                                            // Other content types
                                            <FileText className="w-5 h-5 text-white transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
                                        )}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-4 sm:p-6 flex-grow flex flex-col justify-between">
                                    {/* Title */}
                                    <h3 className="text-gray-800 font-bold text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2 leading-tight">
                                        {item?.title || 'Resource Title'}
                                    </h3>

                                    {/* Footer */}
                                    <div className="mt-auto">
                                        {/* Date */}
                                        <div className="flex items-center mb-4">
                                            <Clock className="w-4 h-4 text-gray-500 mr-2" />
                                            <span className="text-gray-500 text-xs">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                }) : "Recently Added"}
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        <button className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 ${!courseId && !item?.entityType
                                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/30"
                                            : item?.entityType?.toLowerCase() === "folder"
                                                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 hover:shadow-yellow-500/30"
                                                : item?.entityType === "quiz"
                                                    ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/30"
                                                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30"
                                            } text-white`}>
                                            {!courseId && !item?.entityType ? (
                                                // Course button
                                                <>
                                                    <BookOpen className="w-4 h-4" />
                                                    View Course
                                                </>
                                            ) : item?.entityType?.toLowerCase() === "folder" ? (
                                                // Folder button
                                                <>
                                                    <FolderOpen className="w-4 h-4" />
                                                    Open Folder
                                                </>
                                            ) : item?.entityType === "quiz" ? (
                                                // Quiz button
                                                <>
                                                    <div className="w-4 h-4 bg-white text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">?</div>
                                                    Start Quiz
                                                </>
                                            ) : (
                                                // Other content button
                                                <>
                                                    <Download className="w-4 h-4" />
                                                    Access Now
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

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

export default FreeResources