
import React, { useEffect, useState } from 'react';
import {
    BookOpen,
    Code,
    Calculator,
    Globe,
    Palette,
    Music,
    Camera,
    TrendingUp,
    X,
    Calendar,
    Clock,
    User,
    AlertCircle
} from 'lucide-react';
import Network from '../../context/Network';
import { useAuth } from '../../context/AuthContext';
import instId from '../../context/instituteId';

const EnquiryForm = () => {

    const { authToken } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        course: '',
        courseId: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [courseList, setCourseList] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [showThankYou, setShowThankYou] = useState(false);

    console.log('courseList', courseList);


    const fetchCourseList = async () => {
        try {
            let response = await Network.getFreeCourseList(instId);
            let activeCourse = response?.courses?.length > 0 ? response?.courses?.filter(course => course?.active === true) : [];
            setCourseList(activeCourse);
        } catch (error) {
            console.log(error);
        };
    };

    useEffect(() => {
        fetchCourseList();
    }, []);

    // Notification helper functions
    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 4000);
    };

    const hideNotification = () => {
        setNotification({ show: false, message: '', type: '' });
    };

    // Thank you popup helper function
    const showThankYouPopup = () => {
        setShowThankYou(true);
        setTimeout(() => {
            setShowThankYou(false);
        }, 3000); // Auto close after 3 seconds
    };

    // const courses = [
    //     'Programming & Development',
    //     'Mathematics & Analytics',
    //     'Literature & Writing',
    //     'Foreign Languages',
    //     'Design & Arts',
    //     'Music & Audio',
    //     'Photography & Visual Arts',
    //     'Business & Entrepreneurship'
    // ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'course') {
            // Find the selected course to get both title and ID
            const selectedCourse = courseList.find(course => course.id === parseInt(value));
            setFormData(prev => ({
                ...prev,
                course: selectedCourse ? selectedCourse.title : '',
                courseId: value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.contact.trim()) {
            newErrors.contact = 'Contact is required';
        } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.contact.replace(/\s/g, ''))) {
            // Basic phone number validation - allows digits, spaces, +, -, (, )
            if (!/\S+@\S+\.\S+/.test(formData.contact)) {
                newErrors.contact = 'Please enter a valid phone number or email address';
            }
        }

        if (!formData.courseId) {
            newErrors.course = 'Please select a course';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            let body = {
                firstName: formData.name,
                lastName: formData.name,
                contact: formData.contact,
                email: '',
                enquiryType: 'course',
                instId: instId,
                campaignId: null,
                note: '',
                contentId: formData.courseId
            };

            let response = await Network.submitLeadForm(body);

            if (response && response.status === true) {
                // Handle successful response with animated popup
                showThankYouPopup();
                setFormData({ name: '', contact: '', course: '', courseId: '' });
                // Set submitted state after popup delay
                setTimeout(() => {
                    setIsSubmitted(true);
                }, 3200);
            } else {
                // Handle API response with success: false
                const errorMessage = response?.message || response?.error || 'Failed to submit enquiry. Please try again.';
                showNotification(`❌ ${errorMessage}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting enquiry:', error);
            // Handle network or other errors
            const errorMessage = error?.response?.message || error?.message || 'Network error. Please check your connection and try again.';
            showNotification(`❌ ${errorMessage}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
                <div className="text-center py-8">
                    <div className="mx-auto h-16 w-16 mb-4">
                        <div className="h-full w-full bg-gradient-to-tr from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                    <p className="text-gray-600 mb-6">Your enquiry has been submitted successfully. We'll get back to you soon!</p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                        Submit Another Enquiry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center mb-6">
                <TrendingUp className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Course Enquiry
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-1">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                        Full Name
                    </label>
                    <div className="relative group">
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className={`block w-full px-4 py-3 border-2 ${errors.name
                                ? 'border-red-300 focus:border-red-500'
                                : 'border-gray-200 focus:border-indigo-500'
                                } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70`}
                            placeholder="Enter your full name"
                        />
                    </div>
                    {errors.name && (
                        <p className="text-sm text-red-600 flex items-center gap-1 animate-pulse">
                            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Contact Field */}
                <div className="space-y-1">
                    <label htmlFor="contact" className="block text-sm font-semibold text-gray-700">
                        Contact Number
                    </label>
                    <div className="relative group">
                        <input
                            id="contact"
                            name="contact"
                            type="text"
                            value={formData.contact}
                            onChange={handleChange}
                            className={`block w-full px-4 py-3 border-2 ${errors.contact
                                ? 'border-red-300 focus:border-red-500'
                                : 'border-gray-200 focus:border-indigo-500'
                                } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70`}
                            placeholder="Enter your contact number"
                        />
                    </div>
                    {errors.contact && (
                        <p className="text-sm text-red-600 flex items-center gap-1 animate-pulse">
                            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                            {errors.contact}
                        </p>
                    )}
                </div>

                {/* Course Dropdown */}
                <div className="space-y-1">
                    <label htmlFor="course" className="block text-sm font-semibold text-gray-700">
                        Course of Interest
                    </label>
                    <div className="relative group">
                        <select
                            id="course"
                            name="course"
                            value={formData.courseId}
                            onChange={handleChange}
                            className={`block w-full px-4 py-3 border-2 ${errors.course
                                ? 'border-red-300 focus:border-red-500'
                                : 'border-gray-200 focus:border-indigo-500'
                                } rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70`}
                        >
                            <option value="">Select a course</option>
                            {courseList?.map((course) => (
                                <option key={course?.id} value={course?.id}>
                                    {course?.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.course && (
                        <p className="text-sm text-red-600 flex items-center gap-1 animate-pulse">
                            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                            {errors.course}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <TrendingUp className="h-5 w-5 opacity-80 group-hover:opacity-100" />
                                Submit Enquiry
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Animated Thank You Popup */}
            {showThankYou && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className={`transform transition-all duration-500 ease-out ${showThankYou ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 rotate-12'
                        }`}>
                        <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-md w-full border border-green-200">
                            <div className="text-center">
                                {/* Animated Success Icon */}
                                <div className="mx-auto w-20 h-20 mb-6 relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-green-600 rounded-full animate-pulse"></div>
                                    <div className="relative w-full h-full bg-gradient-to-tr from-green-500 to-green-700 rounded-full flex items-center justify-center animate-bounce">
                                        <BookOpen className="w-10 h-10 text-white animate-pulse" />
                                    </div>
                                    {/* Sparkle effects */}
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                                    <div className="absolute top-1/2 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                                </div>

                                {/* Thank You Text */}
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-pulse">
                                    🎉 Thank You! 🎉
                                </h3>
                                <p className="text-gray-700 text-lg mb-2 font-medium">
                                    Your enquiry has been submitted successfully!
                                </p>
                                <p className="text-gray-500 text-sm">
                                    We'll get back to you soon.
                                </p>

                                {/* Progress bar */}
                                <div className="mt-6 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"
                                        style={{
                                            width: '100%',
                                            animation: 'progress 3s linear forwards'
                                        }}></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Auto-closing in 3 seconds...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Snackbar */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}>
                    <div className={`rounded-lg shadow-2xl border-l-4 p-4 backdrop-blur-sm ${notification.type === 'success'
                        ? 'bg-green-50/90 border-green-500 text-green-800'
                        : 'bg-red-50/90 border-red-500 text-red-800'
                        }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                    {notification.type === 'success' ? (
                                        <BookOpen className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={hideNotification}
                                className={`flex-shrink-0 ml-2 p-1 rounded-full hover:bg-opacity-20 transition-colors ${notification.type === 'success' ? 'hover:bg-green-200' : 'hover:bg-red-200'
                                    }`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes progress {
                    from {
                        width: 0%;
                    }
                    to {
                        width: 100%;
                    }
                }
                
                @keyframes sparkle {
                    0%, 100% {
                        opacity: 0;
                        transform: scale(0);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default EnquiryForm;