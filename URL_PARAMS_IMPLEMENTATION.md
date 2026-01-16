# URL Parameters Implementation Guide

## Overview
This implementation allows passing student information (`studentName`, `contact`, `email`) through URL parameters across the Store → Cart → Checkout flow, enabling seamless checkout without requiring the user to fill out a form.

## URL Format
```
store?isMobile=true&studentname=hemu%20rajpoot&contact=1234567890&email=hemu@gmail.com
```

## Implementation Details

### 1. Store.js - `handleShowCart()` function
**Changes:**
- Extracts URL parameters: `studentname`, `contact`, `email` from the current page URL
- Passes these parameters when navigating to the Cart page
- Preserves all parameters in the URL query string

```javascript
const handleShowCart = () => {
    const studentName = new URLSearchParams(window.location.search).get('studentname');
    const contact = new URLSearchParams(window.location.search).get('contact');
    const email = new URLSearchParams(window.location.search).get('email');
    
    if (routeData || studentName || contact || email) {
        let queryParams = [];
        if (routeData) queryParams.push(`isMobile=${routeData}`);
        if (studentName) queryParams.push(`studentname=${encodeURIComponent(studentName)}`);
        if (contact) queryParams.push(`contact=${contact}`);
        if (email) queryParams.push(`email=${encodeURIComponent(email)}`);
        navigate(`/cart?${queryParams.join('&')}`);
    } else if (routeData) {
        onQuizNavigation && onQuizNavigation('cart', null, routeData);
    } else {
        onQuizNavigation && onQuizNavigation('cart');
    }
}
```

**Flow:**
1. User browses Store with URL params: `/store?studentname=...&contact=...&email=...`
2. Clicks "View Cart" button
3. All parameters are extracted and passed to Cart page: `/cart?studentname=...&contact=...&email=...`

---

### 2. CartPage.jsx - New State & Logic
**Changes:**
- Added `urlParams` state to store extracted URL parameters
- Updated first `useEffect` to extract and store URL parameters
- Modified `handleProceedToCheckout()` to check for URL parameters
- Updated `handleProcessPayment()` signature to accept `urlParamsData`

```javascript
const [urlParams, setUrlParams] = useState({ studentName: null, contact: null, email: null });

// Extract URL parameters in useEffect
useEffect(() => {
    const urlStudentName = new URLSearchParams(window.location.search).get('studentname');
    const urlContact = new URLSearchParams(window.location.search).get('contact');
    const urlEmail = new URLSearchParams(window.location.search).get('email');

    setUrlParams({
        studentName: urlStudentName,
        contact: urlContact,
        email: urlEmail
    });
    // ... rest of effect
}, [location.state]);

// In handleProceedToCheckout():
if ((urlParams.studentName && urlParams.contact && urlParams.email) || (isAuthenticated && studentData)) {
    handleProcessPayment(entityModals, {
        studentName: urlParams.studentName,
        contact: urlParams.contact,
        email: urlParams.email
    });
} else {
    // Show modal form if no URL params and user not authenticated
    setProceedToCheckoutModal(true);
}
```

**Flow:**
1. Cart page loads with URL params
2. If all three params exist (studentName, contact, email), **skip the checkout modal** and proceed directly
3. If params don't exist and user is authenticated, proceed directly with student data
4. Otherwise, show checkout form modal

---

### 3. CartPage.jsx - `handleProcessPayment()` function
**Changes:**
- Now accepts optional `urlParamsData` parameter
- Uses URL parameters if available, falls back to student data
- Extracts firstName and lastName from studentName
- **Redirects back to Store with URL parameters preserved after payment**

```javascript
const handleProcessPayment = async (payloadCart, urlParamsData = null) => {
    // Use URL parameters if available
    if (urlParamsData && urlParamsData.studentName && urlParamsData.contact && urlParamsData.email) {
        const nameParts = urlParamsData.studentName.split(' ');
        firstName = nameParts[0] || 'User';
        lastName = nameParts.slice(1).join(' ') || '';
        contact = urlParamsData.contact;
        email = urlParamsData.email;
    } else {
        // Use authenticated student data
        firstName = studentData?.firstName || ...;
        // ...
    }
    
    const body = {
        firstName: firstName,
        lastName: lastName,
        contact: contact,
        email: email,
        instId: instId,
        campaignId: null,
        coupon: "",
        coursePricingId: 0,
        entityModals: payloadCart
    };

    // ... payment API call ...

    // IMPORTANT: Redirect back to Store with URL parameters
    if (urlParamsData && (urlParamsData.studentName || urlParamsData.contact || urlParamsData.email)) {
        let queryParams = [];
        if (routeData) queryParams.push(`isMobile=${routeData}`);
        if (urlParamsData.studentName) queryParams.push(`studentname=${encodeURIComponent(urlParamsData.studentName)}`);
        if (urlParamsData.contact) queryParams.push(`contact=${urlParamsData.contact}`);
        if (urlParamsData.email) queryParams.push(`email=${encodeURIComponent(urlParamsData.email)}`);
        navigate(`/store?${queryParams.join('&')}`);
    }
};
```

**Key Feature:** After payment window opens, the user is redirected back to Store with all URL parameters intact, maintaining the user's session context.

---

### 4. ProceedToCheckoutForm.jsx - Form Auto-Population
**Changes:**
- Added `useLocation` import
- Added `urlParams` state
- Updated initial `useEffect` to extract and auto-populate form fields from URL parameters
- Updated `handleSubmit()` to properly split firstName/lastName
- Added redirect back to Store with URL parameters after successful checkout

```javascript
import { useNavigate, useLocation } from "react-router-dom";

const [urlParams, setUrlParams] = useState({ studentName: null, contact: null, email: null });

useEffect(() => {
    const urlStudentName = new URLSearchParams(window.location.search).get('studentname');
    const urlContact = new URLSearchParams(window.location.search).get('contact');
    const urlEmail = new URLSearchParams(window.location.search).get('email');

    setUrlParams({
        studentName: urlStudentName,
        contact: urlContact,
        email: urlEmail
    });

    // Auto-populate form fields
    if (urlStudentName) setTitle(urlStudentName);
    if (urlEmail) setEmail(urlEmail);
    if (urlContact) setNumber(urlContact);
    
    // ... fallback to student data if not available
}, [isAuthenticated, studentData]);

// In handleSubmit():
const handleSubmit = async () => {
    const nameParts = title.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const body = {
        firstName: firstName,
        lastName: lastName,
        contact: number,
        email: email,
        // ... rest of body
    };

    // ... payment API call ...

    // Redirect back to Store with URL parameters
    if (urlParams.studentName || urlParams.contact || urlParams.email) {
        let queryParams = [];
        if (routeData) queryParams.push(`isMobile=${routeData}`);
        if (urlParams.studentName) queryParams.push(`studentname=${encodeURIComponent(urlParams.studentName)}`);
        if (urlParams.contact) queryParams.push(`contact=${urlParams.contact}`);
        if (urlParams.email) queryParams.push(`email=${encodeURIComponent(urlParams.email)}`);
        navigate(`/store?${queryParams.join('&')}`);
    }
};
```

**Key Features:**
- Form fields are automatically populated from URL parameters
- User can proceed without modifying fields
- Names are properly split into firstName and lastName for API
- After payment, redirects back to Store with parameters

---

## Complete User Journey

### Scenario 1: Direct URL Access with All Parameters
```
https://yourapp.com/store?studentname=hemu%20rajpoot&contact=1234567890&email=hemu@gmail.com
```
1. ✅ Store page displays with all courses
2. ✅ User clicks "View Cart"
3. ✅ Cart page shows items (parameters passed)
4. ✅ User clicks "Continue to Payment"
5. ✅ **Modal is SKIPPED** → Payment window opens directly
6. ✅ After payment → Redirects to Store with same URL parameters

### Scenario 2: Authenticated User Journey
```
https://yourapp.com/store
```
1. ✅ User is authenticated
2. ✅ Clicks "View Cart"
3. ✅ Clicks "Continue to Payment"
4. ✅ **Modal is SKIPPED** → Uses student data and proceeds directly
5. ✅ Payment window opens
6. ✅ After payment → Redirects to Store

### Scenario 3: Guest User (No URL Parameters, No Authentication)
```
https://yourapp.com/store
```
1. ✅ Store page displays
2. ✅ User clicks "View Cart"
3. ✅ Clicks "Continue to Payment"
4. ✅ **Checkout Modal APPEARS** → User fills form
5. ✅ User fills studentName, contact, email
6. ✅ User submits → Payment window opens
7. ✅ After payment → Redirects to Store (no params, since form-filled)

---

## API Body Structure

The payment API receives:

```json
{
    "firstName": "hemu",
    "lastName": "rajpoot",
    "contact": "1234567890",
    "email": "hemu@gmail.com",
    "instId": 262,
    "campaignId": null,
    "coupon": "",
    "coursePricingId": 0,
    "entityModals": [
        {
            "purchaseType": "course",
            "entityId": 123,
            "campusId": 0,
            "courseId": 0,
            "coursePricingId": 456
        }
    ]
}
```

---

## Testing Checklist

- [ ] Test direct URL with all parameters
- [ ] Verify form fields auto-populate correctly
- [ ] Confirm modal is skipped with URL params
- [ ] Test payment window opens
- [ ] Verify redirect back to Store with params
- [ ] Test authenticated user flow (modal skipped)
- [ ] Test guest user flow (modal shown)
- [ ] Test parameter encoding/decoding (names with spaces)
- [ ] Verify firstName/lastName split works correctly
- [ ] Test on mobile view (`?isMobile=true`)

---

## Benefits

✅ **Seamless Checkout:** Users don't need to fill forms if parameters provided  
✅ **Session Persistence:** URL parameters maintained across navigation  
✅ **Mobile Support:** Works with isMobile parameter  
✅ **Backward Compatible:** Still supports modal form if parameters missing  
✅ **Authenticated & Guest:** Works for both user types  
✅ **Dynamic Routing:** Conditional modal display based on context  

---

## Notes

- URL parameters are read-only (not editable in this flow)
- To edit, user must go through form modal
- Parameters are decoded/encoded to handle spaces and special characters
- Student data takes priority if user is authenticated (unless redirected with URL params)
