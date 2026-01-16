import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Clock, BookOpen, Play } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Network from '../../context/Network';
import instId from '../../context/instituteId';
import Endpoints from '../../context/endpoints';

const MobileCoursesSlider = ({ onCourseClick, onAddToCart }) => {
    const [domains, setDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [flattenedDomains, setFlattenedDomains] = useState([]);
    const [tags, setTags] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [loading, setLoading] = useState(true);

    // Extract only child domains (not parent domains)
    const getChildDomains = (domainsArray) => {
        const children = [];

        if (Array.isArray(domainsArray)) {
            domainsArray.forEach(domain => {
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

            // Set "CA Intermediate" as default domain
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

    const filterCoursesByDomain = (domainId) => {
        setSelectedDomain(domainId);
        const filtered = courses.filter(course => {
            return course.domain && course.domain.some(d => d.id === domainId);
        });
        setFilteredCourses(filtered);
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

    // Custom Arrow Components for Slider
    const NextArrow = ({ onClick }) => (
        <button
            onClick={onClick}
            className="
        absolute -right-8 top-1/2 -translate-y-1/2
        w-8 h-8 rounded-full bg-white shadow-md 
        flex items-center justify-center
        transition-all duration-200 
        hover:shadow-lg hover:scale-110
        border border-blue-200
        z-20
      "
        >
            <ChevronRight className="w-5 h-5 text-blue-600" />
        </button>
    );

    const PrevArrow = ({ onClick }) => (
        <button
            onClick={onClick}
            className="
        absolute -left-8 top-1/2 -translate-y-1/2
        w-8 h-8 rounded-full bg-white shadow-md
        flex items-center justify-center
        transition-all duration-200
        hover:shadow-lg hover:scale-110
        border border-blue-200
        z-20
      "
        >
            <ChevronLeft className="w-5 h-5 text-blue-600" />
        </button>
    );

    const settings = {
        dots: false,
        infinite: filteredCourses?.length > 1,
        speed: 400,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
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
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 w-full py-2 md:hidden">
            <div className="max-w-full mx-auto px-2 w-full">
                {/* Section Header */}
                <div className="text-center mb-4">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 px-2">
                        Most Loved Courses
                    </h2>
                    <p className="text-xs text-gray-600 max-w-2xl mx-auto px-2">
                        Explore our most loved courses - handpicked by our community
                    </p>
                </div>

                {/* Domain Filter Buttons */}
                {flattenedDomains.length > 0 && (
                    <div className="mb-4 flex justify-center pb-2">
                        <div className="flex flex-wrap gap-2 justify-center px-2">
                            {flattenedDomains.map((domain) => (
                                <button
                                    key={domain.id}
                                    onClick={() => filterCoursesByDomain(domain.id)}
                                    className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${selectedDomain === domain.id
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

                {/* Course Cards Slider */}
                {filteredCourses.length > 0 ? (
                    <div className="max-w-[320px] mx-auto relative px-2 pb-4">
                        <Slider {...settings}>
                            {filteredCourses.map((course) => {
                                const priceInfo = getLowestPrice(course.coursePricing);

                                return (
                                    <div key={course.id} className="px-1">
                                        <div
                                            onClick={() => onCourseClick && onCourseClick(course)}
                                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                                        >
                                            {/* Course Image */}
                                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 h-40">
                                                {course.logo ? (
                                                    <img
                                                        src={Endpoints.mediaBaseUrl + course.logo}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <BookOpen className="w-10 h-10 text-blue-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Course Content */}
                                            <div className="p-2">
                                                {/* Course Title */}
                                                <h3 className="text-xs font-bold text-gray-900 mb-1 line-clamp-2">
                                                    {course.title}
                                                </h3>

                                                {/* Short Description */}
                                                {course.shortDescription && (
                                                    <p className="text-[10px] text-gray-600 mb-1.5 line-clamp-2">
                                                        {course.shortDescription}
                                                    </p>
                                                )}

                                                {/* Course Stats */}
                                                <div className="flex items-center gap-2 mb-1.5 text-[9px] text-gray-500">
                                                    {course.totalVideos && (
                                                        <div className="flex items-center gap-0.5">
                                                            <Play className="w-2.5 h-2.5" />
                                                            <span>{course.totalVideos}</span>
                                                        </div>
                                                    )}
                                                    {course.totalWatchHours && (
                                                        <div className="flex items-center gap-0.5">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            <span>{course.totalWatchHours}h</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-1 mb-2">
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
                                                <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                                                    <div>
                                                        {priceInfo && priceInfo.finalPrice > 0 ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                <div className="flex items-baseline gap-0.5">
                                                                    <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                                        ₹{priceInfo.finalPrice.toFixed(0)}
                                                                    </span>
                                                                    {priceInfo.discount > 0 && (
                                                                        <span className="text-[9px] text-gray-400 line-through">
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onCourseClick && onCourseClick(course);
                                                        }}
                                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded-md font-medium text-[10px] hover:shadow-lg transition-all duration-300 flex items-center gap-1"
                                                    >
                                                        <ShoppingCart className="w-2.5 h-2.5" />
                                                        Explore
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </Slider>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-xs px-4">No courses available for this category</p>
                    </div>
                )}

                {/* View All Button */}
                <div className="text-center mt-4 px-2">
                    <button
                        onClick={() => onCourseClick && onCourseClick(null)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <span>✨ Explore Store</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .slick-slide {
                    opacity: 0.3;
                    transition: opacity 0.3s ease;
                }
                .slick-slide.slick-active {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default MobileCoursesSlider;
