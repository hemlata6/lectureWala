import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Clock, BookOpen, Play } from 'lucide-react';
import Network from '../../context/Network';
import instId from '../../context/instituteId';
import Endpoints from '../../context/endpoints';
import MobileCoursesSlider from './MobileCoursesSlider';

const CoursesByTag = ({ onCourseClick, onAddToCart }) => {
    const [domains, setDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [flattenedDomains, setFlattenedDomains] = useState([]);
    const [tags, setTags] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);

    // console.log('flattenedDomains', flattenedDomains);

    // Extract only child domains (not parent domains)
    const getChildDomains = (domainsArray) => {
        const children = [];

        if (Array.isArray(domainsArray)) {
            domainsArray.forEach(domain => {
                // Get all children of the parent domain
                if (domain.child && Array.isArray(domain.child) && domain.child.length > 0) {
                    domain.child.forEach(childItem => {
                        children.push({
                            id: childItem.id,
                            name: childItem.name,
                            parentId: childItem.parentId
                        });
                    });
                }
            });
        }

        return children;
    };

    // Flatten hierarchical domain structure
    const flattenDomains = (domainsArray) => {
        const flattened = [];

        const traverse = (item) => {
            flattened.push({
                id: item.id,
                name: item.name,
                parentId: item.parentId
            });

            if (item.child && Array.isArray(item.child) && item.child.length > 0) {
                item.child.forEach(childItem => traverse(childItem));
            }
        };

        if (Array.isArray(domainsArray)) {
            domainsArray.forEach(domain => traverse(domain));
        }

        return flattened;
    };


    useEffect(() => {
        fetchTagsAndCourses();
    }, []);

    const fetchTagsAndCourses = async () => {
        try {
            setLoading(true);

            // Fetch domains
            const domainResponse = await Network.fetchDomain(instId);

            const availableDomains = domainResponse?.domains || [];
            setDomains(availableDomains);

            // Get only child domains (not parent domains)
            const childDomains = getChildDomains(availableDomains);
            setFlattenedDomains(childDomains);

            // Fetch tags
            const tagResponse = await Network.fetchTags(instId);
            const availableTags = tagResponse?.tags?.filter(tag => tag.availableApp === true) || [];
            setTags(availableTags);

            // Fetch courses
            const courseResponse = await Network.getFreeCourseList(instId);
            const allCourses = courseResponse?.courses || [];

            // Filter courses that have the "Most ❤️Courses" tag
            const mostLikedCoursesTag = availableTags.find(tag => tag.tag === 'Most ❤️Courses');

            let coursesWithMostLikedTag = allCourses.filter(course => {
                return course.paid === true && course.tags && course.tags.find(tag => tag.id === mostLikedCoursesTag?.id && tag.availableApp === true);
            });

            setCourses(coursesWithMostLikedTag);

            // Set first child domain as default and filter
            if (childDomains.length > 0) {
                const caIntermediateDomain = childDomains.find(d => d.name.toLowerCase().includes("ca intermediate"));
                const defaultDomain = caIntermediateDomain || childDomains[0];

                setSelectedDomain(defaultDomain.id);
                const filtered = coursesWithMostLikedTag.filter(course => {
                    return course.domain && course.domain.some(d => d.id === defaultDomain.id);
                });
                setFilteredCourses(filtered);
            } else {
                setFilteredCourses(coursesWithMostLikedTag);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const filterCoursesByTag = (tagId, coursesList = courses) => {
        setSelectedTag(tagId);
        const filtered = coursesList.filter(course => {
            return course.tags && course.tags.some(tag => tag.id === tagId && tag.availableApp === true);
        });
        setFilteredCourses(filtered);
        setScrollPosition(0);
    };

    const filterCoursesByDomain = (domainId) => {
        setSelectedDomain(domainId);
        const filtered = courses.filter(course => {
            // Check if course.domain array contains the selected domain
            return course.domain && course.domain.some(d => d.id === domainId);
        });
        setFilteredCourses(filtered);
        setScrollPosition(0);
    };

    const scrollLeft = () => {
        const container = document.getElementById('course-scroll-container');
        if (container) {
            container.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        const container = document.getElementById('course-scroll-container');
        if (container) {
            container.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    const getLowestPrice = (coursePricing) => {
        if (!coursePricing || coursePricing.length === 0) return null;

        let minOriginalPrice = Infinity;
        let minFinalPrice = Infinity;
        let maxDiscount = 0;

        coursePricing.forEach(pricing => {
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
            originalPrice: minOriginalPrice === Infinity ? 0 : minOriginalPrice,
            finalPrice: minFinalPrice === Infinity ? 0 : minFinalPrice,
            discount: maxDiscount
        };
    };

    const getSelectedTagName = () => {
        const tag = tags.find(t => t.id === selectedTag);
        return tag ? tag.tag : 'Courses';
    };

    const getSelectedDomainName = () => {
        const domain = flattenedDomains.find(d => d.id === selectedDomain);
        return domain ? domain.name : 'All Domains';
    };

    if (loading) {
        return (
            <div className="py-6 sm:py-8 md:py-12 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 w-full">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-40 sm:h-48 md:h-64">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Mobile View */}
            <MobileCoursesSlider onCourseClick={onCourseClick} onAddToCart={onAddToCart} />

            {/* Desktop View */}
            <div className="hidden md:block bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 w-full py-2">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 w-full">
                    {/* Section Header */}
                    <div className="text-center mb-4 sm:mb-5 md:mb-6">
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2 px-2">
                            Most Loved Courses
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto px-4">
                            Explore our most loved courses - handpicked by our community
                        </p>
                    </div>

                    {/* Domain Filter Buttons */}
                    {flattenedDomains.length > 0 && (
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {flattenedDomains.map((domain) => (
                                    <button
                                        key={domain.id}
                                        onClick={() => filterCoursesByDomain(domain.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${selectedDomain === domain.id
                                            ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {domain.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Course Cards with Horizontal Scroll */}
                    <div className="relative">
                        {/* Left Scroll Button */}
                        {filteredCourses.length > 3 && (
                            <button
                                onClick={scrollLeft}
                                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-700" />
                            </button>
                        )}

                        {/* Course Cards Container */}
                        <div
                            id="course-scroll-container"
                            className="flex overflow-x-auto gap-2 sm:gap-3 md:gap-4 pb-3 sm:pb-4 scrollbar-hide snap-x snap-mandatory justify-start md:justify-center px-2 sm:px-0"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {filteredCourses.length === 0 ? (
                                <div className="w-full text-center py-6 sm:py-8">
                                    <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                                    <p className="text-gray-600 text-xs sm:text-sm px-4">No courses available for this category</p>
                                </div>
                            ) : (
                                filteredCourses.map((course) => {

                                    const priceInfo = getLowestPrice(course.coursePricing);

                                    return (
                                        <div
                                            key={course.id}
                                            className="flex-shrink-0 w-48 sm:w-56 md:w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden snap-start group"
                                        >
                                            {/* Course Image */}
                                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                                                {course.logo ? (
                                                    <img
                                                        src={Endpoints.mediaBaseUrl + course.logo}
                                                        alt={course.title}
                                                        className="w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <BookOpen className="w-12 h-12 text-blue-400" />
                                                    </div>
                                                )}

                                                {/* Intro Video Badge */}
                                                {/* {course.introVideo && (
                                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                                                    <Play className="w-3 h-3 text-blue-600" />
                                                </div>
                                            )} */}

                                                {/* Discount Badge */}
                                                {/* {course.discount && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                    {course.discount}% OFF
                                                </div>
                                            )} */}
                                            </div>

                                            {/* Course Content */}
                                            <div className="p-2 sm:p-2.5 md:p-3">
                                                {/* Course Title */}
                                                <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-1.5 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                                                    {course.title}
                                                </h3>

                                                {/* Short Description */}
                                                {course.shortDescription && (
                                                    <p className="text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2 line-clamp-2">
                                                        {course.shortDescription}
                                                    </p>
                                                )}

                                                {/* Course Stats */}
                                                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 text-[9px] sm:text-[10px] text-gray-500">
                                                    {course.totalVideos && (
                                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                                            <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            <span>{course.totalVideos}</span>
                                                        </div>
                                                    )}
                                                    {course.totalWatchHours && (
                                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            <span>{course.totalWatchHours}h</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                                                    {course.tags?.filter(tag => tag.availableApp).slice(0, 2).map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full font-medium"
                                                        >
                                                            {tag.tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Price and Action */}
                                                <div className="flex items-center justify-between pt-1.5 sm:pt-2 md:pt-2.5 border-t border-gray-100">
                                                    <div>
                                                        {priceInfo && priceInfo.finalPrice > 0 ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                <div className="flex items-baseline gap-0.5 sm:gap-1">
                                                                    <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                                        ₹{priceInfo.finalPrice.toFixed(0)}
                                                                    </span>
                                                                    {priceInfo.discount > 0 && (
                                                                        <span className="text-[10px] text-gray-400 line-through">
                                                                            ₹{priceInfo.originalPrice.toFixed(0)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {priceInfo.discount > 0 && (
                                                                    <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded inline-block w-fit">
                                                                        {priceInfo.discount}% OFF
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </div>

                                                    {/* Add to Cart Button */}
                                                    <button
                                                        onClick={() => onCourseClick && onCourseClick(course)}
                                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg font-medium text-[10px] sm:text-[11px] hover:shadow-lg transition-all duration-300 flex items-center gap-1 sm:gap-1.5"
                                                    >
                                                        <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        Explore
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Right Scroll Button */}
                        {filteredCourses.length > 3 && (
                            <button
                                onClick={scrollRight}
                                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-700" />
                            </button>
                        )}
                    </div>

                    {/* View All Button */}
                    <div className="text-center mt-6 sm:mt-7 md:mt-8">
                        <button
                            onClick={() => onCourseClick && onCourseClick(null)}
                            className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
                        >
                            <span>✨ Explore Store</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </div>
        </>
    );
};

export default CoursesByTag;
