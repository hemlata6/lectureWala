import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Network from '../context/Network';
import Endpoints from '../context/endpoints';
import {
    Heart,
    MessageCircle,
    Share,
    MoreHorizontal,
    Send,
    X,
    Trash2,
    User,
    Clock,
    Eye,
    Plus,
    RefreshCw
} from 'lucide-react';

const FeedsPage = () => {
    const { authToken } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    
    // Comments Dialog State
    const [showCommentsDialog, setShowCommentsDialog] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [addingComment, setAddingComment] = useState(false);
    
    // Snackbar State
    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'success' // 'success' or 'error'
    });

    const PAGE_SIZE = 10;

    // Snackbar Functions
    const showSnackbar = (message, type = 'success') => {
        setSnackbar({ show: true, message, type });
        setTimeout(() => {
            setSnackbar(prev => ({ ...prev, show: false }));
        }, 4000);
    };

    const hideSnackbar = () => {
        setSnackbar(prev => ({ ...prev, show: false }));
    };

    // Fetch Posts
    const fetchPosts = async (page = 0, append = false) => {
        if (!authToken) return;
        
        setLoading(true);
        try {
            const body = {
                page: page,
                pageSize: PAGE_SIZE
            };
            
            const response = await Network.getMyPortfolio(authToken, body);
            console.log('Posts API Response:', response);
            
            if (response?.status && response?.posts) {
                if (append) {
                    setPosts(prev => [...prev, ...response.posts]);
                } else {
                    setPosts(response.posts);
                }
                
                setHasMore(response.posts.length === PAGE_SIZE);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Comments for a specific post
    const fetchComments = async (postId) => {
        if (!authToken || !postId) return;
        
        setLoadingComments(true);
        try {
            const response = await Network.getStudentFetchComment(authToken, postId);
            console.log('Comments API Response:', response);
            
            if (response?.status && response?.comments) {
                setComments(response.comments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    // Add Comment
    const addComment = async () => {
        if (!authToken || !selectedPost || !newComment.trim()) return;
        
        setAddingComment(true);
        try {
            const body = {
                comment: newComment.trim(),
                postId: selectedPost.id
            };
            
            const response = await Network.addStudentComment(authToken, body);
            console.log('Add Comment Response:', response);
            
            if (response?.status) {
                setNewComment('');
                // Refresh comments
                await fetchComments(selectedPost.id);
                // Refresh posts to update comment count
                await fetchPosts(0, false);
                showSnackbar('Comment added successfully! 💬', 'success');
            } else {
                showSnackbar('Failed to add comment. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            showSnackbar('Error adding comment. Please check your connection.', 'error');
        } finally {
            setAddingComment(false);
        }
    };

    // Delete Comment
    const deleteComment = async (commentId) => {
        if (!authToken || !commentId) return;
        
        try {
            const response = await Network.deleteStudentComment(authToken, commentId);
            console.log('Delete Comment Response:', response);
            
            if (response?.status) {
                // Refresh comments
                await fetchComments(selectedPost.id);
                // Refresh posts to update comment count
                await fetchPosts(0, false);
                showSnackbar('Comment deleted successfully! 🗑️', 'success');
            } else {
                showSnackbar('Failed to delete comment. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            showSnackbar('Error deleting comment. Please check your connection.', 'error');
        }
    };

    // Delete Post
    const deletePost = async (postId) => {
        if (!authToken || !postId) return;
        
        try {
            const response = await Network.deleteStudentPost(authToken, postId);
            console.log('Delete Post Response:', response);
            
            if (response?.status) {
                // Refresh posts
                await fetchPosts(0, false);
                // Close dialog if open
                if (showCommentsDialog && selectedPost?.id === postId) {
                    setShowCommentsDialog(false);
                    setSelectedPost(null);
                }
                showSnackbar('Post deleted successfully! 🗑️', 'success');
            } else {
                showSnackbar('Failed to delete post. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            showSnackbar('Error deleting post. Please check your connection.', 'error');
        }
    };

    // Like/Unlike Post
    const toggleLike = async (postId) => {
        if (!authToken || !postId) return;
        
        try {
            const response = await Network.getStudentLikeUnlikePost(authToken, postId);
            console.log('Like/Unlike Response:', response);
            
            if (response?.status) {
                // Refresh posts to update like status and count
                await fetchPosts(0, false);
                // Don't show success message for likes as it's too frequent
            } else {
                showSnackbar('Failed to update like. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            showSnackbar('Error updating like. Please check your connection.', 'error');
        }
    };

    // Open Comments Dialog
    const openCommentsDialog = (post) => {
        setSelectedPost(post);
        setShowCommentsDialog(true);
        fetchComments(post.id);
    };

    // Close Comments Dialog
    const closeCommentsDialog = () => {
        setShowCommentsDialog(false);
        setSelectedPost(null);
        setComments([]);
        setNewComment('');
    };

    // Load More Posts
    const loadMorePosts = () => {
        if (!loading && hasMore) {
            fetchPosts(currentPage + 1, true);
        }
    };

    // Format timestamp to show date
    const formatTimestamp = (timestamp) => {
        try {
            const date = new Date(timestamp);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Check if it's today
            if (date.toDateString() === today.toDateString()) {
                return 'Today';
            }
            
            // Check if it's yesterday
            if (date.toDateString() === yesterday.toDateString()) {
                return 'Yesterday';
            }
            
            // Format as date for older posts
            const options = { 
                day: 'numeric', 
                month: 'short',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            };
            
            return date.toLocaleDateString('en-US', options);
        } catch {
            return 'Unknown date';
        }
    };

    // Initialize
    useEffect(() => {
        fetchPosts(0, false);
    }, [authToken]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-6">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📱 Social Feed</h1>
                    <button
                        onClick={() => fetchPosts(0, false)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="sm:inline">Refresh</span>
                    </button>
                </div>

                {/* Posts Feed */}
                <div className="space-y-4 sm:space-y-6">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Post Header */}
                            <div className="p-3 sm:p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                        {post.createdByProfile ? (
                                            <img
                                                src={Endpoints.mediaBaseUrl + post.createdByProfile}
                                                alt={post.createdByName}
                                                className="w-full h-full rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{post.createdByName || 'Unknown User'}</h3>
                                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                                            <Clock className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{formatTimestamp(post.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => deletePost(post.id)}
                                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-2"
                                >
                                    <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                                </button>
                            </div>

                            {/* Post Content */}
                            {post.postBody && (
                                <div className="px-3 sm:px-4 pb-3">
                                    <p className="text-gray-800 leading-relaxed text-sm sm:text-base break-words">{post.postBody}</p>
                                </div>
                            )}

                            {/* Post Media */}
                            {post.postPicture && (
                                <div className="relative bg-gray-900">
                                    <img
                                        src={Endpoints.mediaBaseUrl + post.postPicture}
                                        alt="Post content"
                                        className="w-full max-h-64 sm:max-h-80 lg:max-h-96 object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {post.postVideo && (
                                <div className="relative bg-gray-900">
                                    <video
                                        src={Endpoints.mediaBaseUrl + post.postVideo}
                                        className="w-full max-h-64 sm:max-h-80 lg:max-h-96 object-contain"
                                        controls
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Post Actions */}
                            <div className="p-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => toggleLike(post.id)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                                                post.isLiked || post.liked
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            <Heart className={`w-5 h-5 ${post.isLiked || post.liked ? 'fill-current' : ''}`} />
                                            <span className="font-medium">{post.likes || 0}</span>
                                        </button>
                                        
                                        <button
                                            onClick={() => openCommentsDialog(post)}
                                            className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="font-medium">{post.comments || 0}</span>
                                        </button>
                                        
                                        {/* <button className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                                            <Share className="w-5 h-5" />
                                        </button> */}
                                    </div>
                                </div>

                                {/* Latest Comment Preview */}
                                {post.comments > 0 && (
                                    <div className="mb-2 sm:mb-3">
                                        <button
                                            onClick={() => openCommentsDialog(post)}
                                            className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            View all {post.comments} comments
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                    <div className="flex justify-center mt-6 sm:mt-8">
                        <button
                            onClick={loadMorePosts}
                            disabled={loading}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto max-w-xs"
                        >
                            {loading ? 'Loading...' : 'Load More Posts'}
                        </button>
                    </div>
                )}

                {/* No Posts Message */}
                {!loading && posts.length === 0 && (
                    <div className="text-center py-8 sm:py-12 px-4">
                        <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Posts Yet</h3>
                        <p className="text-sm sm:text-base text-gray-500">Be the first to share something!</p>
                    </div>
                )}
            </div>

            {/* Comments Dialog */}
            {showCommentsDialog && selectedPost && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col">
                        {/* Dialog Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                                <h3 className="text-base sm:text-lg font-semibold">Comments</h3>
                                <span className="text-xs sm:text-sm text-gray-500">({comments.length})</span>
                            </div>
                            <button
                                onClick={closeCommentsDialog}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                            {loadingComments ? (
                                <div className="flex justify-center py-6 sm:py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex items-start gap-2 sm:gap-3 group">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                            {comment.commentedByProfile ? (
                                                <img
                                                    src={Endpoints.mediaBaseUrl + comment.commentedByProfile}
                                                    alt={comment.commentedByName}
                                                    className="w-full h-full rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="bg-gray-100 rounded-2xl px-3 sm:px-4 py-2">
                                                <h4 className="font-medium text-xs sm:text-sm text-gray-900 truncate">{comment.commentedByName}</h4>
                                                <p className="text-gray-800 text-sm sm:text-base break-words">{comment.comment}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                                                <span>{formatTimestamp(comment.createdAt)}</span>
                                                <button
                                                    onClick={() => deleteComment(comment.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 sm:py-8 text-gray-500 px-4">
                                    <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm sm:text-base">No comments yet. Be the first to comment!</p>
                                </div>
                            )}
                        </div>

                        {/* Add Comment Section */}
                        <div className="p-3 sm:p-4 border-t">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                addComment();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={addComment}
                                        disabled={!newComment.trim() || addingComment}
                                        className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full transition-colors flex-shrink-0"
                                    >
                                        {addingComment ? (
                                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Snackbar */}
            {snackbar.show && (
                <div className={`fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 px-4 sm:px-6 py-3 rounded-lg shadow-lg transition-all duration-300 max-w-sm sm:max-w-md mx-auto sm:mx-0 ${
                    snackbar.type === 'success' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                }`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="font-medium text-sm sm:text-base flex-1">{snackbar.message}</span>
                        <button
                            onClick={hideSnackbar}
                            className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedsPage;