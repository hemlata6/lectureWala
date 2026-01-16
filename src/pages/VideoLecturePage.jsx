import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import Network from '../context/Network';
import instId from '../context/instituteId';

const VideoLecturePage = ({ onPageChange }) => {
    const [domains, setDomains] = useState([]);
    const [currentLevel, setCurrentLevel] = useState('first');
    const [selectedParentDomain, setSelectedParentDomain] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            setLoading(true);
            const response = await Network.fetchDomain(instId);
            const availableDomains = response?.domains || [];
            setDomains(availableDomains);
            console.log('Fetched domains:', availableDomains);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching domains:', error);
            setLoading(false);
        }
    };

    const shouldShowSecondLevel = domains.length === 1;
    const firstLevelDomains = shouldShowSecondLevel ? domains[0].child || [] : domains;
    const secondLevelDomains = selectedParentDomain?.child || [];

    const handleFirstLevelClick = (domain) => {
        if (shouldShowSecondLevel) {
            onPageChange('store', {
                selectedDomain: domain,
                selectedExamStage: null,
                productType: 'lecture'
            });
        } else {
            if (domain.child && domain.child.length > 0) {
                setSelectedParentDomain(domain);
                setCurrentLevel('second');
            }
        }
    };

    const handleSecondLevelClick = (domain) => {
        if (selectedParentDomain) {
            onPageChange('store', {
                selectedDomain: domain,
                selectedExamStage: null,
                productType: 'lecture'
            });
        }
    };

    const handleBackToFirst = () => {
        setCurrentLevel('first');
        setSelectedParentDomain(null);
    };

    if (loading) {
        return (
            <section className="bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-blue-600"></div>
                    <p className="text-gray-500">Loading courses...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <div className="max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => onPageChange('home')}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back Home
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Video Lectures</h1>
                    <p className="text-slate-600 text-xs sm:text-sm max-w-xl">
                        {shouldShowSecondLevel
                            ? 'Explore comprehensive video lectures tailored to your course level'
                            : 'Select your course category to get started with premium video content'}
                    </p>
                </div>

                {/* Back Button for Second Level */}
                {currentLevel === 'second' && (
                    <button
                        onClick={handleBackToFirst}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Categories
                    </button>
                )}

                {/* First Level Grid */}
                {currentLevel === 'first' && (
                    <div>
                        {firstLevelDomains.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                                {firstLevelDomains.map((domain) => (
                                    <div
                                        key={domain.id}
                                        onClick={() => handleFirstLevelClick(domain)}
                                        className="group cursor-pointer rounded-xl border border-slate-200 bg-white hover:border-indigo-300 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                    >
                                        {/* Card Header with Gradient */}
                                        <div className="h-36 bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                                            </div>
                                            <div className="relative h-full flex items-center justify-center">
                                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <Play className="w-7 h-7 text-white fill-white" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-4 sm:p-5">
                                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                                                {domain.name}
                                            </h3>
                                            {!shouldShowSecondLevel && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500">
                                                        {domain.child?.length || 0} levels
                                                    </span>
                                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                                </div>
                                            )}
                                            {shouldShowSecondLevel && (
                                                <button className="w-full mt-2 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-md transition-colors">
                                                    View Lectures
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-600 text-sm">No categories available</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Second Level Grid */}
                {currentLevel === 'second' && selectedParentDomain && (
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
                            {selectedParentDomain.name}
                        </h2>
                        <p className="text-slate-600 text-xs sm:text-sm mb-5">Select a level to explore video lectures</p>
                        {secondLevelDomains.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                                {secondLevelDomains.map((domain) => (
                                    <div
                                        key={domain.id}
                                        onClick={() => handleSecondLevelClick(domain)}
                                        className="group cursor-pointer rounded-xl border border-slate-200 bg-white hover:border-emerald-300 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                    >
                                        {/* Card Header with Gradient */}
                                        <div className="h-36 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                                            </div>
                                            <div className="relative h-full flex items-center justify-center">
                                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <Play className="w-7 h-7 text-white fill-white" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-4 sm:p-5">
                                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 mb-3 group-hover:text-emerald-600 transition-colors">
                                                {domain.name}
                                            </h3>
                                            <button className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-md transition-colors">
                                                Access Videos
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-600 text-sm">No levels available</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default VideoLecturePage;
