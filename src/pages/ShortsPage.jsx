import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext';
import Network from '../context/Network';
import Endpoints from '../context/endpoints';
import {
    Play,
    Eye,
    Clock,
    ChevronLeft,
    ChevronRight,
    Film,
    Heart,
    Share,
    MoreVertical
} from 'lucide-react';
import instId from '../context/instituteId';
import { all } from 'axios';

const ShortsPage = () => {

    const { authToken } = useAuth();
    const [shortsList, setShortsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const fetchShorts = async () => {
        setLoading(true);
        try {
            let body = {
                page: 0,
                pageSize: 500 // Get more videos at once
            };
            let response = await Network.getStudentShortsApi(instId, body);
            // console.log('Shorts API Response:', response);

            if (response && Array.isArray(response) && response?.videos?.length > 0) {
                const allVideos = response?.videos;

                setShortsList(allVideos);
            } else if (response && Array.isArray(response?.videos)) {
                const allVideos = response?.videos;
                setShortsList(allVideos);
            } else {
                // Use mock data if API doesn't return data
                setShortsList([]);
            }
        } catch (error) {
            console.log('Error fetching shorts:', error);
            // Fallback to mock data on error
            setShortsList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        setIsVisible(true);
        fetchShorts();
    }, []);

    const formatDuration = (duration) => {
        return duration || "0:30";
    };

    const formatViews = (views) => {
        return views || "1K";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Film className="w-10 h-10 text-red-500" />
                        <h1 className="text-4xl font-bold text-gray-900">
                            📱 Educational Student Feedback
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Quick, engaging educational content to learn on the go - just like YouTube Student Feedback!
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                        <span className="ml-3 text-gray-600">Loading Student Feedback...</span>
                    </div>
                )}

                {/* Shorts Grid - 4x4 Layout */}
                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                        {shortsList.map((short, index) => (
                            <div
                                key={short.id || index}
                                className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {/* Video Container */}
                                <div className="relative aspect-[9/16] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                    {short.video ? (
                                        <video
                                            src={Endpoints.mediaBaseUrl + short.video}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            controls
                                            poster={short.thumbnail || undefined}
                                        // onError={(e) => {
                                        //     console.log('Video failed to load:', e.target.src);
                                        // }}
                                        />
                                    ) : (
                                        <img
                                            src={short.thumbnail || `https://images.unsplash.com/photo-${1516321318423 + index}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                                            alt={short.caption || short.title || `Short ${index + 1}`}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    )}


                                    {/* Views Badge */}
                                    {/* <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {formatViews(short.views)}
                                    </div> */}
                                </div>

                                {/* Content Section */}
                                {/* <div className="p-4">
                                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight">
                                        {short.caption || short.title || `Educational Short ${index + 1}`}
                                    </h3>
                                    
                                    {short.domains && short.domains.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {short.domains.slice(0, 2).map((domain, domainIndex) => (
                                                <span key={domain.id} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                                    {domain.name}
                                                </span>
                                            ))}
                                            {short.domains.length > 2 && (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                                    +{short.domains.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div> */}
                            </div>
                        ))}
                    </div>
                )}

                {/* No Shorts Found */}
                {!loading && shortsList.length === 0 && (
                    <div className="text-center py-16">
                        <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Available</h3>
                        <p className="text-gray-500">Check back later for new educational Student Feedback content.</p>
                    </div>
                )}



                {/* Stats Section */}
                {/* <div className="flex justify-center items-center gap-8 mt-12">
                    <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                        <div className="text-3xl font-bold text-red-500">{shortsList.length}</div>
                        <div className="text-sm text-gray-600">Shorts on Page</div>
                    </div>
                    <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                        <div className="text-3xl font-bold text-blue-500">{totalPages}</div>
                        <div className="text-sm text-gray-600">Total Pages</div>
                    </div>
                    <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                        <div className="text-3xl font-bold text-green-500">HD</div>
                        <div className="text-sm text-gray-600">Quality</div>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default ShortsPage