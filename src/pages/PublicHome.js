import React, { useState, useEffect } from 'react';
import BannerSlider from '../components/layout/BannerSlider';
import { useAuth } from '../context/AuthContext';
import Network from '../context/Network';
import instId from '../context/instituteId';
import Endpoints from '../context/endpoints';
import { Calendar, Users, Award, BookOpen, MessageCircle, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
const htmlContentStyles = `
  .html-content p {
    margin-bottom: 0.75rem;
  }
  .html-content strong {
    font-weight: 600;
    color: #374151;
  }
  .html-content a {
    color: #3b82f6;
    text-decoration: underline;
  }
  .html-content a:hover {
    color: #1d4ed8;
  }
`;

// Public Banner Slider Component
const PublicBannerSlider = ({ banners, onGetStarted, onViewCourses, institute, instituteAppSettingsModals }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        if (banners.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }
    };

    const prevSlide = () => {
        if (banners.length > 0) {
            setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
        }
    };

    // Auto-slide effect
    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(nextSlide, 5000);
            return () => clearInterval(timer);
        }
    }, [banners.length]);

    // Show fallback hero section if no banners
    if (banners.length === 0) {
        return (
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Welcome to {institute?.institue}
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        {instituteAppSettingsModals?.appBio ||
                            'Discover a world of knowledge with our comprehensive learning platform. Start your learning journey today!'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onGetStarted}
                            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 text-lg"
                        >
                            Get Started Today
                        </button>
                        <button
                            onClick={onViewCourses}
                            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 text-lg"
                        >
                            Explore Courses
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="relative w-full aspect-video md:aspect-[3/1] overflow-hidden rounded-xl shadow-2xl">
            {banners.map((slide, index) => {
                return (
                    <div
                        key={slide?.id}
                        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${index === currentSlide ? 'translate-x-0' :
                            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                            }`}
                    >
                        <div className={`h-full relative`}>
                            <div className="absolute inset-0 bg-black bg-opacity-10 blur-sm"></div>
                            <div className="h-full relative">
                                <img
                                    alt='Banner'
                                    src={Endpoints.mediaBaseUrl + slide?.banner}
                                    className="w-full h-full object-contain bg-gray"
                                    onError={(e) => {
                                        // console.error('Banner image failed to load:', Endpoints.mediaBaseUrl + slide?.banner);
                                        // Show fallback background instead of hiding
                                        e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                        e.target.style.display = 'none';
                                        // Add fallback text
                                        const fallbackDiv = document.createElement('div');
                                        fallbackDiv.className = 'absolute inset-0 flex items-center justify-center text-white text-center p-6';
                                        fallbackDiv.innerHTML = `
                    <div>
                      <h2 class="text-3xl font-bold mb-2">Welcome to ${institute?.institue}</h2>
                      <p class="text-lg opacity-90">Your learning journey starts here</p>
                    </div>
                  `;
                                        e.target.parentElement.appendChild(fallbackDiv);
                                    }}
                                // onLoad={() => {
                                //   console.log('Banner image loaded successfully:', Endpoints.mediaBaseUrl + slide?.banner);
                                // }}
                                />
                                {/* <div className="relative h-full flex items-center justify-center text-center px-6">
                <div className="max-w-4xl text-white">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl md:text-2xl font-semibold mb-6">
                    {slide.subtitle}
                  </h2>
                  <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                </div>
              </div> */}
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* Navigation arrows - only show if more than 1 banner */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm border border-white border-opacity-20"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm border border-white border-opacity-20"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </>
            )}

            {/* Dots indicator - only show if more than 1 banner */}
            {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const PublicHome = ({ onPageChange, onAuthAction }) => {
    const { instituteAppSettingsModals, institute } = useAuth();
    const [banners, setBanners] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [courses, setCourses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublicData();
    }, []);

    const fetchPublicData = async () => {
        try {
            setLoading(true);

            // Fetch public banners
            const bannerResponse = await fetch(`${Endpoints.baseURL}/admin/banner/fetch-public-banner/${instId}`);
            if (bannerResponse.ok) {
                const bannerData = await bannerResponse.json();
                setBanners(bannerData.banners || []);
            }

            const response = await Network.getAnnouncementList(instId);
            if (response?.announcement) {
                setAnnouncements(response?.announcement);
            } else {
                setAnnouncements([]);
            }

            // Fetch public courses
            const courseResponse = await fetch(`${Endpoints.baseURL}/admin/course/fetch-public/${instId}`);
            if (courseResponse.ok) {
                const courseData = await courseResponse.json();
                setCourses(courseData.courses || []);
            }

            // Fetch public employees
            const employeeResponse = await fetch(`${Endpoints.baseURL}/admin/employee/fetch-public-employee/${instId}`);
            if (employeeResponse.ok) {
                const employeeData = await employeeResponse.json();
                setEmployees(employeeData.employees || []);
            }

        } catch (error) {
            console.error('Error fetching public data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetStarted = () => {
        onAuthAction('signup');
    };

    const handleViewCourses = () => {
        onAuthAction('login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section with Banner Slider */}
            <section className="relative">
                <PublicBannerSlider
                    banners={banners}
                    onGetStarted={handleGetStarted}
                    onViewCourses={handleViewCourses}
                    institute={institute}
                    instituteAppSettingsModals={instituteAppSettingsModals}
                />
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose {institute?.institue}?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Join thousands of students who are already advancing their careers with our comprehensive learning platform.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Content</h3>
                            <p className="text-gray-600">Access high-quality educational content created by industry experts.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Faculty</h3>
                            <p className="text-gray-600">Learn from experienced professionals and industry leaders.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Certification</h3>
                            <p className="text-gray-600">Earn recognized certificates upon successful course completion.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Learning</h3>
                            <p className="text-gray-600">Study at your own pace with 24/7 access to course materials.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest Announcements */}
            {announcements.length > 0 && (
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Latest Announcements
                            </h2>
                            <p className="text-xl text-gray-600">Stay updated with our latest news and updates</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {announcements.slice(0, 3).map((announcement, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                    {announcement.image && (
                                        <img
                                            src={Endpoints.mediaBaseUrl + announcement.image}
                                            alt={announcement.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {announcement.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            <style dangerouslySetInnerHTML={{ __html: htmlContentStyles }} />
                                            <div
                                                className="text-gray-700 leading-relaxed max-w-none html-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: announcement.announcement ||
                                                        announcement.description ||
                                                        announcement.message ||
                                                        announcement.content ||
                                                        'No detailed description available for this announcement.'
                                                }}
                                                style={{
                                                    fontSize: '14px',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </p>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {new Date(announcement.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <button
                                onClick={() => onPageChange('announcement')}
                                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                View All Announcements
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Our Faculty */}
            {employees.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Meet Our Faculty
                            </h2>
                            <p className="text-xl text-gray-600">Learn from the best in the industry</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {employees.slice(0, 4).map((employee, index) => (
                                <div key={index} className="text-center">
                                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                                        <img
                                            src={employee.image ? Endpoints.mediaBaseUrl + employee.image : '/api/placeholder/128/128'}
                                            alt={employee.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                        {employee.name}
                                    </h3>
                                    <p className="text-blue-600 font-medium mb-2">
                                        {employee.designation}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {employee.bio?.substring(0, 100)}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Call to Action */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Start Your Learning Journey?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        Join thousands of students who are already advancing their careers. Sign up today and get access to our comprehensive learning platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleGetStarted}
                            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 text-lg"
                        >
                            Sign Up Now
                        </button>
                        <button
                            onClick={() => onAuthAction('login')}
                            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 text-lg"
                        >
                            Already Have Account? Login
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PublicHome;