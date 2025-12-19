import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const LAT_REGEX = /^-?(90(\.0+)?|[0-8]?\d(\.\d+)?)$/;
const LONG_REGEX = /^-?(180(\.0+)?|1[0-7]\d(\.\d+)?|[0-9]?\d(\.\d+)?)$/;
const PHONE_REGEX = /^\d{10}$/;

const EditRestaurant = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    email: '',
    mobileNumber: '',
    password: '',
    latitude: '',
    longitude: '',
    openingTime: '',
    closingTime: '',
    forTwo: '',
    offerPercentage: '',
    couponPercentage: '',
    interestId: 0,
    ratting: 0,
    placeType: 'RESTAURANT',
    tableBookingTerms: '',
    breakfast: {
      available: false,
      startTime: '',
      endTime: '',
    },
    lunch: {
      available: false,
      startTime: '',
      endTime: '',
    },
    dinner: {
      available: false,
      startTime: '',
      endTime: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [interests, setInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(true);
  
  // Image uploads
  const [logoImage, setLogoImage] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [detailImages, setDetailImages] = useState([]);
  const [detailPreviews, setDetailPreviews] = useState([]);
  const [existingDetailImages, setExistingDetailImages] = useState([]);
  const [foodMenuImages, setFoodMenuImages] = useState([]);
  const [foodMenuPreviews, setFoodMenuPreviews] = useState([]);
  const [existingFoodMenuImages, setExistingFoodMenuImages] = useState([]);
  const [beveragesMenuImages, setBeveragesMenuImages] = useState([]);
  const [beveragesMenuPreviews, setBeveragesMenuPreviews] = useState([]);
  const [existingBeveragesMenuImages, setExistingBeveragesMenuImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await api.get('/interest');
        setInterests(response.data || []);
      } catch (error) {
        console.error('Error fetching interests:', error);
      } finally {
        setLoadingInterests(false);
      }
    };
    fetchInterests();
  }, []);

  const fetchRestaurant = useCallback(async () => {
    try {
      const response = await api.get(`/place/${id}`);
      const restaurant = response.data?.data || response.data;
      
      setFormData({
        name: restaurant.name || '',
        address: restaurant.address || '',
        description: restaurant.description || '',
        email: restaurant.email || '',
        mobileNumber: restaurant.mobileNumber || '',
        latitude: restaurant.latitude || '',
        longitude: restaurant.longitude || '',
        openingTime: restaurant.openingTime || '',
        closingTime: restaurant.closingTime || '',
        forTwo: restaurant.forTwo || '',
        offerPercentage: restaurant.offerPercentage || '',
        couponPercentage: restaurant.couponPercentage || '',
        interestId: restaurant.interestId || 0,
        ratting: restaurant.ratting || 0,
        placeType: restaurant.placeType || 'RESTAURANT',
        tableBookingTerms: restaurant.tableBookingTerms || '',
        breakfast: restaurant.breakfast || {
          available: false,
          startTime: '',
          endTime: '',
        },
        lunch: restaurant.lunch || {
          available: false,
          startTime: '',
          endTime: '',
        },
        dinner: restaurant.dinner || {
          available: false,
          startTime: '',
          endTime: '',
        },
      });

      // Set existing images
      if (restaurant.logo) {
        setExistingLogo(restaurant.logo);
      }
      if (restaurant.detailImage) {
        setExistingDetailImages(Array.isArray(restaurant.detailImage) ? restaurant.detailImage : [restaurant.detailImage]);
      }
      if (restaurant.foodMenuImages) {
        setExistingFoodMenuImages(Array.isArray(restaurant.foodMenuImages) ? restaurant.foodMenuImages : [restaurant.foodMenuImages]);
      }
      if (restaurant.beveragesMenuImages) {
        setExistingBeveragesMenuImages(Array.isArray(restaurant.beveragesMenuImages) ? restaurant.beveragesMenuImages : [restaurant.beveragesMenuImages]);
      }
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

  // Helper function to convert time string (HH:MM) to minutes for comparison
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to check if two time ranges overlap
  const doTimesOverlap = (start1, end1, start2, end2) => {
    if (!start1 || !end1 || !start2 || !end2) return false;
    
    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);
    
    // Check if ranges overlap: start1 < end2 && start2 < end1
    return start1Min < end2Min && start2Min < end1Min;
  };

  // Helper function to check if a time is within a range (handles midnight crossover)
  const isTimeInRange = (time, rangeStart, rangeEnd) => {
    if (!time || !rangeStart || !rangeEnd) return false;
    
    const timeMin = timeToMinutes(time);
    const rangeStartMin = timeToMinutes(rangeStart);
    const rangeEndMin = timeToMinutes(rangeEnd);
    
    // Handle case where closing time is next day (e.g., 22:00 to 02:00)
    if (rangeEndMin < rangeStartMin) {
      // Range crosses midnight
      return timeMin >= rangeStartMin || timeMin <= rangeEndMin;
    } else {
      // Normal range within same day
      return timeMin >= rangeStartMin && timeMin <= rangeEndMin;
    }
  };

  const validateForm = () => {
    const trimmedEmail = formData.email?.toString().trim();
    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    const trimmedLatitude = formData.latitude?.toString().trim();
    if (trimmedLatitude && !LAT_REGEX.test(trimmedLatitude)) {
      setError('Please enter a valid latitude (-90 to 90)');
      return false;
    }

    const trimmedLongitude = formData.longitude?.toString().trim();
    if (trimmedLongitude && !LONG_REGEX.test(trimmedLongitude)) {
      setError('Please enter a valid longitude (-180 to 180)');
      return false;
    }

    const trimmedMobileNumber = formData.mobileNumber?.toString().trim();
    if (trimmedMobileNumber && !PHONE_REGEX.test(trimmedMobileNumber)) {
      setError('Mobile number must be exactly 10 digits');
      return false;
    }

    // Validate opening and closing time cannot be the same
    if (formData.openingTime && formData.closingTime) {
      if (formData.openingTime === formData.closingTime) {
        setError('Opening time and closing time cannot be the same');
        return false;
      }
    }

    // Validate meal timings - start time and end time cannot be the same
    if (formData.breakfast.available) {
      if (formData.breakfast.startTime && formData.breakfast.endTime) {
        if (formData.breakfast.startTime === formData.breakfast.endTime) {
          setError('Breakfast start time and end time cannot be the same');
          return false;
        }
      }
    }

    if (formData.lunch.available) {
      if (formData.lunch.startTime && formData.lunch.endTime) {
        if (formData.lunch.startTime === formData.lunch.endTime) {
          setError('Lunch start time and end time cannot be the same');
          return false;
        }
      }
    }

    if (formData.dinner.available) {
      if (formData.dinner.startTime && formData.dinner.endTime) {
        if (formData.dinner.startTime === formData.dinner.endTime) {
          setError('Dinner start time and end time cannot be the same');
          return false;
        }
      }
    }

    // Validate meal timings - check for overlaps between different meals
    if (formData.breakfast.available && formData.breakfast.startTime && formData.breakfast.endTime) {
      if (formData.lunch.available && formData.lunch.startTime && formData.lunch.endTime) {
        if (doTimesOverlap(
          formData.breakfast.startTime,
          formData.breakfast.endTime,
          formData.lunch.startTime,
          formData.lunch.endTime
        )) {
          setError('Breakfast and Lunch times cannot overlap');
          return false;
        }
      }
      if (formData.dinner.available && formData.dinner.startTime && formData.dinner.endTime) {
        if (doTimesOverlap(
          formData.breakfast.startTime,
          formData.breakfast.endTime,
          formData.dinner.startTime,
          formData.dinner.endTime
        )) {
          setError('Breakfast and Dinner times cannot overlap');
          return false;
        }
      }
    }

    if (formData.lunch.available && formData.lunch.startTime && formData.lunch.endTime) {
      if (formData.dinner.available && formData.dinner.startTime && formData.dinner.endTime) {
        if (doTimesOverlap(
          formData.lunch.startTime,
          formData.lunch.endTime,
          formData.dinner.startTime,
          formData.dinner.endTime
        )) {
          setError('Lunch and Dinner times cannot overlap');
          return false;
        }
      }
    }

    // Validate meal times must be within opening and closing time
    if (formData.openingTime && formData.closingTime) {
      // Validate breakfast times
      if (formData.breakfast.available) {
        if (formData.breakfast.startTime && !isTimeInRange(formData.breakfast.startTime, formData.openingTime, formData.closingTime)) {
          setError('Breakfast start time must be between opening and closing time');
          return false;
        }
        if (formData.breakfast.endTime && !isTimeInRange(formData.breakfast.endTime, formData.openingTime, formData.closingTime)) {
          setError('Breakfast end time must be between opening and closing time');
          return false;
        }
      }

      // Validate lunch times
      if (formData.lunch.available) {
        if (formData.lunch.startTime && !isTimeInRange(formData.lunch.startTime, formData.openingTime, formData.closingTime)) {
          setError('Lunch start time must be between opening and closing time');
          return false;
        }
        if (formData.lunch.endTime && !isTimeInRange(formData.lunch.endTime, formData.openingTime, formData.closingTime)) {
          setError('Lunch end time must be between opening and closing time');
          return false;
        }
      }

      // Validate dinner times
      if (formData.dinner.available) {
        if (formData.dinner.startTime && !isTimeInRange(formData.dinner.startTime, formData.openingTime, formData.closingTime)) {
          setError('Dinner start time must be between opening and closing time');
          return false;
        }
        if (formData.dinner.endTime && !isTimeInRange(formData.dinner.endTime, formData.openingTime, formData.closingTime)) {
          setError('Dinner end time must be between opening and closing time');
          return false;
        }
      }
    }

    const trimmedRating = formData.ratting?.toString().trim();
    if (trimmedRating) {
      const numericRating = Number(trimmedRating);
      const isInvalidRating = Number.isNaN(numericRating) || numericRating < 0 || numericRating > 5;
      if (isInvalidRating) {
        setError('Rating must be between 0 and 5');
        return false;
      }
    }

    const trimmedForTwo = formData.forTwo?.toString().trim();
    if (trimmedForTwo) {
      const validPrice = /^\d{1,5}$/;
      if (!validPrice.test(trimmedForTwo)) {
        setError('Price for Two must be numeric and up to 5 digits');
        return false;
      }
    }

    const trimmedOffer = formData.offerPercentage?.toString().trim();
    if (trimmedOffer) {
      const numericOffer = Number(trimmedOffer);
      const isInvalidOffer = Number.isNaN(numericOffer) || numericOffer < 0 || numericOffer > 100;
      if (isInvalidOffer) {
        setError('Offer percentage must be between 0 and 100');
        return false;
      }
    }

    const trimmedCoupon = formData.couponPercentage?.toString().trim();
    if (trimmedCoupon) {
      const numericCoupon = Number(trimmedCoupon);
      const isInvalidCoupon = Number.isNaN(numericCoupon) || numericCoupon < 0 || numericCoupon > 100;
      if (isInvalidCoupon) {
        setError('Coupon percentage must be between 0 and 100');
        return false;
      }
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('breakfast.') || name.startsWith('lunch.') || name.startsWith('dinner.')) {
      const [mealType, field] = name.split('.');
      setFormData({
        ...formData,
        [mealType]: {
          ...formData[mealType],
          [field]: type === 'checkbox' ? checked : value,
        },
      });
    } else {
    setFormData({
      ...formData,
        [name]: name === 'interestId' ? parseInt(value) || 0 : value,
      });
    }
  };

  const handleImageChange = (type, files) => {
    if (type === 'logo') {
      const file = files[0] || null;
      setLogoImage(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setLogoPreview(null);
      }
    } else if (type === 'detail') {
      const fileArray = Array.from(files);
      setDetailImages(fileArray);
      const previews = [];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === fileArray.length) {
            setDetailPreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
      if (fileArray.length === 0) {
        setDetailPreviews([]);
      }
    } else if (type === 'foodMenu') {
      const fileArray = Array.from(files);
      setFoodMenuImages(fileArray);
      const previews = [];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === fileArray.length) {
            setFoodMenuPreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
      if (fileArray.length === 0) {
        setFoodMenuPreviews([]);
      }
    } else if (type === 'beveragesMenu') {
      const fileArray = Array.from(files);
      setBeveragesMenuImages(fileArray);
      const previews = [];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === fileArray.length) {
            setBeveragesMenuPreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
      if (fileArray.length === 0) {
        setBeveragesMenuPreviews([]);
      }
    }
  };

  const uploadImage = async (endpoint, formDataField, files) => {
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    if (files.length === 1) {
      formData.append(formDataField, files[0]);
    } else {
      files.forEach((file) => {
        formData.append(formDataField, file);
      });
    }

    try {
      await api.post(`/place/${id}/${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error(`Error uploading ${endpoint}:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);

    try {
      // Prepare payload with only changed fields
      const payload = {
        placeId: parseInt(id),
      };

      // Only include fields that have values
      if (formData.address) payload.address = formData.address;
      if (formData.name) payload.name = formData.name;
      if (formData.description) payload.description = formData.description;
      if (formData.email) {
        const trimmedEmail = formData.email.toString().trim();
        if (trimmedEmail) payload.email = trimmedEmail;
      }
      if (formData.mobileNumber) {
        const trimmedMobileNumber = formData.mobileNumber.toString().trim();
        if (trimmedMobileNumber) payload.mobileNumber = trimmedMobileNumber;
      }
      if (formData.password && formData.password.trim()) payload.password = formData.password;
      if (formData.latitude) {
        const trimmedLatitude = formData.latitude.toString().trim();
        if (trimmedLatitude) payload.latitude = trimmedLatitude;
      }
      if (formData.longitude) {
        const trimmedLongitude = formData.longitude.toString().trim();
        if (trimmedLongitude) payload.longitude = trimmedLongitude;
      }
      if (formData.openingTime) payload.openingTime = formData.openingTime;
      if (formData.closingTime) payload.closingTime = formData.closingTime;
      if (formData.forTwo) payload.forTwo = formData.forTwo;
      if (formData.offerPercentage) payload.offerPercentage = formData.offerPercentage;
      if (formData.couponPercentage) payload.couponPercentage = formData.couponPercentage;
      if (formData.interestId) payload.interestId = parseInt(formData.interestId);
      if (formData.ratting) payload.ratting = parseFloat(formData.ratting);
      if (formData.tableBookingTerms) payload.tableBookingTerms = formData.tableBookingTerms;
      if (formData.breakfast) payload.breakfast = formData.breakfast;
      if (formData.lunch) payload.lunch = formData.lunch;
      if (formData.dinner) payload.dinner = formData.dinner;

      await api.put('/place', payload);

      setUploadingImages(true);

      // Upload images sequentially
      if (logoImage) {
        await uploadImage('addLogo', 'logoImage', [logoImage]);
      }

      if (detailImages.length > 0) {
        for (const image of detailImages) {
          await uploadImage('addDetailImage', 'detailImage', [image]);
        }
      }

      if (foodMenuImages.length > 0) {
        await uploadImage('addFoodMenuImages', 'menuImages', foodMenuImages);
      }

      if (beveragesMenuImages.length > 0) {
        await uploadImage('addBeveragesMenuImages', 'menuImages', beveragesMenuImages);
      }

      navigate('/restaurants');
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to update restaurant');
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Restaurant</h1>
            <p className="mt-2 text-gray-600">
              Update restaurant information.
            </p>
              </div>
              <Link
                to={`/restaurants/${id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Restaurant Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                  </label>
                  <input
                    type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                    onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

                <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      pattern={EMAIL_REGEX.source}
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      id="mobileNumber"
                      pattern={PHONE_REGEX.source}
                      maxLength="10"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="10 digit mobile number"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password (Leave blank to keep current password)
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Only enter a password if you want to change it
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                      Latitude
                  </label>
                  <input
                    type="text"
                      name="latitude"
                      id="latitude"
                      value={formData.latitude}
                    onChange={handleChange}
                      placeholder="e.g., 19.305808"
                      pattern={LAT_REGEX.source}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      id="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="e.g., 73.063109"
                      pattern={LONG_REGEX.source}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Operating Hours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="openingTime" className="block text-sm font-medium text-gray-700">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      name="openingTime"
                      id="openingTime"
                      value={formData.openingTime}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="closingTime" className="block text-sm font-medium text-gray-700">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      name="closingTime"
                      id="closingTime"
                      value={formData.closingTime}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Meal Times */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Meal Times</h2>
                
                {/* Breakfast */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      name="breakfast.available"
                      id="breakfast.available"
                      checked={formData.breakfast.available}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="breakfast.available" className="ml-2 block text-sm font-medium text-gray-700">
                      Breakfast Available
                    </label>
                  </div>
                  {formData.breakfast.available && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="breakfast.startTime" className="block text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="breakfast.startTime"
                          id="breakfast.startTime"
                          value={formData.breakfast.startTime}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="breakfast.endTime" className="block text-sm font-medium text-gray-700">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="breakfast.endTime"
                          id="breakfast.endTime"
                          value={formData.breakfast.endTime}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Lunch */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      name="lunch.available"
                      id="lunch.available"
                      checked={formData.lunch.available}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lunch.available" className="ml-2 block text-sm font-medium text-gray-700">
                      Lunch Available
                    </label>
                  </div>
                  {formData.lunch.available && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="lunch.startTime" className="block text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="lunch.startTime"
                          id="lunch.startTime"
                          value={formData.lunch.startTime}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="lunch.endTime" className="block text-sm font-medium text-gray-700">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="lunch.endTime"
                          id="lunch.endTime"
                          value={formData.lunch.endTime}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dinner */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      name="dinner.available"
                      id="dinner.available"
                      checked={formData.dinner.available}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="dinner.available" className="ml-2 block text-sm font-medium text-gray-700">
                      Dinner Available
                    </label>
                  </div>
                  {formData.dinner.available && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dinner.startTime" className="block text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="dinner.startTime"
                          id="dinner.startTime"
                          value={formData.dinner.startTime}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="dinner.endTime" className="block text-sm font-medium text-gray-700">
                          End Time
                  </label>
                        <input
                          type="time"
                          name="dinner.endTime"
                          id="dinner.endTime"
                          value={formData.dinner.endTime}
                    onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="forTwo" className="block text-sm font-medium text-gray-700">
                      Price for Two
                    </label>
                    <input
                      type="text"
                      name="forTwo"
                      id="forTwo"
                      value={formData.forTwo}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="interestId" className="block text-sm font-medium text-gray-700">
                      Interest
                    </label>
                    <select
                      name="interestId"
                      id="interestId"
                      value={formData.interestId}
                      onChange={handleChange}
                      disabled={loadingInterests}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="0">Select an interest</option>
                      {interests.map((interest) => (
                        <option key={interest.interestId} value={interest.interestId}>
                          {interest.interestName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="offerPercentage" className="block text-sm font-medium text-gray-700">
                      Offer Percentage
                    </label>
                    <input
                      type="text"
                      name="offerPercentage"
                      id="offerPercentage"
                      value={formData.offerPercentage}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="couponPercentage" className="block text-sm font-medium text-gray-700">
                      Coupon Percentage
                    </label>
                    <input
                      type="text"
                      name="couponPercentage"
                      id="couponPercentage"
                      value={formData.couponPercentage}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="ratting" className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <input
                    type="number"
                    name="ratting"
                    id="ratting"
                    value={formData.ratting}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="mt-6">
                  <label htmlFor="tableBookingTerms" className="block text-sm font-medium text-gray-700">
                    Table Booking Terms
                  </label>
                  <textarea
                    name="tableBookingTerms"
                    id="tableBookingTerms"
                    rows={3}
                    value={formData.tableBookingTerms}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Image Uploads */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Images</h2>
                
                <div className="space-y-6">
                <div>
                    <label htmlFor="logoImage" className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Image
                  </label>
                    <input
                      type="file"
                      name="logoImage"
                      id="logoImage"
                      accept="image/*"
                      onChange={(e) => handleImageChange('logo', e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="mt-4 flex gap-4">
                      {existingLogo && !logoPreview && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                          <img
                            src={existingLogo}
                            alt="Current logo"
                            className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                      {logoPreview && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">New Logo Preview:</p>
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                </div>

                  <div>
                    <label htmlFor="detailImages" className="block text-sm font-medium text-gray-700 mb-2">
                      Detail Images (Multiple)
                    </label>
                    <input
                      type="file"
                      name="detailImages"
                      id="detailImages"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageChange('detail', e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {(existingDetailImages.length > 0 || detailPreviews.length > 0) && (
                      <div className="mt-4">
                        {existingDetailImages.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Current Detail Images ({existingDetailImages.length}):</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {existingDetailImages.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Detail ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {detailPreviews.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">New Detail Images Preview ({detailPreviews.length}):</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {detailPreviews.map((preview, index) => (
                                <img
                                  key={index}
                                  src={preview}
                                  alt={`Detail preview ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                </div>
              )}
                  </div>

              <div>
                    <label htmlFor="foodMenuImages" className="block text-sm font-medium text-gray-700 mb-2">
                      Food Menu Images (Multiple)
                </label>
                <input
                  type="file"
                      name="foodMenuImages"
                      id="foodMenuImages"
                  accept="image/*"
                      multiple
                      onChange={(e) => handleImageChange('foodMenu', e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {(existingFoodMenuImages.length > 0 || foodMenuPreviews.length > 0) && (
                      <div className="mt-4">
                        {existingFoodMenuImages.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Current Food Menu Images ({existingFoodMenuImages.length}):</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {existingFoodMenuImages.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Food menu ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {foodMenuPreviews.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">New Food Menu Images Preview ({foodMenuPreviews.length}):</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {foodMenuPreviews.map((preview, index) => (
                                <img
                                  key={index}
                                  src={preview}
                                  alt={`Food menu preview ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
              </div>

              <div>
                    <label htmlFor="beveragesMenuImages" className="block text-sm font-medium text-gray-700 mb-2">
                      Beverages Menu Images (Multiple)
                </label>
                    <input
                      type="file"
                      name="beveragesMenuImages"
                      id="beveragesMenuImages"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageChange('beveragesMenu', e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {(existingBeveragesMenuImages.length > 0 || beveragesMenuPreviews.length > 0) && (
                      <div className="mt-4">
                        {existingBeveragesMenuImages.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Current Beverages Menu Images ({existingBeveragesMenuImages.length}):</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {existingBeveragesMenuImages.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Beverages menu ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {beveragesMenuPreviews.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">New Beverages Menu Images Preview ({beveragesMenuPreviews.length}):</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {beveragesMenuPreviews.map((preview, index) => (
                                <img
                                  key={index}
                                  src={preview}
                                  alt={`Beverages menu preview ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/restaurants')}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImages}
                  className="bg-[#EB422B] text-white px-4 py-2 rounded-md hover:bg-[#EB422B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImages ? 'Uploading Images...' : saving ? 'Saving...' : 'Update Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurant;
