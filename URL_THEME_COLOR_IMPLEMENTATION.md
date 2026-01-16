# URL Theme and Color Implementation Guide

## Overview
The application now supports dynamic theme switching and custom color application through URL parameters when `isMobile=true` is present.

## URL Parameters

### Supported Parameters:
```
?isMobile=true&token=<token>&isDarkMode=true&colorCode=#fff44336
```

- **isMobile**: `true` - Activates mobile mode and enables theme/color parameters
- **token**: JWT or authentication token for student identification
- **isDarkMode**: `true` - Switches to dark theme (logo theme)
- **colorCode**: `#RRGGBB` - Custom color code for the UI (e.g., `#fff44336`, `#2196f3`, `#4caf50`)

## How It Works

### 1. Theme Context (`src/context/ThemeContext.js`)

The `ThemeProviderWrapper` component now:
- Reads URL parameters on mount using `URLSearchParams`
- When `isMobile=true` AND `isDarkMode=true`, automatically switches to dark (logo) theme
- When `colorCode` is provided, applies the custom color to the UI
- Creates a modified Material-UI theme with the custom primary color

```javascript
// Auto-detect and apply theme/color from URL
const isMobileFromUrl = new URLSearchParams(window.location.search).get('isMobile') === 'true';
const isDarkModeFromUrl = new URLSearchParams(window.location.search).get('isDarkMode') === 'true';
const colorCodeFromUrl = new URLSearchParams(window.location.search).get('colorCode');
```

### 2. Store Component (`src/pages/Store.js`)

The `Store` component now:
- Imports `useTheme` from ThemeContext
- Accesses `customColor` from the theme hook
- Uses `getPrimaryColor()` function to determine the active color
- Applies color dynamically to all filter UI elements

```javascript
const { customColor } = useTheme();

const getPrimaryColor = () => {
  if (routeData && customColor) {
    return customColor; // Use URL custom color when isMobile=true
  }
  return routeData ? '#d97706' : '#2563eb'; // Use default colors
};
```

### 3. Dynamic Color Application

All UI elements that previously used hardcoded colors now use inline styles:

#### Filter Pills (Mobile Header)
```javascript
<button
  style={{
    borderColor: selectedDomain ? primaryColor : '#d1d5db',
    backgroundColor: selectedDomain ? `rgb(...primaryColor...)` : '#f9fafb',
    color: selectedDomain ? primaryColor : '#374151'
  }}
>
```

#### Mobile Filter Dialog Tabs
```javascript
<button
  style={{
    backgroundColor: mobileFilterTab === 'exam-type' ? 'white' : 'transparent',
    borderLeftColor: mobileFilterTab === 'exam-type' ? primaryColor : 'transparent',
    color: mobileFilterTab === 'exam-type' ? primaryColor : '#4b5563',
    fontWeight: mobileFilterTab === 'exam-type' ? '600' : '500'
  }}
>
```

## Example URLs

### Example 1: Dark Mode with Purple Color
```
?isMobile=true&token=eyJ1c2VySWQiOjMzMzYzNywidGltZXN0YW1wIjoxNzY3NTIxODY0OTYyLCJleHBpcnk6MTc5NzUyMTg2NDk2Mn0=&isDarkMode=true&colorCode=#9c27b0
```
- Activates mobile mode
- Sets dark theme
- Uses purple (#9c27b0) as primary color for all filters

### Example 2: Dark Mode with Custom Orange
```
?isMobile=true&isDarkMode=true&colorCode=#ff9800
```
- Activates mobile mode
- Sets dark theme
- Uses orange (#ff9800) as primary color

### Example 3: Light Mode with Custom Green
```
?isMobile=true&colorCode=#4caf50
```
- Activates mobile mode
- Keeps light theme (isDarkMode not set)
- Uses green (#4caf50) as primary color

## Color Styling Implementation

### RGB Conversion
```javascript
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 37, g: 99, b: 235 };
};
```

This converts hex colors to RGB for use in CSS rgba() functions for semi-transparent backgrounds.

## Components Updated

### Filter Elements with Dynamic Colors:
1. **Mobile Filter Button** - Border and text color
2. **Filter Pills** (header) - Border, background, and text colors
   - Exam Type
   - Exam Stage
   - Faculty
   - Paper
   - Product
   - Batch
   - Price
3. **Mobile Filter Dialog Header** - Border color and reset button text
4. **Mobile Filter Dialog Tabs** - Border-left and text colors
   - All tab buttons (Exam Type, Exam Stage, Paper, Faculty, Product, Batch, Price)

## Material-UI Theme Integration

When `customColor` is provided with dark mode, a modified Material-UI theme is created:

```javascript
if (customColor && currentTheme === 'logo') {
  muiTheme = createTheme({
    ...logoTheme,
    palette: {
      ...logoTheme.palette,
      primary: {
        main: customColor,
        light: customColor,
        dark: customColor,
      },
      info: { main: customColor },
      warning: { main: customColor },
    },
    components: {
      MuiButton: { /* styled with custom color */ },
      MuiAppBar: { /* styled with custom color */ },
      MuiCard: { /* styled with custom color */ },
    }
  });
}
```

## Browser Compatibility

The implementation uses:
- Standard `URLSearchParams` API (IE 11+)
- CSS custom properties via inline styles
- No browser-specific features

## Testing the Implementation

### Test URL 1 (Dark Mode + Custom Color):
```
http://localhost:3000/?isMobile=true&isDarkMode=true&colorCode=#e91e63
```
Expected: Dark background, pink UI elements, mobile layout

### Test URL 2 (Light Mode + Custom Color):
```
http://localhost:3000/?isMobile=true&colorCode=#00bcd4
```
Expected: Light background, cyan UI elements, mobile layout

### Test URL 3 (With Token):
```
http://localhost:3000/?isMobile=true&token=sample_token&isDarkMode=true&colorCode=#3f51b5
```
Expected: All of above + student authenticated

## Default Fallback

If no custom color is provided:
- When `isMobile=true`: Uses default amber color (#d97706)
- When `isMobile=false`: Uses default blue color (#2563eb)
- Theme defaults: Light mode unless `isDarkMode=true`

## CSS Variable Support

The ThemeContext also sets CSS custom properties that can be used in other components:

```css
--theme-primary: #customColor
--theme-primary-light: #customColorLight
--theme-primary-dark: #customColorDark
--theme-bg-default: <computed from theme>
--theme-text-primary: <computed from theme>
```

Usage in other components:
```javascript
<div style={{ backgroundColor: 'var(--theme-primary)' }}>
  Content with primary theme color
</div>
```

## Implementation Details

### Why This Approach?

1. **Performance**: Colors are computed once on component mount, not on every render
2. **Flexibility**: Works with any hex color code
3. **Consistency**: Theme colors cascade through Material-UI components
4. **Mobile-Only Activation**: URL parameter effects only activate when `isMobile=true`
5. **Fallback Colors**: Gracefully falls back to defaults if parameters are invalid

### Code Flow

1. User visits URL with parameters
2. `ThemeProviderWrapper` reads URL parameters
3. If `isDarkMode=true`, switches to logo (dark) theme
4. If `colorCode` provided, stores custom color and creates modified theme
5. `Store` component reads `customColor` from theme context
6. All filter UI applies `primaryColor` dynamically
7. Material-UI components use the modified theme with custom primary color

## Notes

- Only applies when `isMobile=true` is in the URL
- Colors must be valid hex format (#RRGGBB)
- Invalid color codes default to blue (#2563eb)
- Theme persists until URL parameters change
- Works across all pages inheriting ThemeContext

