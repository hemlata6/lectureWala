import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, User, Eye, Share2, BookOpen } from 'lucide-react';
import Endpoints from '../context/endpoints';

const BlogPage = ({ blogData, onPageChange }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [blogContent, setBlogContent] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        setIsVisible(true);
        
        // Load blog content if available
        if (blogData?.blog?.blog) {
            // If blog content is a URL, fetch it
            if (typeof blogData.blog.blog === 'string' && blogData.blog.blog.includes('.html')) {
                fetchBlogContent(Endpoints.mediaBaseUrl + blogData.blog.blog);
            } else {
                // If it's direct HTML content
                setBlogContent(blogData.blog.blog);
            }
        }
    }, [blogData]);

    const fetchBlogContent = async (url) => {
        try {
            const response = await fetch(url);
            const htmlContent = await response.text();
            setBlogContent(htmlContent);
        } catch (error) {
            console.error('Error fetching blog content:', error);
            setBlogContent('<p>Error loading blog content.</p>');
        }
    };

    const handleGoBack = () => {
        onPageChange && onPageChange('content');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blogData?.title || 'Blog Post',
                text: blogData?.description || 'Check out this blog post',
                url: window.location.href,
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handleGoBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                            <span className="font-medium">Back to Resources</span>
                        </button>
                        
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </div>
            </div>

            {/* Blog Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <article className={`transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    {/* Blog Header */}
                    <header className="mb-8">
                        {/* Blog Image */}
                        {blogData?.thumb && (
                            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-6 shadow-lg">
                                <img
                                    src={Endpoints.mediaBaseUrl + blogData.thumb}
                                    alt={blogData?.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                        )}

                        {/* Blog Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {blogData?.title || 'Blog Post'}
                        </h1>

                        {/* Blog Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                            {blogData?.createdAt && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {new Date(blogData.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>Admin</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                <span>Free Resource</span>
                            </div>
                        </div>

                        {/* Blog Description */}
                        {blogData?.description && (
                            <p className="text-lg text-gray-700 mt-4 leading-relaxed">
                                {blogData.description}
                            </p>
                        )}
                    </header>

                    {/* Blog Content */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 md:p-8">
                            {blogContent ? (
                                <div 
                                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: blogContent }}
                                />
                            ) : (
                                <div className="flex items-center justify-center py-16">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading blog content...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Blog Footer */}
                    <footer className="mt-8 pt-8 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">Share this blog:</span>
                                <button
                                    onClick={handleShare}
                                    className="text-blue-600 hover:text-blue-700 transition-colors duration-300"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <button
                                onClick={handleGoBack}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                Back to Resources
                            </button>
                        </div>
                    </footer>
                </article>
            </div>
        </div>
    );
};

export default BlogPage;