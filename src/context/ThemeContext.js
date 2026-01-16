import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import instId from './instituteId';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Default Theme (existing behavior)
const defaultTheme = createTheme({
    palette: {
        primary: {
            main: '#3f51b5',
            light: '#5f6fbf',
            dark: '#2c3aa3',
        },
        secondary: {
            main: '#f50057',
            light: '#f73378',
            dark: '#ab003c',
        },
        background: {
            default: '#fafafa',
            paper: '#ffffff',
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.60)',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
});

// Black & Yellow Logo Theme - Dark Mode
const logoTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#FFC107', // Primary Yellow
            light: '#FFD54F',
            dark: '#FFB300', // Dark Yellow
        },
        secondary: {
            main: '#000000', // Black
            light: '#424242',
            dark: '#000000',
        },
        background: {
            default: '#121212', // Dark background
            paper: '#1E1E1E', // Dark paper/cards
        },
        text: {
            primary: '#FFFFFF', // White text
            secondary: 'rgba(255, 255, 255, 0.70)',
        },
        success: {
            main: '#4caf50',
        },
        warning: {
            main: '#FFC107',
        },
        error: {
            main: '#f44336',
        },
        info: {
            main: '#FFC107',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            color: '#FFC107',
        },
        h2: {
            color: '#FFC107',
        },
        h3: {
            color: '#FFFFFF',
        },
        h4: {
            color: '#FFFFFF',
        },
        h5: {
            color: '#FFFFFF',
        },
        h6: {
            color: '#FFFFFF',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
                contained: {
                    backgroundColor: '#FFC107',
                    color: '#000000',
                    boxShadow: '0 2px 8px rgba(255, 193, 7, 0.4)',
                    '&:hover': {
                        backgroundColor: '#FFD54F',
                        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.5)',
                    },
                },
                outlined: {
                    borderColor: '#FFC107',
                    borderWidth: '2px',
                    color: '#FFC107',
                    '&:hover': {
                        borderColor: '#FFD54F',
                        borderWidth: '2px',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#0F0F0F',
                    color: '#FFC107',
                    borderBottom: '1px solid rgba(255, 193, 7, 0.2)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1A1A1A',
                    border: '1px solid rgba(255, 193, 7, 0.2)',
                    borderLeft: '3px solid #FFC107',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.2)',
                        borderLeftColor: '#FFD54F',
                        transform: 'translateX(4px)',
                    },
                },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1E1E1E',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 193, 7, 0.2)',
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: '#2A2A2A',
                        color: '#FFC107',
                        borderBottom: '2px solid #FFC107',
                    },
                    '& .MuiDataGrid-cell': {
                        color: '#FFFFFF',
                        borderColor: 'rgba(255, 193, 7, 0.1)',
                    },
                    '& .MuiDataGrid-footerContainer': {
                        backgroundColor: '#2A2A2A',
                        borderTop: '2px solid #FFC107',
                    },
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2A2A2A',
                    color: '#FFFFFF',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFC107',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFD54F',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFC107',
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#1E1E1E',
                    borderTop: '4px solid #FFC107',
                    color: '#FFFFFF',
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFC107',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFD54F',
                    },
                },
            },
        },
    },
});

// Theme list for dropdown
export const THEMES = {
    DEFAULT: 'logo',
    LOGO: 'default',
};

export const THEME_NAMES = {
    'default': 'Light',
    'logo': 'Dark',
};

const themeMap = {
    'default': defaultTheme,
    'logo': logoTheme,
};

export const ThemeProviderWrapper = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        // Determine default theme based on instId
        const defaultThemeForInst = instId === 262 ? 'default' : 'logo';
        
        // Get saved theme from localStorage
        const savedTheme = localStorage.getItem('selectedTheme');

        // If no saved theme exists, set it to the default for this institute
        if (!savedTheme) {
            localStorage.setItem('selectedTheme', defaultThemeForInst);
            return defaultThemeForInst;
        }

        // If saved theme is invalid, reset to default for this institute
        if (!themeMap[savedTheme]) {
            localStorage.setItem('selectedTheme', defaultThemeForInst);
            return defaultThemeForInst;
        }

        return savedTheme;
    });

    useEffect(() => {
        // Save theme to localStorage whenever it changes
        localStorage.setItem('selectedTheme', currentTheme);

        // Get the current theme's colors
        const theme = themeMap[currentTheme];
        const backgroundColor = theme.palette.background.default;
        const paperColor = theme.palette.background.paper;
        const textColor = theme.palette.text.primary;
        const textSecondary = theme.palette.text.secondary;
        const primaryColor = theme.palette.primary.main;
        const primaryLight = theme.palette.primary.light;
        const primaryDark = theme.palette.primary.dark;
        const secondaryColor = theme.palette.secondary.main;

        // Set data attribute for theme-specific CSS
        document.documentElement.setAttribute('data-theme', currentTheme);

        // Set CSS custom properties for global theming
        const root = document.documentElement;
        root.style.setProperty('--theme-bg-default', backgroundColor);
        root.style.setProperty('--theme-bg-paper', paperColor);
        root.style.setProperty('--theme-text-primary', textColor);
        root.style.setProperty('--theme-text-secondary', textSecondary);
        root.style.setProperty('--theme-primary', primaryColor);
        root.style.setProperty('--theme-primary-light', primaryLight);
        root.style.setProperty('--theme-primary-dark', primaryDark);
        root.style.setProperty('--theme-secondary', secondaryColor);

        // Apply to body and root elements
        if (document.body) {
            document.body.style.backgroundColor = backgroundColor;
            document.body.style.color = textColor;
            document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        }
        if (document.documentElement) {
            document.documentElement.style.backgroundColor = backgroundColor;
            document.documentElement.style.color = textColor;
            document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        }

        // Apply to #root element
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.style.backgroundColor = backgroundColor;
            rootElement.style.color = textColor;
            rootElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        }
    }, [currentTheme]);

    const switchTheme = (themeName) => {
        if (themeMap[themeName]) {
            setCurrentTheme(themeName);
        }
    };

    const muiTheme = themeMap[currentTheme];

    return (
        <ThemeContext.Provider value={{ currentTheme, switchTheme, themeName: THEME_NAMES[currentTheme] }}>
            <ThemeProvider theme={muiTheme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
