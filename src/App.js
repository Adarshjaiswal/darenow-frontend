import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import RestaurantProtectedRoute from './components/RestaurantProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import RestaurantList from './pages/RestaurantList';
import CreateRestaurant from './pages/CreateRestaurant';
import EditRestaurant from './pages/EditRestaurant';
import RestaurantDetails from './pages/RestaurantDetails';
import RestaurantLogin from './pages/RestaurantLogin';
import BookingsList from './pages/BookingsList';
import CreateBooking from './pages/CreateBooking';
import UpdatePassword from './pages/UpdatePassword';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-16">
              <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurants"
                element={
                  <ProtectedRoute>
                    <RestaurantList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurants/create"
                element={
                  <ProtectedRoute>
                    <CreateRestaurant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurants/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditRestaurant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurants/:id"
                element={
                  <ProtectedRoute>
                    <RestaurantDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/update-password"
                element={
                  <ProtectedRoute>
                    <UpdatePassword />
                  </ProtectedRoute>
                }
              />
              {/* Restaurant Routes */}
              <Route path="/restaurant/login" element={<RestaurantLogin />} />
              <Route
                path="/restaurant/bookings"
                element={
                  <RestaurantProtectedRoute>
                    <BookingsList />
                  </RestaurantProtectedRoute>
                }
              />
              <Route
                path="/restaurant/create-booking"
                element={
                  <RestaurantProtectedRoute>
                    <CreateBooking />
                  </RestaurantProtectedRoute>
                }
              />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
