# Testing & Validation Guide

## Implementation Validation Checklist

### ✅ Code Changes Completed

- [x] Store.js - handleShowCart() updated to extract and pass URL parameters
- [x] CartPage.jsx - Added urlParams state
- [x] CartPage.jsx - Added useEffect to extract URL parameters
- [x] CartPage.jsx - Updated handleProceedToCheckout() with conditional logic
- [x] CartPage.jsx - Updated handleProcessPayment() to accept urlParamsData
- [x] CartPage.jsx - Added redirect logic after payment
- [x] ProceedToCheckoutForm.jsx - Added useLocation import
- [x] ProceedToCheckoutForm.jsx - Added urlParams state
- [x] ProceedToCheckoutForm.jsx - Added URL parameter extraction effect
- [x] ProceedToCheckoutForm.jsx - Updated handleSubmit() with name splitting and redirect

---

## Test Scenarios

### Test 1: Direct URL Access with All Parameters
**URL:**
```
https://app.com/store?studentname=hemu%20rajpoot&contact=1234567890&email=hemu@gmail.com
```

**Expected Flow:**
1. ✓ Store page loads normally
2. ✓ User adds courses to cart
3. ✓ User clicks "View Cart"
4. ✓ Navigates to `/cart?studentname=hemu%20rajpoot&contact=1234567890&email=hemu@gmail.com`
5. ✓ CartPage extracts parameters into state
6. ✓ User clicks "Continue to Payment"
7. ✓ **Modal is SKIPPED** → Payment window opens directly with:
   - firstName: "hemu"
   - lastName: "rajpoot"
   - contact: "1234567890"
   - email: "hemu@gmail.com"
8. ✓ After payment closes, redirects to `/store?studentname=hemu%20rajpoot&contact=1234567890&email=hemu@gmail.com`

**Validation Points:**
- [ ] URL parameters correctly encoded in navigation
- [ ] Modal not shown
- [ ] Payment API receives correct firstName/lastName split
- [ ] Redirect includes all parameters

---

### Test 2: URL with Mobile Parameter
**URL:**
```
https://app.com/store?isMobile=true&studentname=John%20Doe&contact=9876543210&email=john@example.com
```

**Expected Flow:**
1. ✓ Store page loads with layout controls hidden (sessionStorage flag)
2. ✓ Add courses and navigate to cart
3. ✓ CartPage also hides layout controls
4. ✓ Modal skipped, payment opens
5. ✓ After payment, redirects to `/store?isMobile=true&studentname=John%20Doe&contact=9876543210&email=john@example.com`
6. ✓ Mobile view maintained throughout

**Validation Points:**
- [ ] isMobile parameter preserved through all navigations
- [ ] Layout controls hidden as expected
- [ ] All parameters passed to payment API

---

### Test 3: Name with Multiple Words
**URL:**
```
https://app.com/store?studentname=John%20Michael%20Doe&contact=9876543210&email=john@example.com
```

**Expected Behavior:**
- firstName: "John"
- lastName: "Michael Doe"

**API Request Should Contain:**
```json
{
    "firstName": "John",
    "lastName": "Michael Doe",
    "contact": "9876543210",
    "email": "john@example.com",
    ...
}
```

**Validation Points:**
- [ ] First word extracted as firstName
- [ ] Remaining words joined as lastName
- [ ] API receives correct name split

---

### Test 4: Authenticated User (No URL Parameters)
**URL:**
```
https://app.com/store
```
User is logged in with profile data.

**Expected Flow:**
1. ✓ Store page loads
2. ✓ User adds courses and goes to cart
3. ✓ User clicks "Continue to Payment"
4. ✓ **Modal is SKIPPED** → Uses student data from context
5. ✓ Payment window opens with authenticated student details
6. ✓ After payment, normal flow (no redirect with params)

**Validation Points:**
- [ ] Student context data used correctly
- [ ] Modal skipped for authenticated users
- [ ] Payment API receives student data

---

### Test 5: Guest User (No URL Parameters, Not Authenticated)
**URL:**
```
https://app.com/store
```
User is not logged in.

**Expected Flow:**
1. ✓ Store page loads
2. ✓ User adds courses and goes to cart
3. ✓ User clicks "Continue to Payment"
4. ✓ **Modal SHOWS** → Checkout form appears
5. ✓ User fills in:
   - Student Name: "Jane Smith"
   - Contact: "8765432109"
   - Email: "jane@example.com"
6. ✓ User submits form
7. ✓ Payment window opens
8. ✓ After payment, redirects appropriately (login redirect or store without params)

**Validation Points:**
- [ ] Modal appears for guest users
- [ ] Form fields editable and functional
- [ ] Form submission works correctly
- [ ] Payment API receives form data

---

### Test 6: Partial Parameters (Only Name, No Contact/Email)
**URL:**
```
https://app.com/store?studentname=John%20Doe
```

**Expected Behavior:**
- urlParams.studentName = "John Doe"
- urlParams.contact = null
- urlParams.email = null

**Expected Flow:**
1. ✓ Store page loads
2. ✓ User navigates to cart with parameter
3. ✓ **Modal SHOWS** (condition requires ALL three parameters)
4. ✓ Form is pre-populated with:
   - Student Name: "John Doe" (from URL)
   - Contact: "" (empty)
   - Email: "" (empty)
5. ✓ User fills missing fields
6. ✓ User submits

**Validation Points:**
- [ ] Partial parameters trigger modal display
- [ ] Available parameters pre-fill form
- [ ] User can complete missing fields
- [ ] Form submission works

---

### Test 7: Special Characters in Email/Name
**URL:**
```
https://app.com/store?studentname=Jo%20%2B%20John&contact=1234567890&email=john%2Bdoe%40example.com
```

**Expected Behavior:**
- URL encoding properly decoded
- studentname: "Jo + John"
- email: "john+doe@example.com"

**Validation Points:**
- [ ] encodeURIComponent() correctly encoding special characters
- [ ] URL decoding works in URLSearchParams
- [ ] Special characters appear correctly in form and API

---

### Test 8: Manual Form Submission (Modal Path)
**Scenario:** Modal shows and user manually fills form

**Steps:**
1. Navigate to `/cart` without parameters
2. Click "Continue to Payment"
3. Modal appears
4. User enters:
   - Name: "Test User"
   - Contact: "9999999999"
   - Email: "test@example.com"
5. User clicks "Proceed to Payment"

**Expected Result:**
- Modal redirects to payment
- Payment API receives manually entered data
- No URL parameter redirect (user filled form, not from URL)

**Validation Points:**
- [ ] Modal form accepts input
- [ ] Form validation works (10-digit contact)
- [ ] Manual submission works like before

---

### Test 9: Cart Clearing and Returning
**Scenario:** User goes through payment and returns to store

**Steps:**
1. Add items to cart
2. Click "View Cart" with URL params
3. Click "Continue to Payment" with URL params
4. Payment window opens
5. Payment completes
6. User redirected to `/store?studentname=...&contact=...&email=...`
7. Cart should be empty (cleared after payment)

**Validation Points:**
- [ ] Cart clears after successful payment
- [ ] User returns to store with params
- [ ] Can add new items and checkout again with same params

---

### Test 10: Mobile Responsiveness
**Device:** Mobile phone or responsive design mobile view

**Scenarios:**
1. Access with URL params on mobile
2. Add items (responsive cart interface)
3. Proceed to checkout
4. Form should be mobile-optimized
5. Payment window should open properly

**Validation Points:**
- [ ] URL params work on mobile
- [ ] Cart layout responsive
- [ ] Form fields touch-friendly
- [ ] Payment window opens correctly

---

## Browser Console Checks

Run these in browser console to verify implementation:

```javascript
// Check 1: Verify URL parameters are being extracted
const params = new URLSearchParams(window.location.search);
console.log('studentname:', params.get('studentname'));
console.log('contact:', params.get('contact'));
console.log('email:', params.get('email'));
console.log('isMobile:', params.get('isMobile'));

// Check 2: Verify state is being set (in React DevTools)
// Look for urlParams state in CartPage component

// Check 3: Verify navigation includes parameters
// Monitor network tab when clicking "View Cart"
// Should see: /cart?studentname=...&contact=...&email=...

// Check 4: Verify sessionStorage
console.log(sessionStorage.getItem('hideLayoutControls'));

// Check 5: Monitor payment API call
// Open Network tab and look for:
// POST /admin/payment/fetch-public-checkout-url
// Check Request body for correct firstName/lastName split
```

---

## Network Tab Inspection

### Store → Cart Navigation
**Expected Request/Response:**
- Type: XHR or Navigation
- URL: `/cart?studentname=...&contact=...&email=...`
- Status: 200

### Payment API Call
**Expected Request:**
```
Method: POST
URL: /admin/payment/fetch-public-checkout-url
Body: {
    "firstName": "hemu",
    "lastName": "rajpoot",
    "contact": "1234567890",
    "email": "hemu@gmail.com",
    "instId": 262,
    "campaignId": null,
    "coupon": "",
    "coursePricingId": 0,
    "entityModals": [...]
}
Status: 200
Response: { "status": true, "url": "payment_window_url" }
```

### Post-Payment Redirect
**Expected Request:**
- Navigation to `/store?studentname=...&contact=...&email=...`
- Status: 200

---

## Debugging Tips

If tests fail:

1. **Modal still shows when it shouldn't:**
   - Check: Are ALL three parameters present in URL?
   - Check: Are they being extracted correctly?
   - Log: `console.log(urlParams)` in CartPage

2. **Parameters lost in navigation:**
   - Check: Are they being encoded with `encodeURIComponent()`?
   - Check: Query string in navigation URL
   - Look at Network tab for actual URL

3. **Name splitting incorrect:**
   - Check: Split logic in handleProcessPayment()
   - Test: `"hemu rajpoot".split(' ')` → ["hemu", "rajpoot"]
   - Test: `"John Michael Doe".split(' ')` → should give firstName="John", lastName="Michael Doe"

4. **Payment API receives wrong data:**
   - Check: Name splitting in both CartPage and ProceedToCheckoutForm
   - Monitor: Network tab for actual request body
   - Verify: API expects this format

5. **Redirect not happening:**
   - Check: navigate() is being called after payment
   - Check: URL params are being constructed correctly
   - Monitor: Network tab for final navigation

---

## Performance Considerations

✓ URL parameter extraction is lightweight (using URLSearchParams)  
✓ No additional API calls needed  
✓ State management is minimal (3 string values)  
✓ Navigation logic adds minimal overhead  
✓ Modal skip improves UX by reducing steps  

---

## Browser Compatibility

✓ URLSearchParams: IE 11+, All modern browsers  
✓ encodeURIComponent: All browsers  
✓ React Router v7: All modern browsers  
✓ Window.location.search: All browsers  

---

## Regression Testing

Ensure existing functionality still works:

- [ ] Cart add/remove items without URL params
- [ ] Checkout with authenticated user (no params)
- [ ] Checkout with guest user filling form
- [ ] Login flow still works
- [ ] Clear cart button still works
- [ ] Product filtering still works
- [ ] Mobile layout still responsive

---

## Status Summary

**Implementation:** ✅ Complete  
**Code Review:** ✅ Complete  
**Documentation:** ✅ Complete  
**Ready for Testing:** ✅ Yes  
**Ready for Deployment:** ⏳ Pending Test Results  

---

## Notes for QA

- Test with real-world names (special characters, multiple words)
- Test payment window behavior (may vary by browser)
- Test on various devices (mobile, tablet, desktop)
- Test with slow network conditions
- Test payment flow interruption (close window, browser back, etc.)
