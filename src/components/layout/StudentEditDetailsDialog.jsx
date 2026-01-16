import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { X, Save, User, Mail, Phone, MapPin, Calendar, Users } from 'lucide-react';
import Network from '../../context/Network';
import Endpoints from '../../context/endpoints';

const StudentEditDetailsDialog = ({ studentId, isOpen, onClose, onSave, studentData: propStudentData }) => {
    const { authToken, stateList, cityList } = useAuth();
    const { studentData } = useStudent();

    const [formData, setFormData] = useState({
        userName: '',
        firstName: '',
        lastName: '',
        bio: '',
        email: '',
        contact: '',
        gender: '',
        dob: '',
        address: '',
        zipCode: '',
        state: '',
        cityId: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ type: '', message: '', show: false });
    const [availableCities, setAvailableCities] = useState([]);

    // Profile picture state
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [profilePictureError, setProfilePictureError] = useState('');
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);

    // Initialize form with student data
    useEffect(() => {
        const dataToUse = propStudentData || studentData;
        if (dataToUse && isOpen) {
            setFormData({
                userName: dataToUse.userName || '',
                firstName: dataToUse.firstName || '',
                lastName: dataToUse.lastName || '',
                bio: dataToUse.bio || '',
                email: dataToUse.email || '',
                contact: dataToUse.contact || dataToUse.contact || '',
                gender: dataToUse.gender || '',
                dob: dataToUse.dob ? new Date(dataToUse.dob).toISOString().split('T')[0] : '',
                address: dataToUse.address || '',
                zipCode: dataToUse.zipCode || '',
                state: dataToUse.state || '',
                cityId: dataToUse.cityId || ''
            });
            setErrors({});
        }
        setProfilePicturePreview(dataToUse?.profile ? Endpoints?.mediaBaseUrl + dataToUse?.profile : null);
    }, [propStudentData, studentData, isOpen]);

    // Update available cities when state changes
    useEffect(() => {
        // console.log('State changed:', formData.state, 'StateList length:', stateList.length);
        if (formData.state && stateList.length > 0) {
            const selectedState = stateList.find(state => state.name === formData.state);
            // console.log('Selected state:', selectedState);
            if (selectedState && selectedState.city) {
                // console.log('Available cities for state:', selectedState.city);
                setAvailableCities(selectedState.city);
                // Reset city if current city is not available in new state
                const currentCityExists = selectedState.city.some(city => city.id === formData.cityId);
                if (formData.cityId && !currentCityExists) {
                    setFormData(prev => ({ ...prev, cityId: '' }));
                }
            } else {
                console.log('No cities available for selected state');
                setAvailableCities([]);
                setFormData(prev => ({ ...prev, cityId: '' }));
            }
        } else {
            setAvailableCities([]);
        }
    }, [formData.state, stateList]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle profile picture selection
    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        setProfilePictureError('');

        if (!file) {
            setProfilePicture(null);
            setProfilePicturePreview(null);
            return;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setProfilePictureError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            e.target.value = '';
            return;
        }

        // Check file size (3MB = 3 * 1024 * 1024 bytes)
        const maxSize = 3 * 1024 * 1024;
        if (file.size > maxSize) {
            setProfilePictureError('Image size should be less than 3MB');
            e.target.value = '';
            return;
        }

        // Set file and create preview
        setProfilePicture(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setProfilePicturePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Remove profile picture
    const removeProfilePicture = () => {
        setProfilePicture(null);
        setProfilePicturePreview(null);
        setProfilePictureError('');
        // Clear the file input
        const fileInput = document.getElementById('profilePictureInput');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // Upload profile picture to API
    const uploadProfilePicture = async () => {
        if (!profilePicture) {
            setProfilePictureError('Please select an image first');
            return;
        }

        setIsUploadingPicture(true);
        setProfilePictureError('');

        try {
            // Create FormData and append the file as 'pic'
            const formData = new FormData();
            formData.append('pic', profilePicture);

            const response = await Network.editStudentProfilePic(authToken, formData);

            // console.log('Profile picture upload response:', response);

            if (response.status === true || response.success === true) {
                setNotification({
                    type: 'success',
                    message: 'Profile picture updated successfully!',
                    show: true
                });

                // Close dialog after showing success message
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                // API returned false status
                setNotification({
                    type: 'error',
                    message: response.message || 'Failed to update profile picture. Please try again.',
                    show: true
                });
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);

            // Show error notification
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Failed to upload profile picture. Please try again.';

            setNotification({
                type: 'error',
                message: errorMessage,
                show: true
            });
        } finally {
            setIsUploadingPicture(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required field validation
        // const requiredFields = [
        //     'userName', 'firstName', 'lastName', 'email',
        //     'gender', 'dob', 'address', 'zipCode', 'cityId'
        // ];

        // requiredFields.forEach(field => {
        //     if (!formData[field].trim()) {
        //         newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
        //     }
        // });

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Username validation
        if (formData.userName && formData.userName.length < 3) {
            newErrors.userName = 'Username must be at least 3 characters long';
        }

        // Pincode validation
        if (formData.zipCode && !/^\d{6}$/.test(formData.zipCode)) {
            newErrors.zipCode = 'Please enter a valid 6-digit zipCode';
        }

        // Date of birth validation (must be in the past)
        if (formData.dob && new Date(formData.dob) >= new Date()) {
            newErrors.dob = 'Date of birth must be in the past';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setNotification({ type: '', message: '', show: false });

        try {
            // Prepare data for API - only send cityId, not state or city name
            const apiData = {
                userName: formData.userName,
                firstName: formData.firstName,
                lastName: formData.lastName,
                bio: formData.bio,
                email: formData.email,
                gender: formData.gender,
                dob: formData.dob,
                address: formData.address,
                zipCode: formData.zipCode,
                cityId: formData.cityId
            };
            const response = await Network.editStudentProfile(authToken, apiData);

            // console.log('Student details update response:', response);

            if (response.status === true || response.success === true) {
                // Update localStorage with new student data
                const existingStudentData = JSON.parse(localStorage.getItem('studentData') || '{}');
                const updatedStudentData = {
                    ...existingStudentData,
                    userName: formData.userName,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    bio: formData.bio,
                    email: formData.email,
                    gender: formData.gender,
                    dob: formData.dob,
                    address: formData.address,
                    zipCode: formData.zipCode,
                    cityId: formData.cityId
                };
                localStorage.setItem('studentData', JSON.stringify(updatedStudentData));

                // Show success notification
                setNotification({
                    type: 'success',
                    message: 'Profile updated successfully!',
                    show: true
                });

                // Call onSave callback with updated data
                if (onSave) {
                    onSave(updatedStudentData);
                }

                // Close dialog after showing success message
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                // API returned false status
                setNotification({
                    type: 'error',
                    message: response.message || 'Failed to update profile. Please try again.',
                    show: true
                });
            }
        } catch (error) {
            console.error('Error updating student details:', error);

            // Show error notification
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Failed to update profile. Please try again.';

            setNotification({
                type: 'error',
                message: errorMessage,
                show: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            userName: '',
            firstName: '',
            lastName: '',
            bio: '',
            email: '',
            contact: '',
            gender: '',
            dob: '',
            address: '',
            zipCode: '',
            state: '',
            cityId: ''
        });
        setErrors({});
        setNotification({ type: '', message: '', show: false });
        setProfilePicture(null);
        setProfilePicturePreview(null);
        setProfilePictureError('');
        setIsUploadingPicture(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-white" />
                        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Profile Picture Section */}
                    <div className="mb-8 flex flex-col items-center">
                        <div className="relative">
                            {profilePicturePreview ? (
                                <div className="relative">
                                    <img
                                        src={profilePicturePreview}
                                        alt="Profile Preview"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeProfilePicture}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center shadow-lg">
                                    <User size={48} className="text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-center">
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                <label htmlFor="profilePictureInput" className="cursor-pointer">
                                    <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Choose from Gallery
                                    </div>
                                </label>

                                {profilePicture && (
                                    <button
                                        type="button"
                                        onClick={uploadProfilePicture}
                                        disabled={isUploadingPicture}
                                        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploadingPicture ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                Upload Picture
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <input
                                id="profilePictureInput"
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureChange}
                                className="hidden"
                            />
                            <p className="text-xs text-gray-500 mt-2">Maximum size: 3MB</p>
                            <p className="text-xs text-gray-500">Supported: JPEG, PNG, GIF, WebP</p>
                            {profilePictureError && (
                                <p className="text-sm text-red-600 mt-2">{profilePictureError}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.userName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter userName"
                                />
                            </div>
                            {errors.userName && <p className="mt-1 text-sm text-red-600">{errors.userName}</p>}
                        </div>

                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter first name"
                            />
                            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter last name"
                            />
                            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter email address"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Contact (Read Only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="contact"
                                    value={formData.contact}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    placeholder="Contact number"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Contact number cannot be changed</p>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.gender ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.dob ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
                        </div>
                    </div>

                    {/* Bio - Full Width */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio <span className="text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    {/* Address - Full Width */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={2}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.address ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter complete address"
                            />
                        </div>
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                    </div>

                    {/* Location Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {/* Pincode */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pincode <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                maxLength="6"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.zipCode ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter zipCode"
                            />
                            {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                        </div>

                        {/* State */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                State <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.state ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">Select State</option>
                                {stateList.map((state) => (
                                    <option key={state.id} value={state.name}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="cityId"
                                value={formData.cityId}
                                onChange={handleInputChange}
                                disabled={!formData.state}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.state
                                    ? 'bg-gray-100 cursor-not-allowed'
                                    : errors.cityId
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                    }`}
                            >
                                <option value="">{!formData.state ? 'Select State First' : 'Select City'}</option>
                                {availableCities.map((city) => (
                                    <option key={city.id} value={city.id}>
                                        {city.city}
                                    </option>
                                ))}
                            </select>
                            {errors.cityId && <p className="mt-1 text-sm text-red-600">{errors.cityId}</p>}
                        </div>
                    </div>

                    {/* Notification */}
                    {notification.show && (
                        <div className={`mb-6 p-4 mt-6 rounded-lg text-sm flex items-center gap-3 ${notification.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-600'
                            : 'bg-red-50 border border-red-200 text-red-600'
                            }`}>
                            {notification.type === 'success' ? (
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                            <span>{notification.message}</span>
                        </div>
                    )}

                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {errors.submit}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentEditDetailsDialog;