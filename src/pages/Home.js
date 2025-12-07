import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [error, setError] = useState('');

  const fetchRestaurants = useCallback(async (search = '', page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      // Use "Res" for restaurant type when search is empty, otherwise use the search term
      const searchQuery = search.trim();
      const searchParam = searchQuery || 'Res';
      const response = await api.get(
        `/place/search/${encodeURIComponent(searchParam)}/pageNo/${page}/pageSize/12`
      );
      
      // Handle different possible response structures
      const restaurantsData = response.data?.data || response.data || [];
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
    } catch (error) {
      // Don't show error for 401 on home page - just show empty list
      if (error.response?.status === 401) {
        console.log('Authentication required for restaurant search');
        setRestaurants([]);
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to fetch restaurants');
        console.error('Error fetching restaurants:', error);
        setRestaurants([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchRestaurants('', 1);
  }, [fetchRestaurants]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        setCurrentSearch(searchTerm);
        fetchRestaurants(searchTerm, 1);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentSearch, fetchRestaurants]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentSearch(searchTerm);
    fetchRestaurants(searchTerm, 1);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Restaurants
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Find the perfect dining experience near you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Restaurant</h2>
            <p className="text-gray-600">Search through our curated collection of restaurants</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          
          {error && (
            <div className="max-w-md mx-auto mt-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Featured Restaurants */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Restaurants</h2>
            <p className="text-gray-600">Discover some of our top-rated restaurants</p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant) => (
                <div key={restaurant.placeId || restaurant.id || restaurant._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {restaurant.logo && (
                    <img
                      src={restaurant.logo}
                      alt={restaurant.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  {!restaurant.logo && restaurant.detailImage && (
                    <img
                      src={Array.isArray(restaurant.detailImage) ? restaurant.detailImage[0] : restaurant.detailImage}
                      alt={restaurant.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{restaurant.name}</h3>
                    <p className="text-gray-600 mb-2">{restaurant.address || restaurant.location || 'N/A'}</p>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{restaurant.description || 'No description available'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-500 font-semibold">
                        {'★'.repeat(Math.floor(restaurant.ratting || 0))}
                        {'☆'.repeat(5 - Math.floor(restaurant.ratting || 0))}
                      </span>
                      {restaurant.forTwo && (
                        <span className="text-gray-500 text-sm">₹{restaurant.forTwo} for two</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && restaurants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm ? `No restaurants found matching "${searchTerm}".` : 'No restaurants available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;