import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRestaurant = useCallback(async () => {
    try {
      const response = await api.get(`/place/${id}`);
      const restaurantData = response.data?.data || response.data;
      setRestaurant(restaurantData);
    } catch (error) {
      setError('Failed to fetch restaurant details');
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await api.delete(`/place/${id}`);
        navigate('/restaurants');
      } catch (error) {
        setError(error.response?.data?.message || error.message || 'Failed to delete restaurant');
        console.error('Error deleting restaurant:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <Link
              to="/restaurants"
              className="text-blue-600 hover:text-blue-900"
            >
              ← Back to Restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <p className="text-gray-500 text-lg">Restaurant not found.</p>
            <Link
              to="/restaurants"
              className="text-blue-600 hover:text-blue-900"
            >
              ← Back to Restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <Link
              to="/restaurants"
              className="text-blue-600 hover:text-blue-900 mb-4 inline-block"
            >
              ← Back to Restaurants
            </Link>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
              <div className="flex space-x-3">
                <Link
                  to={`/restaurants/edit/${id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Mobile Number</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.mobileNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.description || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Type</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.placeType || 'RESTAURANT'}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Latitude</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.latitude || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Longitude</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.longitude || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Operating Hours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Opening Time</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.openingTime || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Closing Time</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.closingTime || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Meal Times */}
              {(restaurant.breakfast || restaurant.lunch || restaurant.dinner) && (
                <div className="mb-8 border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Meal Times</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {restaurant.breakfast && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Breakfast</label>
                        {restaurant.breakfast.available ? (
                          <p className="mt-1 text-sm text-gray-900">
                            {restaurant.breakfast.startTime} - {restaurant.breakfast.endTime}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">Not Available</p>
                        )}
                      </div>
                    )}
                    {restaurant.lunch && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Lunch</label>
                        {restaurant.lunch.available ? (
                          <p className="mt-1 text-sm text-gray-900">
                            {restaurant.lunch.startTime} - {restaurant.lunch.endTime}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">Not Available</p>
                        )}
                      </div>
                    )}
                    {restaurant.dinner && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Dinner</label>
                        {restaurant.dinner.available ? (
                          <p className="mt-1 text-sm text-gray-900">
                            {restaurant.dinner.startTime} - {restaurant.dinner.endTime}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">Not Available</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Price for Two</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.forTwo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Rating</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-yellow-500">
                        {'★'.repeat(Math.floor(restaurant.ratting || 0))}
                        {'☆'.repeat(5 - Math.floor(restaurant.ratting || 0))}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">({restaurant.ratting || 0})</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Offer Percentage</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.offerPercentage || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Coupon Percentage</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.couponPercentage || 'N/A'}</p>
                  </div>
                  {restaurant.tableBookingTerms && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500">Table Booking Terms</label>
                      <p className="mt-1 text-sm text-gray-900">{restaurant.tableBookingTerms}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;






