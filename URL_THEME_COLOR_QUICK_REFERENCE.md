# Quick Reference - URL Theme & Color Testing

## Test URLs Ready to Use

### 1. Dark Mode + Red Color (#f44336)
```
?isMobile=true&isDarkMode=true&colorCode=%23f44336
```
**Result**: Dark background with red UI elements

### 2. Dark Mode + Purple Color (#9c27b0)
```
?isMobile=true&isDarkMode=true&colorCode=%239c27b0
```
**Result**: Dark background with purple UI elements

### 3. Dark Mode + Cyan Color (#00bcd4)
```
?isMobile=true&isDarkMode=true&colorCode=%2300bcd4
```
**Result**: Dark background with cyan UI elements

### 4. Light Mode + Green Color (#4caf50)
```
?isMobile=true&colorCode=%234caf50
```
**Result**: Light background with green UI elements

### 5. Dark Mode + Blue Color (#2196f3)
```
?isMobile=true&isDarkMode=true&colorCode=%232196f3
```
**Result**: Dark background with blue UI elements

### 6. Dark Mode + Orange Color (#ff9800)
```
?isMobile=true&isDarkMode=true&colorCode=%23ff9800
```
**Result**: Dark background with orange UI elements

### 7. With Authentication Token
```
?isMobile=true&token=eyJ1c2VySWQiOjMzMzYzNywidGltZXN0YW1wIjoxNzY3NTIxODY0OTYyLCJleHBpcnkiOjE3OTc1MjE4NjQ5NjJ9&isDarkMode=true&colorCode=%23e91e63
```
**Result**: Dark mode + pink color + authenticated student session

## Complete URL Format

```
http://localhost:3000/?isMobile=true&token=<JWT_TOKEN>&isDarkMode=true&colorCode=<HEX_COLOR>
```

**Parameter Explanations**:
- `isMobile=true` - **Required** to enable theme/color customization
- `token=...` - Optional authentication token
- `isDarkMode=true` - Optional, switches to dark theme
- `colorCode=%23RRGGBB` - Optional custom color (URL encoded)

## Common Hex Colors (URL Encoded)

| Color | Hex | URL Encoded | Usage |
|-------|-----|-------------|-------|
| Red | #f44336 | %23f44336 | Error/Important |
| Pink | #e91e63 | %23e91e63 | Accent |
| Purple | #9c27b0 | %239c27b0 | Premium/Special |
| Blue | #2196f3 | %232196f3 | Primary |
| Cyan | #00bcd4 | %2300bcd4 | Secondary |
| Teal | #009688 | %23009688 | Success |
| Green | #4caf50 | %234caf50 | Approved |
| Orange | #ff9800 | %23ff9800 | Warning |
| Yellow | #ffc107 | %23ffc107 | Highlight |
| Brown | #795548 | %23795548 | Professional |

## URL Encoding Notes

When using custom colors in URLs:
- `#` becomes `%23`
- Rest of the hex code stays the same

**Example**:
- Color: `#ff5722`
- Encoded: `%23ff5722`
- Full parameter: `colorCode=%23ff5722`

## What Gets Customized

With the `colorCode` parameter, these UI elements change color:

### Mobile View
- Filter pill borders and text
- Filter pill active backgrounds
- Mobile filter dialog tab left borders
- Filter tab text colors
- Icon/badge backgrounds

### Material-UI Components
- Button styling
- AppBar accent color
- Card borders and accents
- Select/Input borders
- Dialog borders

## Testing Checklist

- [ ] Test dark mode activation with `isDarkMode=true`
- [ ] Test custom color application
- [ ] Verify mobile layout is activated
- [ ] Check filter pills display correct colors
- [ ] Check mobile dialog tabs use correct colors
- [ ] Test color fallback when invalid code provided
- [ ] Test without parameters (should use defaults)
- [ ] Test with token authentication
- [ ] Test dark mode + default color (no colorCode)
- [ ] Test light mode + custom color

## Real-World Example

A call to the app from an external system:

```javascript
// Generate URL dynamically
const studentToken = 'eyJ1c2VySWQiOjMzMzYzNywidGltZXN0YW1wIjoxNzY3NTIxODY0OTYyLCJleHBpcnkiOjE3OTc1MjE4NjQ5NjJ9';
const brandColor = '#667eea'; // Brand purple
const isDark = true;

const url = `${window.location.origin}/?isMobile=true&token=${studentToken}&isDarkMode=${isDark}&colorCode=${encodeURIComponent(brandColor)}`;

// Open in iframe or new window
window.open(url, '_blank');
```

## Support Matrix

| Feature | Status |
|---------|--------|
| Dark Theme | ✅ Supported |
| Custom Colors | ✅ Supported |
| Mobile Layout | ✅ Supported |
| Authentication | ✅ Supported |
| Filter UI Updates | ✅ Supported |
| Material-UI Theme | ✅ Supported |
| CSS Variables | ✅ Supported |
| Fallback Colors | ✅ Supported |

## Current Implementation Files

- **Theme Logic**: `src/context/ThemeContext.js`
- **Component Integration**: `src/pages/Store.js`
- **Theme Switcher**: `src/components/layout/ThemeSwitcher.jsx`

## Notes

- All filter elements use the primary color dynamically
- Theme persists for the entire session
- Colors are applied via inline styles for dynamic flexibility
- Invalid color codes silently fall back to defaults
- No CSS framework color names - only hex codes
