# Token-Based API Integration for Student Details

## Overview
Integrated token-based API authentication to automatically fetch student details (name, contact, email) from `/student/fetch-details` endpoint instead of relying on URL parameters.

## Implementation Details

### 1. **Store.js Updates**
- **Added Token Extraction**: Extracts `token` from URL query parameters
- **Added State Variables**:
  - `fetchedStudentName` - Stores fetched student name
  - `fetchedStudentContact` - Stores fetched student contact
  - `fetchedStudentEmail` - Stores fetched student email
  - `studentDetailsLoading` - Loading state for API call

- **Added useEffect Hook**: 
  - Calls `/student/fetch-details` API endpoint with Bearer token
  - Stores fetched details in both state and sessionStorage for persistence
  - Falls back to URL parameters if token not present

- **Updated handlePurchaseCourse**:
  - Now includes token in query parameters when navigating to CourseExplore
  - Uses fetched student details (name, contact, email) for navigation
  - Falls back to URL parameters if API fetch hasn't completed

- **Updated Layout Control Effect**:
  - Now hides layout controls when token is present (in addition to existing conditions)

### 2. **CartPage.jsx Updates**
- **Added Token State Management**:
  - `tokenFromUrl` - Extracts token from URL
  - Fetched student details state variables
  - `studentDetailsLoading` state

- **Added API Integration Effect**:
  - Fetches student details on component mount if token present
  - Checks sessionStorage first to avoid redundant API calls
  - Stores fetched details for persistence across route changes

- **Updated ProceedToCheckoutForm Props**:
  - Now passes token and fetched student details to the form component
  - Form auto-populates with API-fetched data instead of URL parameters

- **Updated Layout Control**:
  - Hides layout controls when token is present

### 3. **CourseExplore.jsx Updates**
- **Added Imports**: Added `axios` for API calls

- **Added Token Extraction**: Extracts `token` from URL query parameters

- **Added State Variables**:
  - Fetched student details state (name, contact, email)
  - `studentDetailsLoading` state

- **Added API Integration Effect**:
  - Mirrors Cart implementation for consistency
  - Fetches from sessionStorage first (from Store/Cart)
  - Falls back to API call if token present but details not cached

- **Updated handlePurchase**:
  - Includes token in navigation parameters to Cart
  - Uses fetched student details in query string
  - Falls back to URL parameters if API call not complete

- **Updated Back Button**:
  - Includes token when navigating back to Store
  - Passes fetched student details to maintain consistency

## Data Flow

```
URL with Token: ?token=eyJ1c2VySWQiOjM3MDQ0NCwidGltZXN0YW1wIjoxNzY2NTY5OTI2MTU2LCJleHBpcnk6MT3k4N
     ↓
Store.js extracts token
     ↓
Calls /student/fetch-details API
     ↓
Fetches: firstName, lastName, phone, email
     ↓
Stores in sessionStorage & state
     ↓
Navigates to CourseExplore with token + fetched details
     ↓
CourseExplore checks sessionStorage (already cached)
     ↓
Navigates to Cart with token + fetched details
     ↓
CartPage checks sessionStorage or calls API if needed
     ↓
ProceedToCheckoutForm receives all student details
     ↓
Form auto-populates with fetched data
```

## Session Storage Keys Used
- `fetchedStudentName` - Full name from API
- `fetchedStudentContact` - Phone number from API
- `fetchedStudentEmail` - Email from API
- `studentToken` - Token for future reference
- `hideLayoutControls` - Flag to hide sidebar/footer
- `currentCourse` - Current course data
- `allCourses` - All course list

## API Endpoint
- **URL**: `/student/fetch-details`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **Response Fields Used**:
  - `firstName` - Student first name
  - `lastName` - Student last name
  - `phone` - Contact number
  - `email` - Email address

## Backward Compatibility
- System still supports URL parameters: `?studentname=X&contact=Y&email=Z`
- Falls back to URL params if token not present
- Works with authenticated users (original flow)
- Token takes priority if both token and URL params present

## Error Handling
- API call errors are logged to console
- System gracefully falls back to URL parameters on API failure
- Loading state prevents premature navigation
- SessionStorage caching prevents redundant API calls

## Testing URL Format
```
?isMobile=true&token=eyJ1c2VySWQiOjM3MDQ0NCwidGltZXN0YW1wIjoxNzY2NTY5OTI2MTU2LCJleHBpcnkiOjE3OTY1Njk5MjYxNTZ9
```

## Benefits
✅ No hardcoded student details in URLs
✅ Secure token-based authentication
✅ Automatic form population
✅ Consistent data across all routes
✅ Improved privacy (sensitive data not in URLs)
✅ Single source of truth (API response)
