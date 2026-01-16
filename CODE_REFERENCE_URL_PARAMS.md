# Code Reference - URL Parameters Implementation

## 1. Store.js - handleShowCart() Function

```javascript
const handleShowCart = () => {
    // Get routeData and other URL parameters to pass them along
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

**Purpose:** Extracts URL parameters and passes them to CartPage

---

## 2. CartPage.jsx - State Declaration

```javascript
const [urlParams, setUrlParams] = useState({ studentName: null, contact: null, email: null });
```

---

## 3. CartPage.jsx - Extract URL Parameters Effect

```javascript
// Check for routeData and hide layout controls if present
useEffect(() => {
    // Support both state (from React Router navigation) and query params (from direct URL visits)
    const routeData = location.state?.isMobile || new URLSearchParams(window.location.search).get('isMobile');
    const urlStudentName = new URLSearchParams(window.location.search).get('studentname');
    const urlContact = new URLSearchParams(window.location.search).get('contact');
    const urlEmail = new URLSearchParams(window.location.search).get('email');

    // Store URL parameters
    setUrlParams({
        studentName: urlStudentName,
        contact: urlContact,
        email: urlEmail
    });

    if (routeData) {
        sessionStorage.setItem('hideLayoutControls', 'true');
    } else {
        sessionStorage.removeItem('hideLayoutControls');
    }

    return () => {
        sessionStorage.removeItem('hideLayoutControls');
    };
}, [location.state]);
```

---

## 4. CartPage.jsx - handleProceedToCheckout() - Conditional Flow

```javascript
const handleProceedToCheckout = () => {
    // Prepare entityModals for both regular courses and drip courses
    const entityModals = [];

    // Add regular courses to entityModals
    regularCourses.forEach(item => {
        entityModals.push({
            purchaseType: "course",
            entityId: item?.id || 0,
            campusId: 0,
            courseId: 0,
            coursePricingId: item?.coursePricingId || 0
        });
    });

    // Add drip courses (test series) from purchaseArray
    const purchaseArray = localStorage.getItem('purchaseArray');
    if (purchaseArray) {
        try {
            const parsedArray = JSON.parse(purchaseArray);
            if (Array.isArray(parsedArray)) {
                parsedArray.forEach(item => {
                    entityModals.push({
                        purchaseType: item.purchaseType || "courseContent",
                        entityId: item.entityId || 0
                    });
                });
            }
        } catch (error) {
            console.error('Error parsing purchaseArray:', error);
        }
    }

    // KEY LOGIC: If user has URL parameters OR is authenticated, skip modal
    if ((urlParams.studentName && urlParams.contact && urlParams.email) || (isAuthenticated && studentData)) {
        handleProcessPayment(entityModals, {
            studentName: urlParams.studentName,
            contact: urlParams.contact,
            email: urlParams.email
        });
    } else {
        // If not authenticated and no URL params, show checkout form to collect details
        const combinedCart = [];

        // Add regular courses
        regularCourses.forEach(item => {
            combinedCart.push({
                ...item,
                finalPrice: item.finalPrice
            });
        });

        // Add drip courses with calculated finalPrice
        dripCourses.forEach(item => {
            if (item.plan && item.plan.price) {
                const discount = item.plan.discount ?? 0;
                const price = item.plan.price ?? 0;
                const discountedAmount = (price * discount) / 100;
                const finalPrice = price - discountedAmount;

                combinedCart.push({
                    id: item.plan.id,
                    title: item.plan.title,
                    finalPrice: finalPrice,
                    coursePricingId: 0,
                    isDripCourse: true
                });
            }
        });

        setCheckoutCartCourses(combinedCart);
        setProceedToCheckoutModal(true);
    }
};
```

---

## 5. CartPage.jsx - handleProcessPayment() - With URL Params Support

```javascript
const handleProcessPayment = async (payloadCart, urlParamsData = null) => {
    try {
        setIsProcessingPayment(true);
        
        // Use URL parameters if available, otherwise use authenticated student data
        let firstName, lastName, contact, email;
        
        if (urlParamsData && urlParamsData.studentName && urlParamsData.contact && urlParamsData.email) {
            // Extract first and last name from studentName
            const nameParts = urlParamsData.studentName.split(' ');
            firstName = nameParts[0] || 'User';
            lastName = nameParts.slice(1).join(' ') || '';
            contact = urlParamsData.contact;
            email = urlParamsData.email;
        } else {
            // Use authenticated student data
            firstName = studentData?.firstName || studentData?.fullName?.split(' ')[0] || 'User';
            lastName = studentData?.lastName || studentData?.fullName?.split(' ')[1] || '';
            contact = studentData?.contact || '';
            email = studentData?.email || '';
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

        const response = await axios.post(BASE_URL + `/admin/payment/fetch-public-checkout-url`, body);

        if (response?.data?.status === true) {
            const width = 480;
            const height = 1080;
            const left = window.screenX + (window.outerWidth / 2) - (width / 2);
            const top = window.screenY + (window.outerHeight / 2) - (height / 2);

            window.open(
                response?.data?.url,
                'sharer',
                `location=no,width=${width},height=${height},top=${top},left=${left}`
            );

            // Clear cart after opening payment
            handleClearCart();
            
            // Redirect back to store with URL parameters if they exist
            const routeData = location.state?.isMobile || new URLSearchParams(window.location.search).get('isMobile');
            if (urlParamsData && (urlParamsData.studentName || urlParamsData.contact || urlParamsData.email)) {
                let queryParams = [];
                if (routeData) queryParams.push(`isMobile=${routeData}`);
                if (urlParamsData.studentName) queryParams.push(`studentname=${encodeURIComponent(urlParamsData.studentName)}`);
                if (urlParamsData.contact) queryParams.push(`contact=${urlParamsData.contact}`);
                if (urlParamsData.email) queryParams.push(`email=${encodeURIComponent(urlParamsData.email)}`);
                navigate(`/store?${queryParams.join('&')}`);
            }
        } else {
            console.error('Payment initiation failed');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
    } finally {
        setIsProcessingPayment(false);
    }
};
```

---

## 6. ProceedToCheckoutForm.jsx - Imports Update

```javascript
import { useNavigate, useLocation } from "react-router-dom";
```

---

## 7. ProceedToCheckoutForm.jsx - State Declaration

```javascript
const [urlParams, setUrlParams] = useState({ studentName: null, contact: null, email: null });
```

---

## 8. ProceedToCheckoutForm.jsx - Extract and Auto-Populate URL Parameters

```javascript
useEffect(() => {
    // Extract URL parameters
    const urlStudentName = new URLSearchParams(window.location.search).get('studentname');
    const urlContact = new URLSearchParams(window.location.search).get('contact');
    const urlEmail = new URLSearchParams(window.location.search).get('email');

    // Store URL parameters
    setUrlParams({
        studentName: urlStudentName,
        contact: urlContact,
        email: urlEmail
    });

    // If URL parameters exist, auto-populate the form
    if (urlStudentName) {
        setTitle(urlStudentName);
    } else if (isAuthenticated === true) {
        setTitle(studentData?.firstName + " " + studentData?.lastName);
    }

    if (urlEmail) {
        setEmail(urlEmail);
    } else if (isAuthenticated === true) {
        setEmail(studentData?.email);
    }

    if (urlContact) {
        setNumber(urlContact);
    } else if (isAuthenticated === true) {
        setNumber(studentData?.contact);
    }
}, [isAuthenticated, studentData])
```

---

## 9. ProceedToCheckoutForm.jsx - handleSubmit() - With Parameter Preservation

```javascript
const handleSubmit = async () => {
    // Extract first and last name from title
    const nameParts = title.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const body = {
        "firstName": firstName,
        "lastName": lastName,
        "contact": number,
        "email": email,
        "instId": instId,
        "campaignId": null,
        "coupon": "",
        "coursePricingId": 0,
        "entityModals": payloadCart
    }
    try {
        const response = await axios.post(BASE_URL + `/admin/payment/fetch-public-checkout-url`, body);

        if (response?.data?.status === true) {

            const width = 480;
            const height = 1080;
            const left = window.screenX + (window.outerWidth / 2) - (width / 2);
            const top = window.screenY + (window.outerHeight / 2) - (height / 2);

            window.open(
                response?.data?.url,
                'sharer',
                `location=no,width=${width},height=${height},top=${top},left=${left}`
            );

            setTitle('');
            setNumber('');
            setEmail('')
            setPayloadCart([])
            setProceedToCheckoutModal(false)
            
            // Redirect back to store with URL parameters if they exist
            const routeData = new URLSearchParams(window.location.search).get('isMobile');
            if (urlParams.studentName || urlParams.contact || urlParams.email) {
                let queryParams = [];
                if (routeData) queryParams.push(`isMobile=${routeData}`);
                if (urlParams.studentName) queryParams.push(`studentname=${encodeURIComponent(urlParams.studentName)}`);
                if (urlParams.contact) queryParams.push(`contact=${urlParams.contact}`);
                if (urlParams.email) queryParams.push(`email=${encodeURIComponent(urlParams.email)}`);
                navigate(`/store?${queryParams.join('&')}`);
            } else if (!authToken && !isAuthenticated) {
                navigate('/login', { state: { data: "storeData" } })
            }

        }

    } catch (err) {
        console.log(err);
    };
};
```

---

## Usage Examples

### Example 1: Direct URL with All Parameters
```
https://yourapp.com/store?studentname=hemu%20rajpoot&contact=1234567890&email=hemu@gmail.com
```

### Example 2: With Mobile Parameter
```
https://yourapp.com/store?isMobile=true&studentname=John%20Doe&contact=9876543210&email=john@example.com
```

### Example 3: Name with Multiple Words
```
https://yourapp.com/store?studentname=John%20Michael%20Doe&contact=9876543210&email=john@example.com
```
Result: firstName = "John", lastName = "Michael Doe"

---

## Key Points

✅ All three parameters must be present to skip the modal  
✅ `encodeURIComponent()` is used for proper URL encoding  
✅ Names with spaces are handled correctly  
✅ Parameters are preserved through entire checkout flow  
✅ After payment, user redirects back to Store with same parameters  
✅ Fallback to modal form if parameters missing or incomplete  
✅ Proper firstName/lastName split from full name  
✅ Backward compatible with existing authentication flow  
