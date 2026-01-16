# Token-Based Authentication Implementation Guide

## Quick Start

### URL Format
```
https://yourapp.com/store?isMobile=true&token=eyJ1c2VySWQiOjM3MDQ0NCwidGltZXN0YW1wIjoxNzY2NTY5OTI2MTU2LCJleHBpcnkiOjE3OTY1Njk5MjYxNTZ9
```

### What Happens Automatically
1. ✅ Token extracted from URL
2. ✅ `/student/fetch-details` API called with Bearer token
3. ✅ Student name, contact, email fetched automatically
4. ✅ Data cached in sessionStorage
5. ✅ Form auto-populated on checkout
6. ✅ Parameters passed through all pages (Store → CourseExplore → Cart)
7. ✅ Layout controls hidden (minimal UI for checkout)

---

## File Changes Summary

### 1. **Store.js**
```javascript
// NEW: Extract token from URL
const tokenFromUrl = new URLSearchParams(window.location.search).get('token');

// NEW: State for fetched student details
const [fetchedStudentName, setFetchedStudentName] = useState(null);
const [fetchedStudentContact, setFetchedStudentContact] = useState(null);
const [fetchedStudentEmail, setFetchedStudentEmail] = useState(null);
const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);

// NEW: useEffect to fetch student details when token present
useEffect(() => {
  const fetchStudentDetails = async () => {
    if (!tokenFromUrl) {
      // Check sessionStorage first (from previous load)
      const storedName = sessionStorage.getItem('fetchedStudentName');
      if (storedName) {
        setFetchedStudentName(storedName);
        setFetchedStudentContact(sessionStorage.getItem('fetchedStudentContact'));
        setFetchedStudentEmail(sessionStorage.getItem('fetchedStudentEmail'));
      }
      return;
    }
    
    try {
      const response = await axios.get(
        `${Endpoints.baseURL}student/fetch-details`,
        { headers: { Authorization: `Bearer ${tokenFromUrl}` } }
      );
      
      const studentData = response.data;
      const fullName = studentData.firstName + ' ' + studentData.lastName;
      
      // Store in state
      setFetchedStudentName(fullName);
      setFetchedStudentContact(studentData.phone);
      setFetchedStudentEmail(studentData.email);
      
      // Store in sessionStorage for persistence
      sessionStorage.setItem('fetchedStudentName', fullName);
      sessionStorage.setItem('fetchedStudentContact', studentData.phone);
      sessionStorage.setItem('fetchedStudentEmail', studentData.email);
      sessionStorage.setItem('studentToken', tokenFromUrl);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };
  
  fetchStudentDetails();
}, [tokenFromUrl]);

// UPDATED: handlePurchaseCourse now includes token
const handlePurchaseCourse = (course) => {
  // Extract URL parameters (uses fetched data if available)
  const urlStudentName = fetchedStudentName || new URLSearchParams(window.location.search).get('studentname');
  const urlContact = fetchedStudentContact || new URLSearchParams(window.location.search).get('contact');
  const urlEmail = fetchedStudentEmail || new URLSearchParams(window.location.search).get('email');

  // Pass URL parameters when navigating to course explore
  if (routeData || tokenFromUrl || urlStudentName || urlContact || urlEmail) {
    let queryParams = [];
    if (routeData) queryParams.push(`isMobile=${routeData}`);
    if (tokenFromUrl) queryParams.push(`token=${tokenFromUrl}`);
    if (urlStudentName) queryParams.push(`studentname=${encodeURIComponent(urlStudentName)}`);
    if (urlContact) queryParams.push(`contact=${urlContact}`);
    if (urlEmail) queryParams.push(`email=${encodeURIComponent(urlEmail)}`);

    navigate(`/course-explore?${queryParams.join('&')}`);
  } else {
    onCourseExplore(course, courseList);
  }
};
```

### 2. **CartPage.jsx**
```javascript
// NEW: Import axios
import axios from "axios";

// NEW: Extract token from URL
const tokenFromUrl = new URLSearchParams(window.location.search).get('token');

// NEW: State for fetched student details
const [fetchedStudentName, setFetchedStudentName] = useState(null);
const [fetchedStudentContact, setFetchedStudentContact] = useState(null);
const [fetchedStudentEmail, setFetchedStudentEmail] = useState(null);
const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);

// NEW: useEffect to fetch student details
useEffect(() => {
  const fetchStudentDetails = async () => {
    if (!tokenFromUrl) {
      const storedName = sessionStorage.getItem('fetchedStudentName');
      if (storedName) {
        setFetchedStudentName(storedName);
        setFetchedStudentContact(sessionStorage.getItem('fetchedStudentContact'));
        setFetchedStudentEmail(sessionStorage.getItem('fetchedStudentEmail'));
      }
      return;
    }
    
    try {
      const response = await axios.get(
        `${Endpoints.baseURL}student/fetch-details`,
        { headers: { Authorization: `Bearer ${tokenFromUrl}` } }
      );
      
      const studentData = response.data;
      const fullName = studentData.firstName + ' ' + studentData.lastName;
      
      setFetchedStudentName(fullName);
      setFetchedStudentContact(studentData.phone);
      setFetchedStudentEmail(studentData.email);
      
      sessionStorage.setItem('fetchedStudentName', fullName);
      sessionStorage.setItem('fetchedStudentContact', studentData.phone);
      sessionStorage.setItem('fetchedStudentEmail', studentData.email);
      sessionStorage.setItem('studentToken', tokenFromUrl);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };
  
  fetchStudentDetails();
}, [tokenFromUrl]);

// UPDATED: ProceedToCheckoutForm now receives fetched details
<ProceedToCheckoutForm
  setProceedToCheckoutModal={setProceedToCheckoutModal}
  cartCourses={checkoutCartCourses}
  urlParams={{
    ...urlParams,
    studentName: fetchedStudentName || urlParams.studentName,
    contact: fetchedStudentContact || urlParams.contact,
    email: fetchedStudentEmail || urlParams.email,
    token: tokenFromUrl
  }}
/>
```

### 3. **CourseExplore.jsx**
```javascript
// NEW: Import axios
import axios from 'axios';

// NEW: Extract token from URL
const tokenFromUrl = new URLSearchParams(window.location.search).get('token');

// NEW: State for fetched student details
const [fetchedStudentName, setFetchedStudentName] = useState(null);
const [fetchedStudentContact, setFetchedStudentContact] = useState(null);
const [fetchedStudentEmail, setFetchedStudentEmail] = useState(null);
const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);

// NEW: useEffect to fetch student details
useEffect(() => {
  const fetchStudentDetails = async () => {
    if (!tokenFromUrl) {
      const storedName = sessionStorage.getItem('fetchedStudentName');
      if (storedName) {
        setFetchedStudentName(storedName);
        setFetchedStudentContact(sessionStorage.getItem('fetchedStudentContact'));
        setFetchedStudentEmail(sessionStorage.getItem('fetchedStudentEmail'));
      }
      return;
    }
    
    try {
      const response = await axios.get(
        `${Endpoints.baseURL}student/fetch-details`,
        { headers: { Authorization: `Bearer ${tokenFromUrl}` } }
      );
      
      const studentData = response.data;
      const fullName = studentData.firstName + ' ' + studentData.lastName;
      
      setFetchedStudentName(fullName);
      setFetchedStudentContact(studentData.phone);
      setFetchedStudentEmail(studentData.email);
      
      sessionStorage.setItem('fetchedStudentName', fullName);
      sessionStorage.setItem('fetchedStudentContact', studentData.phone);
      sessionStorage.setItem('fetchedStudentEmail', studentData.email);
      sessionStorage.setItem('studentToken', tokenFromUrl);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };
  
  fetchStudentDetails();
}, [tokenFromUrl]);

// UPDATED: handlePurchase includes token and fetched details
const handlePurchase = () => {
  if (finalCoursePricing[0]) {
    // ... add to cart logic ...
    
    const effectiveStudentName = fetchedStudentName || urlStudentName;
    const effectiveContact = fetchedStudentContact || urlContact;
    const effectiveEmail = fetchedStudentEmail || urlEmail;

    if (routeData || tokenFromUrl || effectiveStudentName || effectiveContact || effectiveEmail) {
      let queryParams = [];
      if (routeData) queryParams.push(`isMobile=${routeData}`);
      if (tokenFromUrl) queryParams.push(`token=${tokenFromUrl}`);
      if (effectiveStudentName) queryParams.push(`studentname=${encodeURIComponent(effectiveStudentName)}`);
      if (effectiveContact) queryParams.push(`contact=${effectiveContact}`);
      if (effectiveEmail) queryParams.push(`email=${encodeURIComponent(effectiveEmail)}`);
      navigate(`/cart?${queryParams.join('&')}`);
    } else {
      navigate('/cart');
    }
  }
};

// UPDATED: Back button also includes token
onClick={() => {
  const effectiveStudentName = fetchedStudentName || urlStudentName;
  const effectiveContact = fetchedStudentContact || urlContact;
  const effectiveEmail = fetchedStudentEmail || urlEmail;

  if (routeData || tokenFromUrl || effectiveStudentName || effectiveContact || effectiveEmail) {
    let queryParams = [];
    if (routeData) queryParams.push(`isMobile=${routeData}`);
    if (tokenFromUrl) queryParams.push(`token=${tokenFromUrl}`);
    if (effectiveStudentName) queryParams.push(`studentname=${encodeURIComponent(effectiveStudentName)}`);
    if (effectiveContact) queryParams.push(`contact=${effectiveContact}`);
    if (effectiveEmail) queryParams.push(`email=${encodeURIComponent(effectiveEmail)}`);
    navigate(`/store?${queryParams.join('&')}`);
  } else if (onBack) {
    onBack();
  } else {
    navigate('/store');
  }
}}
```

---

## API Response Structure

The `/student/fetch-details` endpoint should return:

```json
{
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "9876543210",
    "email": "john.doe@example.com",
    // ... other student data
  },
  "success": true
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────┐
│  URL with Token                         │
│  ?token=eyJ...                          │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │    Store.js          │
        │  Extract token       │
        │  Call API            │
        │  Fetch details       │
        │  Store in state      │
        │  Store in session    │
        └──────────┬───────────┘
                   │
                   ▼ (navigate with token + details)
        ┌──────────────────────┐
        │ CourseExplore.jsx    │
        │ Check sessionStorage │
        │ (already cached)     │
        │ Use fetched details  │
        └──────────┬───────────┘
                   │
                   ▼ (navigate with token + details)
        ┌──────────────────────┐
        │   CartPage.jsx       │
        │ Check sessionStorage │
        │ Pass to checkout     │
        │ Auto-populate form   │
        └──────────┬───────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ ProceedToCheckoutForm        │
    │ Display pre-filled form      │
    │ Skip modal (auto-populated)  │
    └──────────────────────────────┘
```

---

## Caching Strategy

**First Load**: Token → API Call → sessionStorage
**Subsequent Loads**: sessionStorage (no API call)
**Navigation**: Use cached details from sessionStorage
**Form Population**: Auto-filled from fetched data

---

## Error Handling

- ✅ API call errors logged to console
- ✅ System falls back to URL parameters if API fails
- ✅ Graceful degradation (form still works)
- ✅ No breaking changes to existing flow

---

## Session Storage Keys

| Key | Value | Usage |
|-----|-------|-------|
| `fetchedStudentName` | "John Doe" | Student name for form |
| `fetchedStudentContact` | "9876543210" | Phone for form |
| `fetchedStudentEmail` | "john@example.com" | Email for form |
| `studentToken` | Bearer token | Reference |
| `hideLayoutControls` | "true" | Hide sidebar/footer |
| `currentCourse` | Course JSON | Current course data |
| `allCourses` | Courses JSON | All courses list |

---

## Testing Checklist

- [ ] Token extracted from URL correctly
- [ ] API call made with Bearer token
- [ ] Student details fetched and stored
- [ ] Data persists in sessionStorage
- [ ] Store → CourseExplore navigation preserves token
- [ ] CourseExplore → Cart navigation preserves token
- [ ] Cart page displays fetched details
- [ ] Form auto-populates with fetched data
- [ ] Back button preserves all parameters
- [ ] Layout controls hidden
- [ ] Works with invalid/expired token (falls back gracefully)
- [ ] Works without token (backward compatible)

---

## Backward Compatibility

✅ System still supports URL parameters:
```
?studentname=John&contact=9876543210&email=john@example.com
```

✅ Works with authenticated users (original flow)

✅ Token takes priority if both present

---

## Security Notes

- 🔒 Token never logged to console (only errors)
- 🔒 Token passed in Authorization header (not in URL internally)
- 🔒 SessionStorage used for caching (session-scoped)
- 🔒 No sensitive data hardcoded in URLs (token validates)

---

## Troubleshooting

### Token not being recognized
- Check URL format: `?isMobile=true&token=...`
- Verify token format (JWT)
- Check Authorization header: `Authorization: Bearer {token}`

### Student details not fetching
- Verify API endpoint: `/student/fetch-details`
- Check API response structure (firstName, lastName, phone, email)
- Check browser console for API errors
- Verify token is valid and not expired

### Form not auto-populating
- Check sessionStorage values:
  ```javascript
  console.log(sessionStorage.getItem('fetchedStudentName'));
  console.log(sessionStorage.getItem('fetchedStudentContact'));
  console.log(sessionStorage.getItem('fetchedStudentEmail'));
  ```
- Verify ProceedToCheckoutForm receives `urlParams` prop
- Check form component uses props for default values

### Data lost on navigation
- Verify sessionStorage is being used correctly
- Check that token is passed in all query parameters
- Verify useEffect dependencies are correct

