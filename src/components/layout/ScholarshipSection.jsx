import React from 'react';

const ScholarshipSection = ({ onPageChange }) => {
    return (
        <section className="bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                        Aurous Scholarship Program
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 px-4">
                        Access premium resources and compete for scholarships
                    </p>
                </div>

                {/* Scholarship Cards */}
                <div className="flex flex-wrap gap-4 sm:gap-6">
                    {/* Test Series Card */}
                    <div
                        // onClick={() => onPageChange('store')}
                        className="group cursor-pointer flex-1 min-w-[280px] bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-orange-200"
                    >
                        <div className="relative h-28 sm:h-32 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden">
                            <div className="text-center relative z-10">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/95 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-white">TEST SERIES</h3>
                            </div>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-600 text-xs text-center mb-3">
                                Practice with mock tests and improve your performance
                            </p>
                            <button className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-sm rounded-lg transition-all duration-300 hover:shadow-lg">
                                Start Practice
                            </button>
                        </div>
                    </div>

                    {/* Books Card */}
                    <div
                        // onClick={() => onPageChange('store')}
                        className="group cursor-pointer flex-1 min-w-[280px] bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-blue-200"
                    >
                        <div className="relative h-28 sm:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                            <div className="text-center relative z-10">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/95 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-white">BOOKS</h3>
                            </div>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                        </div>
                        <div className="p-3 sm:p-4">
                            <p className="text-gray-600 text-[10px] sm:text-xs text-center mb-2 sm:mb-3">
                                Access curated study materials and reference books
                            </p>
                            <button className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm rounded-lg transition-all duration-300 hover:shadow-lg">
                                Browse Books
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scholarship Banner */}
                <div className="mt-4 sm:mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <p className="text-xs sm:text-sm font-semibold text-gray-800">
                            Win Scholarships Worth ₹50,000+ • Excel and Unlock Opportunities
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ScholarshipSection;
