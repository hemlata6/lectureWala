import React, { useState, useEffect } from 'react';
import Network from '../../context/Network';
import instId from '../../context/instituteId';
import { useTheme } from '../../context/ThemeContext';

const CourseLevels = ({ onPageChange }) => {
    const { currentTheme } = useTheme();
    const isLogoTheme = currentTheme === 'logo';

    const [domains, setDomains] = useState([]);
    const [foundDomains, setFoundDomains] = useState({
        foundation: null,
        intermediate: null,
        final: null
    });
    const [loading, setLoading] = useState(true);
    const [comingSoon, setComingSoon] = useState(null);

    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            setLoading(true);
            const domainResponse = await Network.fetchDomain(instId);

            const availableDomains = domainResponse?.domains || [];
            setDomains(availableDomains);

            // Flatten and find specific domains
            const flattenedDomains = flattenDomains(availableDomains);

            // Find specific domain types
            const foundData = {
                foundation: flattenedDomains.find(d => d.name === 'CA Foundation') || null,
                intermediate: flattenedDomains.find(d => d.name === 'CA Intermediate') || null,
                final: flattenedDomains.find(d => d.name === 'CA Final') || null
            };

            setFoundDomains(foundData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching domains:', error);
            setLoading(false);
        }
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

    const handleExplore = (domainData, domainType) => {
        // Pass the selected domain to the store page only if domain exists
        if (domainData) {
            // Find the parent domain for CA Foundation/Intermediate/Final
            const flattenedDomains = flattenDomains(domains);
            const parentDomain = flattenedDomains.find(d => d.id === domainData.parentId);

            // Send both parent domain and selected exam stage
            onPageChange('store', {
                selectedDomain: parentDomain,
                selectedExamStage: domainData
            });
        } else {
            // Show coming soon message for 2 seconds
            setComingSoon(domainType);
            setTimeout(() => setComingSoon(null), 2000);
        }
    };

    if (loading) {
        return (
            <section className={`py-3 ${isLogoTheme ? 'bg-black' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-40 sm:h-48">
                        <div className={`animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 ${isLogoTheme ? 'border-yellow-500' : 'border-blue-600'}`}></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={`py-3 ${isLogoTheme ? 'bg-black' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 ${isLogoTheme
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                        }`}>
                        Choose Your Course Level
                    </h2>
                    <p className={`text-xs sm:text-sm max-w-2xl mx-auto px-4 ${isLogoTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        Select the level that matches your expertise and career goals
                    </p>
                </div>

                {/* Category Cards */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                    {/* Foundation Card */}
                    <div
                        onClick={() => handleExplore(foundDomains.foundation, 'foundation')}
                        className={`group cursor-pointer w-full sm:w-80 max-w-sm rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${foundDomains.foundation === null ? 'opacity-75' : ''
                            } ${isLogoTheme
                                ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-500/30 hover:border-yellow-500/60'
                                : 'bg-white'
                            }`}
                    >
                        <div className={`relative h-36 sm:h-48 overflow-hidden ${isLogoTheme
                                ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/20'
                                : 'bg-gradient-to-br from-green-100 to-green-200'
                            }`}>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 ${isLogoTheme
                                            ? 'bg-yellow-500/20 border-2 border-yellow-500/50'
                                            : 'bg-white/90'
                                        }`}>
                                        <svg className={`w-8 h-8 sm:w-10 sm:h-10 ${isLogoTheme ? 'text-yellow-500' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-xl sm:text-2xl font-bold ${isLogoTheme ? 'text-yellow-500' : 'text-green-700'}`}>FOUNDATION</h3>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <p className={`text-xs sm:text-sm text-center mb-3 sm:mb-4 ${isLogoTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                Perfect for beginners starting their learning journey
                            </p>
                            {comingSoon === 'foundation' && (
                                <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 text-xs sm:text-sm rounded-lg text-center font-semibold animate-pulse">
                                    Coming Soon
                                </div>
                            )}
                            <button className={`w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg ${foundDomains.foundation === null
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : isLogoTheme
                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black'
                                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                                }`}>
                                {foundDomains.foundation === null ? 'Coming Soon' : 'Explore Courses'}
                            </button>
                        </div>
                    </div>

                    {/* Intermediate Card */}
                    <div
                        onClick={() => handleExplore(foundDomains.intermediate, 'intermediate')}
                        className={`group cursor-pointer w-full sm:w-80 max-w-sm rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${foundDomains.intermediate === null ? 'opacity-75' : ''
                            } ${isLogoTheme
                                ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-500/30 hover:border-yellow-500/60'
                                : 'bg-white'
                            }`}
                    >
                        <div className={`relative h-36 sm:h-48 overflow-hidden ${isLogoTheme
                                ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/20'
                                : 'bg-gradient-to-br from-blue-100 to-blue-200'
                            }`}>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 ${isLogoTheme
                                            ? 'bg-yellow-500/20 border-2 border-yellow-500/50'
                                            : 'bg-white/90'
                                        }`}>
                                        <svg className={`w-8 h-8 sm:w-10 sm:h-10 ${isLogoTheme ? 'text-yellow-500' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-xl sm:text-2xl font-bold ${isLogoTheme ? 'text-yellow-500' : 'text-blue-700'}`}>INTERMEDIATE</h3>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <p className={`text-xs sm:text-sm text-center mb-3 sm:mb-4 ${isLogoTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                Build on your knowledge and advance your skills
                            </p>
                            {comingSoon === 'intermediate' && (
                                <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 text-xs sm:text-sm rounded-lg text-center font-semibold animate-pulse">
                                    Coming Soon
                                </div>
                            )}
                            <button className={`w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg ${foundDomains.intermediate === null
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : isLogoTheme
                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black'
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                                }`}>
                                {foundDomains.intermediate === null ? 'Coming Soon' : 'Explore Courses'}
                            </button>
                        </div>
                    </div>

                    {/* Final Card */}
                    <div
                        onClick={() => handleExplore(foundDomains.final, 'final')}
                        className={`group cursor-pointer w-full sm:w-80 max-w-sm rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${foundDomains.final === null ? 'opacity-75' : ''
                            } ${isLogoTheme
                                ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-500/30 hover:border-yellow-500/60'
                                : 'bg-white'
                            }`}
                    >
                        <div className={`relative h-36 sm:h-48 overflow-hidden ${isLogoTheme
                                ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/20'
                                : 'bg-gradient-to-br from-purple-100 to-purple-200'
                            }`}>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 ${isLogoTheme
                                            ? 'bg-yellow-500/20 border-2 border-yellow-500/50'
                                            : 'bg-white/90'
                                        }`}>
                                        <svg className={`w-8 h-8 sm:w-10 sm:h-10 ${isLogoTheme ? 'text-yellow-500' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-xl sm:text-2xl font-bold ${isLogoTheme ? 'text-yellow-500' : 'text-purple-700'}`}>FINAL</h3>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <p className={`text-xs sm:text-sm text-center mb-3 sm:mb-4 ${isLogoTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                Master advanced concepts and achieve excellence
                            </p>
                            {comingSoon === 'final' && (
                                <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 text-xs sm:text-sm rounded-lg text-center font-semibold animate-pulse">
                                    Coming Soon
                                </div>
                            )}
                            <button className={`w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg ${foundDomains.final === null
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : isLogoTheme
                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black'
                                        : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                                }`}>
                                {foundDomains.final === null ? 'Coming Soon' : 'Explore Courses'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CourseLevels;
