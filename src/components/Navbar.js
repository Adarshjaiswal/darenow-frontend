import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [isRestaurantLoggedIn, setIsRestaurantLoggedIn] = useState(false);

  useEffect(() => {
    // Check if restaurant is logged in
    const checkRestaurantLogin = () => {
      const restaurantToken = localStorage.getItem('restaurantToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (restaurantToken && restaurantData) {
        try {
          const parsedData = JSON.parse(restaurantData);
          const restaurantInfo = parsedData?.placeData || parsedData;
          setRestaurant(restaurantInfo);
          setIsRestaurantLoggedIn(true);
        } catch (e) {
          setIsRestaurantLoggedIn(false);
        }
      } else {
        setIsRestaurantLoggedIn(false);
      }
    };

    checkRestaurantLogin();

    // Listen for storage changes (when restaurant logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'restaurantToken' || e.key === 'restaurant') {
        checkRestaurantLogin();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus (when user switches back to tab)
    window.addEventListener('focus', checkRestaurantLogin);
    
    // Listen for custom logout and login events
    window.addEventListener('restaurantLogout', checkRestaurantLogin);
    window.addEventListener('restaurantLogin', checkRestaurantLogin);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkRestaurantLogin);
      window.removeEventListener('restaurantLogout', checkRestaurantLogin);
      window.removeEventListener('restaurantLogin', checkRestaurantLogin);
    };
  }, [location.pathname]); // Re-check when route changes

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRestaurantLogout = () => {
    localStorage.removeItem('restaurantToken');
    localStorage.removeItem('restaurant');
    setRestaurant(null);
    setIsRestaurantLoggedIn(false);
    // Trigger a custom event to update navbar in other components if needed
    window.dispatchEvent(new Event('restaurantLogout'));
    navigate('/restaurant/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">DareNow</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            {isRestaurantLoggedIn ? (
              <>
                <Link
                  to="/restaurant/bookings"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Bookings
                </Link>
                <Link
                  to="/restaurant/create-booking"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Create Booking
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 text-sm">Welcome, {restaurant?.name || 'Restaurant'}</span>
                  <button
                    onClick={handleRestaurantLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/restaurants"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Restaurants
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 text-sm">Welcome, {user?.name}</span>
                  <Link
                    to="/update-password"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Update Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/contact"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Contact
                </Link>
                <Link
                  to="/restaurant/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Restaurant Login
                </Link>
                <Link
                  to="/login"
                  className="bg-[#EB422B] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#EB422B]"
                >
                  Admin Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {isRestaurantLoggedIn ? (
                <>
                  <Link
                    to="/restaurant/bookings"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Bookings
                  </Link>
                  <Link
                    to="/restaurant/create-booking"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Booking
                  </Link>
                  <div className="px-3 py-2">
                    <span className="text-gray-700 text-sm">Welcome, {restaurant?.name || 'Restaurant'}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleRestaurantLogout();
                      setIsMenuOpen(false);
                    }}
                    className="bg-red-600 text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/restaurants"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Restaurants
                  </Link>
                  <div className="px-3 py-2">
                    <span className="text-gray-700 text-sm">Welcome, {user?.name}</span>
                  </div>
                  <Link
                    to="/update-password"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Update Password
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="bg-red-600 text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/contact"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <Link
                    to="/restaurant/login"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Restaurant Login
                  </Link>
                  <Link
                    to="/login"
                    className="bg-[#EB422B] text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-[#EB422B]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;