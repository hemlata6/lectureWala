# Visual Architecture & Flow Diagrams

## 1. URL Parameter Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser URL with Parameters                                    │
│  store?studentname=hemu%20rajpoot&contact=1234567890&email=... │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Store.js Component                                             │
│  - User adds courses to cart                                    │
│  - Clicks "View Cart" button                                    │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  handleShowCart() Function                                      │
│  - Extract: studentname, contact, email from URL               │
│  - Encode with encodeURIComponent()                            │
│  - Build query string: ?studentname=...&contact=...&email=...  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  navigate('/cart?studentname=...&contact=...&email=...')        │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  CartPage.jsx Component                                         │
│  - useEffect extracts URL parameters                            │
│  - Stores in state: urlParams                                   │
│  - User views cart and clicks "Continue to Payment"             │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  handleProceedToCheckout() - DECISION POINT                     │
│                                                                  │
│  if (urlParams has all 3) OR (isAuthenticated)                  │
│      ├─→ Direct to handleProcessPayment()                      │
│      │   Modal SKIPPED ✓                                        │
│      └─→ Payment window opens                                   │
│  else                                                            │
│      └─→ Show ProceedToCheckoutForm Modal                       │
│          User fills form                                        │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────┴────────┐
                    ▼                 ▼
          MODAL SKIPPED         MODAL SHOWN
              │                     │
              │ (URL params or      │ (Guest no params)
              │  authenticated)     │
              │                     ▼
              │            ProceedToCheckoutForm
              │            - Auto-populate from URL
              │            - Let user edit
              │            - User submits
              │                     │
              └─────────┬───────────┘
                        ▼
        ┌──────────────────────────────────────┐
        │  handleProcessPayment()               │
        │  - Split name: firstName, lastName    │
        │  - Build API body                     │
        │  - POST /admin/payment/fetch-...      │
        │  - Open payment window                │
        └──────────────────────────────────────┘
                        │
                        ▼
        ┌──────────────────────────────────────┐
        │  Payment Window                       │
        │  (External payment gateway)           │
        │  - User completes payment             │
        │  - Window closes                      │
        └──────────────────────────────────────┘
                        │
                        ▼
        ┌──────────────────────────────────────┐
        │  Post-Payment Actions                │
        │  - Clear cart from localStorage       │
        │  - If URL params exist:               │
        │    navigate('/store?params=...')     │
        │  - Else: redirect to login or store  │
        └──────────────────────────────────────┘
                        │
                        ▼
        ┌──────────────────────────────────────┐
        │  Back to Store                        │
        │  /store?studentname=...&contact=...  │
        │  User can continue shopping!          │
        └──────────────────────────────────────┘
```

---

## 2. Modal Skipping Decision Tree

```
                    ┌─────────────────────────────┐
                    │   User Clicks "Proceed"     │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Check Conditions      │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
    Do URL params         Is user              Neither
    have all 3?       authenticated?           condition
    (name,contact,       (studentData          met
     email)              available)            │
         │                    │                 │
         │ YES               │ YES              │ NO
         │                    │                 │
         ├────────┬───────────┘                 │
         │        │                            │
         ▼        ▼                            ▼
    ┌─────────────────┐         ┌──────────────────────┐
    │  SKIP MODAL     │         │  SHOW MODAL FORM     │
    │                 │         │                      │
    │ Direct to       │         │ - Auto-populate from │
    │ handleProcess   │         │   URL params         │
    │ Payment()       │         │ - Show form fields   │
    │ with:           │         │ - User fills missing │
    │ ├─ entityModals │         │ - User submits form  │
    │ └─ urlParamsData│         │                      │
    │   (student info)│         │ Then proceed to      │
    │                 │         │ handleProcessPayment │
    └────────┬────────┘         └──────────────┬───────┘
             │                                 │
             └─────────────────┬───────────────┘
                               │
                    ┌──────────▼───────────┐
                    │ handleProcessPayment │
                    │   - Build API body   │
                    │   - Split name       │
                    │   - POST /payment    │
                    │   - Open window      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Payment Complete     │
                    │ Redirect back        │
                    └──────────────────────┘
```

---

## 3. Data Structure Diagram

```
URL Parameters (Input)
├── studentname: "hemu rajpoot"
├── contact: "1234567890"
├── email: "hemu@gmail.com"
└── isMobile: "true" (optional)

                        ↓ (extraction in CartPage)

urlParams State (CartPage.jsx)
├── studentName: "hemu rajpoot"
├── contact: "1234567890"
└── email: "hemu@gmail.com"

                        ↓ (passed to handleProcessPayment)

urlParamsData Object
├── studentName: "hemu rajpoot"
├── contact: "1234567890"
└── email: "hemu@gmail.com"

                        ↓ (name splitting)

Individual Fields
├── firstName: "hemu"
├── lastName: "rajpoot"
├── contact: "1234567890"
└── email: "hemu@gmail.com"

                        ↓ (building API body)

Payment API Request Body
├── firstName: "hemu"
├── lastName: "rajpoot"
├── contact: "1234567890"
├── email: "hemu@gmail.com"
├── instId: 262
├── campaignId: null
├── coupon: ""
├── coursePricingId: 0
└── entityModals: [{...}, {...}]

                        ↓ (server processes)

Payment Gateway Response
└── url: "payment_checkout_link"

                        ↓ (redirect after payment)

URL for Store Redirect
├── studentname: "hemu%20rajpoot"
├── contact: "1234567890"
└── email: "hemu@gmail.com"
```

---

## 4. Component Communication Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        Store.js                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ handleShowCart()                                       │ │
│  │ - Extract URL params (studentname, contact, email)   │ │
│  │ - Build new URL with params                           │ │
│  │ - Call navigate('/cart?params=...')                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                        │ navigate()
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                      CartPage.jsx                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ useEffect (extract URL params)                         │ │
│  │ - Get: studentname, contact, email from URL            │ │
│  │ - Set state: urlParams                                 │ │
│  │ - Determine: show or skip modal                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ handleProceedToCheckout()                              │ │
│  │ - Check: urlParams OR isAuthenticated                  │ │
│  │ - If YES: skip modal, call handleProcessPayment()     │ │
│  │ - If NO: show ProceedToCheckoutForm Modal              │ │
│  └────────────────────────────────────────────────────────┘ │
│                        │                                     │
│                        ├─────────────┬──────────────────┐   │
│                        │ (has params) │ (no params)      │   │
│                        ▼             ▼                  ▼   │
│        handleProcessPayment()  Modal Form      Modal Form   │
│        (auto, direct)          (user input)    (authenticated)
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ handleProcessPayment(payloadCart, urlParamsData)      │ │
│  │ - If urlParamsData: use URL params                     │ │
│  │ - Else: use studentData from context                   │ │
│  │ - Split name: firstName, lastName                      │ │
│  │ - Build payment API body                               │ │
│  │ - POST /admin/payment/fetch-public-checkout-url        │ │
│  │ - Open payment window                                  │ │
│  │ - Clear cart                                           │ │
│  │ - Redirect to Store with params                        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                        │ show Modal
                        ▼
┌──────────────────────────────────────────────────────────────┐
│              ProceedToCheckoutForm.jsx                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ useEffect (extract URL params)                         │ │
│  │ - Get: studentname, contact, email from URL            │ │
│  │ - Auto-populate form fields with URL params            │ │
│  │ - Fallback to studentData if not available             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Form Fields (editable)                                 │ │
│  │ - Student Name: [populated from URL or user input]     │ │
│  │ - Contact: [populated from URL or user input]          │ │
│  │ - Email: [populated from URL or user input]            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ handleSubmit()                                         │ │
│  │ - Get form values                                      │ │
│  │ - Split name: firstName, lastName                      │ │
│  │ - Build payment API body                               │ │
│  │ - POST /admin/payment/fetch-public-checkout-url        │ │
│  │ - Open payment window                                  │ │
│  │ - Close modal                                          │ │
│  │ - Redirect to Store with params (if available)         │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. State & Data Flow

```
Store.js
  URL Parameters (location.search)
    ├── studentname
    ├── contact
    ├── email
    └── isMobile
           │
           │ (extract in handleShowCart)
           │
           ▼
      Query String
    /cart?studentname=...&contact=...&email=...
           │
           │ (navigate)
           │
           ▼
CartPage.jsx
  location.search
    ├── studentname
    ├── contact
    ├── email
    └── isMobile
           │
           │ (useEffect: new URLSearchParams)
           │
           ▼
  State: urlParams
    ├── studentName: "hemu rajpoot"
    ├── contact: "1234567890"
    └── email: "hemu@gmail.com"
           │
           ├─────────────────┬──────────────┐
           │ (handleProceed)  │              │
           │                  │              │
           ▼                  ▼              ▼
    handleProcessPayment   showModal   showModal
    (auto, direct)         (guest)     (auth)
           │
           │ (if urlParamsData)
           │
           ▼
    urlParamsData {
      studentName: "hemu rajpoot",
      contact: "1234567890",
      email: "hemu@gmail.com"
    }
           │
           │ (split name)
           │
           ▼
    API Body {
      firstName: "hemu",
      lastName: "rajpoot",
      contact: "1234567890",
      email: "hemu@gmail.com",
      entityModals: [...]
    }
           │
           │ (POST request)
           │
           ▼
    Payment API Response
           │
           │ (window.open payment URL)
           │
           ▼
    User completes payment
           │
           │ (redirect after payment)
           │
           ▼
    navigate('/store?studentname=...&contact=...&email=...')
           │
           ▼
Store page loads with params
(User can add more items & checkout again)
```

---

## 6. Conditional Rendering Decision Flowchart

```
                    START: handleProceedToCheckout()
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Prepare entityModals  │
                    │ from cart items       │
                    └──────────┬────────────┘
                               │
                    ┌──────────▼────────────┐
                    │  Check Condition:     │
                    │                       │
                    │  urlParams.student    │
                    │  AND                  │
                    │  urlParams.contact    │
                    │  AND                  │
                    │  urlParams.email      │
                    │  OR                   │
                    │  isAuthenticated      │
                    └──────────┬────────────┘
                               │
                    ┌──────────▴──────────┐
                    │                     │
                   YES                    NO
                    │                     │
        ┌───────────▼─────────────┐     │
        │ Direct Payment Path      │     │
        │                         │     │
        │ Call:                   │     │
        │ handleProcessPayment(   │     │
        │   entityModals,        │     │
        │   {                    │     │
        │     studentName,       │     │
        │     contact,           │     │
        │     email              │     │
        │   }                    │     │
        │ )                       │     │
        │                         │     │
        │ Result:                 │     │
        │ - Skip Modal ✓         │     │
        │ - Payment Opens         │     │
        └───────────┬─────────────┘     │
                    │                   │
                    │          ┌────────▴──────────┐
                    │          │  Modal Form Path   │
                    │          │                    │
                    │          │ Prepare:           │
                    │          │ combinedCart       │
                    │          │ (regular + drip)   │
                    │          │                    │
                    │          │ Set state:         │
                    │          │ setCheckoutCart    │
                    │          │ CartCourses        │
                    │          │                    │
                    │          │ Set state:         │
                    │          │ setProceedTo       │
                    │          │ CheckoutModal      │
                    │          │ (true)             │
                    │          │                    │
                    │          │ Result:            │
                    │          │ - Show Modal ✓     │
                    │          │ - User Fills Form  │
                    │          │ - User Submits     │
                    │          └────────┬───────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Payment Processing │
                    │ and Redirection    │
                    └────────────────────┘
```

---

## 7. Name Splitting Logic

```
Input: Full Name String
  │
  ├─ "hemu rajpoot"
  ├─ "John Doe"
  ├─ "John Michael Doe"
  └─ "Jane"

         │
         │ split(' ')
         │
         ▼

Split Result: Array
  │
  ├─ ["hemu", "rajpoot"]
  ├─ ["John", "Doe"]
  ├─ ["John", "Michael", "Doe"]
  └─ ["Jane"]

         │
         │ nameParts[0]
         │
         ▼

firstName
  │
  ├─ "hemu"
  ├─ "John"
  ├─ "John"
  └─ "Jane"

         AND

         │
         │ nameParts.slice(1).join(' ')
         │
         ▼

lastName
  │
  ├─ "rajpoot"
  ├─ "Doe"
  ├─ "Michael Doe"
  └─ "" (empty)

         │
         │ Fallback: || ''
         │
         ▼

Final Result
  │
  ├─ firstName: "hemu", lastName: "rajpoot"
  ├─ firstName: "John", lastName: "Doe"
  ├─ firstName: "John", lastName: "Michael Doe"
  └─ firstName: "Jane", lastName: ""
```

---

## 8. URL Encoding/Decoding Flow

```
Original String
  │
  ├─ "hemu rajpoot"
  ├─ "john+doe@example.com"
  └─ "Jöhn Döe"

         │
         │ encodeURIComponent()
         │ (when building URL)
         │
         ▼

Encoded String (Safe for URL)
  │
  ├─ "hemu%20rajpoot"
  ├─ "john%2Bdoe%40example.com"
  └─ "J%C3%B6hn%20D%C3%B6e"

         │
         │ (in URL query string)
         │
         ▼

URL
  │
  ├─ "store?studentname=hemu%20rajpoot"
  ├─ "store?email=john%2Bdoe%40example.com"
  └─ "store?studentname=J%C3%B6hn%20D%C3%B6e"

         │
         │ new URLSearchParams(search)
         │ .get('key')
         │ (automatic decoding)
         │
         ▼

Decoded String (Back to Original)
  │
  ├─ "hemu rajpoot"
  ├─ "john+doe@example.com"
  └─ "Jöhn Döe"

         │
         │ (Used in forms and API)
         │
         ▼

Used in Application
```

---

## Summary

These diagrams illustrate:
1. **Complete parameter flow** from Store to Cart to Checkout to Payment
2. **Decision tree** for modal skipping logic
3. **Data structure evolution** as parameters move through components
4. **Component communication** and data passing
5. **State management** throughout the journey
6. **Conditional rendering** based on multiple conditions
7. **Name splitting algorithm** for firstName/lastName extraction
8. **URL encoding/decoding** for special characters

All components work together to provide a seamless checkout experience!
