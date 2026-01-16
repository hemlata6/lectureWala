# Theme Switcher System Documentation

## Overview
A Material-UI (MUI) based theme system that allows users to switch between different themes globally across the entire application. The selected theme persists using localStorage and restores on page refresh.

## Available Themes

### 1. Default Theme
- **Primary Color**: Indigo (#3f51b5)
- **Secondary Color**: Pink (#f50057)
- **Background**: Light gray (#fafafa)
- **Use Case**: Default enterprise theme

### 2. Black & Yellow (Logo Theme)
- **Primary Color**: Yellow (#FFC107)
- **Secondary Color**: Black (#000000)
- **Background**: Very light yellow (#FFFEF5)
- **Use Case**: Brand-aligned theme based on logo colors

## File Structure

```
src/
├── context/
│   └── ThemeContext.js          # Theme context, providers, and theme definitions
├── components/
│   └── layout/
│       ├── UnifiedLayout.js     # Updated to include ThemeSwitcher
│       └── ThemeSwitcher.jsx    # Theme selection dropdown component
└── index.js                      # Updated to wrap app with ThemeProviderWrapper
```

## Components

### ThemeContext.js
**Purpose**: Central theme management

**Exports**:
- `ThemeProviderWrapper`: Wraps entire app with MUI ThemeProvider
- `useTheme()`: Hook to access theme context
- `THEMES`: Object with theme keys (DEFAULT, LOGO)
- `THEME_NAMES`: Display names for themes

**Features**:
- localStorage persistence
- Smooth theme transitions
- Extensible theme structure

### ThemeSwitcher.jsx
**Purpose**: Dropdown UI for theme selection

**Location**: Header (top-right, before cart icon)

**Features**:
- Material-UI Select component
- Styled to match current theme
- Shows all available themes

## Usage

### For Users
1. Click the "Theme" dropdown in the header
2. Select desired theme from options
3. Theme applies immediately
4. Selection persists on refresh

### For Developers

#### Using Theme in Components
```javascript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { currentTheme, themeName } = useTheme();
  
  return <div>Current theme: {themeName}</div>;
}
```

#### Accessing MUI Theme in styled components
```javascript
import { useTheme as useMuiTheme } from '@mui/material/styles';

function MyComponent() {
  const muiTheme = useMuiTheme();
  
  return (
    <div style={{
      color: muiTheme.palette.primary.main,
      backgroundColor: muiTheme.palette.background.default
    }}>
      Content
    </div>
  );
}
```

## Adding New Themes

To add a new theme, follow these steps:

1. **Define theme object** in `ThemeContext.js`:
```javascript
const myNewTheme = createTheme({
  palette: {
    primary: { main: '#YourColor' },
    secondary: { main: '#YourColor' },
    background: {
      default: '#BackgroundColor',
      paper: '#PaperColor'
    },
    // ... other palette settings
  },
  typography: { /* ... */ },
  components: { /* MUI component overrides */ }
});
```

2. **Add to theme map**:
```javascript
const themeMap = {
  [THEMES.DEFAULT]: defaultTheme,
  [THEMES.LOGO]: logoTheme,
  [THEMES.MY_NEW]: myNewTheme,  // Add here
};
```

3. **Add to THEMES enum**:
```javascript
export const THEMES = {
  DEFAULT: 'default',
  LOGO: 'logo',
  MY_NEW: 'my_new',  // Add here
};
```

4. **Add display name**:
```javascript
export const THEME_NAMES = {
  [THEMES.DEFAULT]: 'Default Theme',
  [THEMES.LOGO]: 'Black & Yellow',
  [THEMES.MY_NEW]: 'My New Theme',  // Add here
};
```

## Styling with MUI Components

All MUI components automatically reflect the current theme:

### Buttons
- Uses theme's primary color
- Changes on theme switch

### Cards & Paper
- Background adapts to theme
- Borders use theme colors

### DataGrid
- Header styling
- Cell borders
- Footer styling

### Dialogs
- Background and borders
- Typography colors

### Forms & Inputs
- Select elements
- Input borders
- Focus states

## LocalStorage

**Key**: `selectedTheme`
**Value**: Theme key (e.g., 'default', 'logo')
**Scope**: Browser-wide persistence

## Features

✅ **Persistent Theme Selection**: Survives page refreshes
✅ **Smooth Transitions**: Theme change animated at 0.3s
✅ **MUI Integration**: All components respect theme
✅ **Extensible**: Easy to add new themes
✅ **No Breaking Changes**: Existing code continues to work
✅ **Dark Mode Ready**: Structure supports dark mode addition

## Browser Compatibility

- Chrome/Edge: ✅ Full Support
- Firefox: ✅ Full Support
- Safari: ✅ Full Support
- IE11: ❌ Not Supported

## Performance Considerations

- Theme switching is O(1) operation
- No re-renders of unnecessary components
- CSS transitions use GPU acceleration
- localStorage writes are minimal

## Troubleshooting

### Theme not persisting?
- Check browser's localStorage is enabled
- Clear cache and refresh

### Theme not applying to all components?
- Ensure component is wrapped with `ThemeProvider`
- Check component uses MUI theme colors

### Custom styled components not respecting theme?
- Use `useTheme()` hook to access MUI theme
- Apply theme colors explicitly in styled components

## Future Enhancements

- [ ] Add dark mode variants
- [ ] Add theme preview modal
- [ ] Add custom theme builder
- [ ] Add theme scheduling (auto-switch by time)
- [ ] Add accessibility theme options
