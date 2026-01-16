import React, { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext();

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  const [studentData, setStudentData] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const storedStudentData = localStorage.getItem('studentData');
      const storedAuthToken = localStorage.getItem('authToken'); // Use 'authToken' not 'studentToken'

      if (storedStudentData && storedAuthToken) {
        const parsedStudentData = JSON.parse(storedStudentData);
        setStudentData(parsedStudentData);
        setAuthToken(storedAuthToken);
        setIsAuthenticated(true);
        // console.log('Student data loaded from localStorage:', { student: parsedStudentData, hasToken: !!storedAuthToken });
      } else {
        console.log('No student data or auth token found in localStorage');
      }
    } catch (error) {
      console.error('Error loading student data from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('studentData');
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }

    // Listen for token expiration events
    const handleTokenExpired = (event) => {
      // console.log('Token expiration event received in StudentContext');
      clearStudentAuth();
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    // Cleanup event listener
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  // Set student data and auth token from API response
  const setStudentAuth = (apiResponse) => {
    try {
      // Handle different response formats
      const hasAuthToken = apiResponse?.authToken || apiResponse?.token;
      const studentData = apiResponse?.student || apiResponse?.data || apiResponse;

      // Check if response is valid
      if (apiResponse?.status && hasAuthToken && studentData) {
        const token = apiResponse.authToken || apiResponse.token;
        const student = apiResponse.student || apiResponse.data;

        // Store in state
        setAuthToken(token);
        setStudentData(student);
        setIsAuthenticated(true);

        // Store in localStorage for persistence
        localStorage.setItem('authToken', token);
        localStorage.setItem('studentData', JSON.stringify(student));

        // console.log('Student authentication data stored successfully');

        // Dispatch custom event to notify other parts of the app
        window.dispatchEvent(new CustomEvent('authStateChanged', {
          detail: { isAuthenticated: true, token, student }
        }));

        return true;
      } else {
        console.error('Invalid API response format', apiResponse);
        return false;
      }
    } catch (error) {
      console.error('Error setting student auth:', error);
      return false;
    }
  };

  // Clear student data and logout
  const clearStudentAuth = () => {
    try {
      setStudentData(null);
      setAuthToken(null);
      setIsAuthenticated(false);

      // Clear from localStorage
      localStorage.removeItem('studentData');
      localStorage.removeItem('authToken'); // Use consistent key
      localStorage.removeItem('studentToken'); // Clear old format if exists
      localStorage.removeItem('studentAuth'); // Clear old format if exists
      localStorage.removeItem('user'); // Clear old format if exists

      // console.log('Student authentication cleared');
    } catch (error) {
      console.error('Error clearing student auth:', error);
    }
  };

  // Update specific student data
  const updateStudentData = (updates) => {
    try {
      if (studentData) {        
        const updatedStudent = { ...studentData, ...updates };
        setStudentData(updatedStudent);
        localStorage.setItem('studentData', JSON.stringify(updatedStudent));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating student data:', error);
      return false;
    }
  };

  // Get formatted student info for display
  const getStudentInfo = () => {
    if (!studentData) return null;

    return {
      id: studentData.id,
      userId: studentData.userId,
      fullName: `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim(),
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      contact: studentData.contact,
      address: studentData.address,
      profile: studentData.profile,
      emailVerified: studentData.emailVerified,
      phoneVerified: studentData.phoneVerified,
      active: studentData.active,
      gender: studentData.gender,
      cityName: studentData.cityName,
      stateName: studentData.stateName,
    };
  };

  // Check if student data is complete
  const isProfileComplete = () => {
    if (!studentData) return false;

    return !!(
      studentData.firstName &&
      studentData.lastName &&
      studentData.email &&
      studentData.contact
    );
  };

  const value = {
    // State
    studentData,
    authToken,
    isAuthenticated,
    loading,

    // Actions
    setStudentAuth,
    clearStudentAuth,
    updateStudentData,

    // Getters
    getStudentInfo,
    isProfileComplete,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

export default StudentContext;