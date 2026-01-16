import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Video, 
  FileText, 
  Headphones,
  Star,
  Clock,
  Users,
  ChevronRight,
  Play
} from 'lucide-react';

const Content = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'programming', name: 'Programming' },
    { id: 'design', name: 'Design' },
    { id: 'business', name: 'Business' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'data-science', name: 'Data Science' }
  ];

  const contentTypes = [
    { id: 'all', name: 'All Types', icon: BookOpen },
    { id: 'video', name: 'Video Lessons', icon: Video },
    { id: 'article', name: 'Articles', icon: FileText },
    { id: 'podcast', name: 'Podcasts', icon: Headphones }
  ];

  const contentItems = [
    {
      id: 1,
      title: "Introduction to React Hooks",
      description: "Learn how to use React Hooks to manage state and side effects in your functional components.",
      type: "video",
      category: "programming",
      duration: "45 min",
      rating: 4.8,
      views: 12547,
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      level: "Intermediate",
      tags: ["React", "JavaScript", "Frontend"]
    },
    {
      id: 2,
      title: "UI/UX Design Principles",
      description: "Master the fundamental principles of user interface and user experience design.",
      type: "article",
      category: "design",
      duration: "15 min read",
      rating: 4.7,
      views: 8934,
      thumbnail: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      level: "Beginner",
      tags: ["UI/UX", "Design", "Figma"]
    },
    {
      id: 3,
      title: "Building a Startup from Scratch",
      description: "A comprehensive guide to starting your own business and scaling it successfully.",
      type: "podcast",
      category: "business",
      duration: "60 min",
      rating: 4.9,
      views: 15623,
      thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
      level: "Advanced",
      tags: ["Entrepreneurship", "Business", "Strategy"]
    },
    {
      id: 4,
      title: "Digital Marketing Trends 2024",
      description: "Stay ahead of the curve with the latest digital marketing trends and strategies.",
      type: "video",
      category: "marketing",
      duration: "32 min",
      rating: 4.6,
      views: 9876,
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1415&q=80",
      level: "Intermediate",
      tags: ["Marketing", "SEO", "Social Media"]
    },
    {
      id: 5,
      title: "Python for Data Analysis",
      description: "Learn how to analyze and visualize data using Python's powerful libraries.",
      type: "video",
      category: "data-science",
      duration: "55 min",
      rating: 4.8,
      views: 11234,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      level: "Intermediate",
      tags: ["Python", "Data Science", "Analytics"]
    },
    {
      id: 6,
      title: "Advanced CSS Techniques",
      description: "Master advanced CSS techniques including Grid, Flexbox, and animations.",
      type: "article",
      category: "programming",
      duration: "20 min read",
      rating: 4.5,
      views: 7654,
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
      level: "Advanced",
      tags: ["CSS", "Frontend", "Web Development"]
    }
  ];

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type) => {
    const typeObj = contentTypes.find(t => t.id === type);
    return typeObj ? typeObj.icon : BookOpen;
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Content</h1>
          <p className="text-lg text-gray-600">
            Explore our comprehensive library of learning materials and resources
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search content, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="lg:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {contentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="lg:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {contentTypes.map(type => {
            const Icon = type.icon;
            const isActive = selectedType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {type.name}
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredContent.length} of {contentItems.length} results
          </p>
        </div>

        {/* Content Grid */}
        {filteredContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map(item => {
              const TypeIcon = getTypeIcon(item.type);
              
              return (
                <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <div className="bg-white bg-opacity-90 rounded-full p-2">
                        <TypeIcon className="h-4 w-4 text-gray-700" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(item.level)}`}>
                        {item.level}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {item.duration}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {item.views.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {item.rating}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center group">
                      <span className="mr-2">
                        {item.type === 'video' ? 'Watch Now' : 
                         item.type === 'article' ? 'Read Article' : 
                         item.type === 'podcast' ? 'Listen Now' : 'View Content'}
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Content Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't find any content matching your search criteria. Try adjusting your filters or search terms.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Featured Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">New Content Added Weekly</h2>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Stay updated with the latest learning materials, tutorials, and industry insights. 
            Our content library is constantly growing to meet your learning needs.
          </p>
          <button className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-lg hover:bg-purple-50 transition-colors duration-200">
            Subscribe for Updates
          </button>
        </div>
      </div>
    </div>
  );
};

export default Content;