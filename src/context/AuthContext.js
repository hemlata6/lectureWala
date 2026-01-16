import React, { createContext, useContext, useState, useEffect } from 'react';
import Network from './Network';
import Endpoints from './endpoints';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [institute, setInstitute] = useState(null);
  const [instituteAppSettingsModals, setInstituteAppSettingsModals] = useState(null);
  const [gallery, setGallery] = useState(null);
  const [instituteModuleSettings, setInstituteModuleSettings] = useState(null);
  const [instituteTechSettingModals, setInstituteTechSettingModals] = useState(null);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);


  const getStates = async () => {
    try {
      const response = await Network.getStateAPI();

      if (response && response.states && Array.isArray(response.states)) {
        // Filter out only states (objects with 'name' and 'city' properties)
        const statesOnly = response.states.filter(item =>
          item.name && Array.isArray(item.city)
        );

        // Extract all cities from all states into a single array
        const allCities = [];
        statesOnly.forEach(state => {
          if (state.city && Array.isArray(state.city)) {
            allCities.push(...state.city);
          }
        });

        setStateList(statesOnly);
        setCityList(allCities);

        // console.log('States loaded:', statesOnly.length);
        // console.log('Cities loaded:', allCities.length);
      } else {
        setStateList([]);
        setCityList([]);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setStateList([]);
      setCityList([]);
    }
  };

  useEffect(() => {
    getStates();
  }, []);

  useEffect(() => {
    // Check if user is logged in on app load
    const savedUser = localStorage.getItem('user');
    const savedStudentData = localStorage.getItem('studentData');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else if (savedStudentData) {
      // Use student data as user data for backward compatibility
      const studentData = JSON.parse(savedStudentData);
      setUser({
        id: studentData.id,
        name: studentData.name,
        email: studentData.email || '',
        phone: studentData.phone || '',
        purchases: []
      });
    }

    setLoading(false);
  }, []);

  const fetchInstitute = async () => {
    try {
      // const authToken = localStorage.getItem('authToken');
      // if (!authToken) {
      //   console.log('No auth token available for institute fetch');
      //   return;
      // }

      // console.log('Fetching institute data with auth token...');
      const response = await Network.getInstitute();
      if (response.status && response.institute) {
        // console.log("Fetched institute data:", response);
        setInstitute(response.institute);
        setGallery(response.institute.gallery);
        setInstituteAppSettingsModals(response.instituteAppSetting);
        setInstituteModuleSettings(response.institute?.instituteModuleSetting);
        setInstituteTechSettingModals(response?.instituteTechSettingModals);
        Endpoints.mediaBaseUrl = response?.instituteTechSetting?.mediaUrl;
        return response.institute;
      } else {
        console.log("No institute data found or invalid response");
        return null;
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Fetch institute data on initial load if auth token exists
    const authToken = localStorage.getItem('authToken');
    fetchInstitute();

    // Listen for authentication state changes
    const handleAuthStateChange = (event) => {
      // console.log('Auth state changed, fetching institute data...');
      if (event.detail.isAuthenticated) {
        // Small delay to ensure all localStorage operations are complete
        setTimeout(() => {
          fetchInstitute();
        }, 200);
      }
    };

    // Listen for token expiration events
    const handleTokenExpired = (event) => {
      // console.log('Token expiration event received in AuthContext, clearing all data...');
      setUser(null);
      setInstitute(null);
      setInstituteAppSettingsModals(null);
      setGallery(null);
      setInstituteModuleSettings(null);
      setInstituteTechSettingModals(null);
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    window.addEventListener('tokenExpired', handleTokenExpired);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const login = (emailOrPhone, passwordOrOtp) => {
    // Handle phone-based OTP login
    if (emailOrPhone && emailOrPhone.length === 10 && !emailOrPhone.includes('@')) {
      // Phone-based authentication
      const userData = {
        id: Date.now(),
        phone: emailOrPhone,
        name: `User_${emailOrPhone}`,
        purchases: [],
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }
    // Handle email-based login (original logic)
    else if (emailOrPhone && passwordOrOtp.length >= 6 && emailOrPhone.includes('@')) {
      const userData = {
        id: 1,
        email: emailOrPhone,
        name: emailOrPhone.split('@')[0],
        purchases: [],
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const signup = (name, email, password) => {
    // Simple mock signup - in real app, this would make API call
    if (name && email && password.length >= 6) {
      const userData = {
        id: Date.now(),
        email,
        name,
        purchases: [],
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Invalid signup data' };
  };

  const logout = async () => {
    const auth = localStorage.getItem('authToken');
    // console.log("Logging out with auth token:", auth);

    try {
      if (auth) {
        await Network.studentLogout(auth);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Clear all authentication data
    setUser(null);
    setInstitute(null);
    setInstituteAppSettingsModals(null);
    setGallery(null);
    setInstituteModuleSettings(null);
    setInstituteTechSettingModals(null);

    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('studentAuth');
    localStorage.removeItem('authToken');
    localStorage.removeItem('studentData');

    return { success: true };
  };

  const addPurchase = (item) => {
    const updatedUser = {
      ...user,
      purchases: [...user.purchases, { ...item, purchaseDate: new Date().toISOString() }]
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    signup,
    logout,
    addPurchase,
    isAuthenticated: !!user || !!localStorage.getItem('authToken'),
    loading,
    authToken: localStorage.getItem('authToken'),
    institute,
    instituteAppSettingsModals,
    gallery,
    instituteModuleSettings,
    instituteTechSettingModals,
    stateList,
    cityList
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};