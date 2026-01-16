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

// Add custom styles for HTML content
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

const AnnouncementDialog = ({ announcement, onClose }) => {
  // Close dialog when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close dialog on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Announcement Details</h2>
              <p className="text-sm text-gray-500">Complete information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/50 rounded-full transition-colors duration-200 group"
          >
            <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {announcement.title || 'Important Announcement'}
            </h3>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {announcement.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span>Published: {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}

              {announcement.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <span>Time: {new Date(announcement.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              )}

              {announcement.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-indigo-500" />
                  <span>By: {announcement.author}</span>
                </div>
              )}

              <div className={`px-2 py-1 rounded-full text-xs font-medium ${announcement.status
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                }`}>
                {announcement.status ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Announcement Image */}
          {/* {announcement.image && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-2 border border-gray-200">
                <img 
                  src={`https://media.theoogway.com/${announcement.image}`} 
                  alt={announcement.title || 'Announcement Image'}
                  className="w-full h-auto rounded-lg object-cover max-h-64"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )} */}

          {/* Description/Content */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Announcement Details</h4>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
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
            </div>
          </div>
          
          {/* Raw Data (for debugging - can be removed in production) */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="mb-4">
              <details className="bg-gray-100 rounded-lg p-3">
                <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-800">
                  Raw Data (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(announcement, null, 2)}
                </pre>
              </details>
            </div>
          )} */}
        </div>

        {/* Footer */}
        {/* <div className="flex items-center justify-end gap-3 p-6 bg-gray-50/50 border-t border-gray-200/30">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white/80 hover:bg-white border border-gray-200 rounded-lg transition-colors duration-200 hover:shadow-sm"
          >
            Close
          </button>
          <button
            onClick={() => {
              // You can add functionality here like sharing or bookmarking
              console.log('Bookmark/Share announcement:', announcement);
            }}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all duration-200 hover:shadow-md"
          >
            Bookmark
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default AnnouncementDialog;