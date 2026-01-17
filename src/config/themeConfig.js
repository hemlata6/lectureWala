/**
 * Theme Configuration File
 * Easy-to-edit centralized theme settings
 */

// Color Palette Constants
export const COLORS = {
  // Default Theme Colors
  DEFAULT_PRIMARY: '#3f51b5',
  DEFAULT_PRIMARY_LIGHT: '#5f6fbf',
  DEFAULT_PRIMARY_DARK: '#2c3aa3',
  DEFAULT_SECONDARY: '#f50057',
  DEFAULT_SECONDARY_LIGHT: '#f73378',
  DEFAULT_SECONDARY_DARK: '#ab003c',
  DEFAULT_BG: '#fafafa',
  DEFAULT_PAPER: '#ffffff',
  DEFAULT_TEXT_PRIMARY: 'rgba(0, 0, 0, 0.87)',
  DEFAULT_TEXT_SECONDARY: 'rgba(0, 0, 0, 0.60)',

  // Black & Yellow Theme Colors
  LOGO_PRIMARY: '#FFC107',
  LOGO_PRIMARY_LIGHT: '#FFD54F',
  LOGO_PRIMARY_DARK: '#FFA000',
  LOGO_SECONDARY: '#000000',
  LOGO_SECONDARY_LIGHT: '#424242',
  LOGO_SECONDARY_DARK: '#000000',
  LOGO_BG: '#FFFEF5',
  LOGO_PAPER: '#FFFFFF',
  LOGO_TEXT_PRIMARY: '#000000',
  LOGO_TEXT_SECONDARY: 'rgba(0, 0, 0, 0.70)',

  // Light Blue Theme Colors (Professional & Modern)
  LIGHTBLUE_PRIMARY: '#158ff0',
  LIGHTBLUE_PRIMARY_LIGHT: '#4DA8F7',
  LIGHTBLUE_PRIMARY_DARK: '#0D6BB8',
  LIGHTBLUE_SECONDARY: '#FF6B6B',
  LIGHTBLUE_SECONDARY_LIGHT: '#FF8E8E',
  LIGHTBLUE_SECONDARY_DARK: '#E63946',
  LIGHTBLUE_BG: '#F8FCFF',
  LIGHTBLUE_PAPER: '#FFFFFF',
  LIGHTBLUE_TEXT_PRIMARY: '#1A1A1A',
  LIGHTBLUE_TEXT_SECONDARY: 'rgba(26, 26, 26, 0.70)',

  // Common Colors (used in both themes)
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
};

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT: {
    name: 'Default Theme',
    palette: {
      primary: {
        main: COLORS.DEFAULT_PRIMARY,
        light: COLORS.DEFAULT_PRIMARY_LIGHT,
        dark: COLORS.DEFAULT_PRIMARY_DARK,
      },
      secondary: {
        main: COLORS.DEFAULT_SECONDARY,
        light: COLORS.DEFAULT_SECONDARY_LIGHT,
        dark: COLORS.DEFAULT_SECONDARY_DARK,
      },
      background: {
        default: COLORS.DEFAULT_BG,
        paper: COLORS.DEFAULT_PAPER,
      },
      text: {
        primary: COLORS.DEFAULT_TEXT_PRIMARY,
        secondary: COLORS.DEFAULT_TEXT_SECONDARY,
      },
      success: { main: COLORS.SUCCESS },
      warning: { main: COLORS.WARNING },
      error: { main: COLORS.ERROR },
      info: { main: COLORS.INFO },
    },
  },
  LOGO: {
    name: 'Black & Yellow',
    palette: {
      primary: {
        main: COLORS.LOGO_PRIMARY,
        light: COLORS.LOGO_PRIMARY_LIGHT,
        dark: COLORS.LOGO_PRIMARY_DARK,
      },
      secondary: {
        main: COLORS.LOGO_SECONDARY,
        light: COLORS.LOGO_SECONDARY_LIGHT,
        dark: COLORS.LOGO_SECONDARY_DARK,
      },
      background: {
        default: COLORS.LOGO_BG,
        paper: COLORS.LOGO_PAPER,
      },
      text: {
        primary: COLORS.LOGO_TEXT_PRIMARY,
        secondary: COLORS.LOGO_TEXT_SECONDARY,
      },
      success: { main: COLORS.SUCCESS },
      warning: { main: COLORS.WARNING },
      error: { main: COLORS.ERROR },
      info: { main: COLORS.INFO },
    },
  },
  LIGHTBLUE: {
    name: 'Light Blue Professional',
    palette: {
      primary: {
        main: COLORS.LIGHTBLUE_PRIMARY,
        light: COLORS.LIGHTBLUE_PRIMARY_LIGHT,
        dark: COLORS.LIGHTBLUE_PRIMARY_DARK,
      },
      secondary: {
        main: COLORS.LIGHTBLUE_SECONDARY,
        light: COLORS.LIGHTBLUE_SECONDARY_LIGHT,
        dark: COLORS.LIGHTBLUE_SECONDARY_DARK,
      },
      background: {
        default: COLORS.LIGHTBLUE_BG,
        paper: COLORS.LIGHTBLUE_PAPER,
      },
      text: {
        primary: COLORS.LIGHTBLUE_TEXT_PRIMARY,
        secondary: COLORS.LIGHTBLUE_TEXT_SECONDARY,
      },
      success: { main: COLORS.SUCCESS },
      warning: { main: COLORS.WARNING },
      error: { main: COLORS.ERROR },
      info: { main: COLORS.INFO },
    },
  },
};

// Transition Configuration
export const THEME_TRANSITION_DURATION = 300; // milliseconds

// LocalStorage Configuration
export const STORAGE_CONFIG = {
  KEY: 'selectedTheme',
  DEFAULT_VALUE: 'default',
};

// Typography Configuration (can be extended per theme)
export const TYPOGRAPHY_CONFIG = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontSize: '2.5rem', fontWeight: 600 },
  h2: { fontSize: '2rem', fontWeight: 600 },
  h3: { fontSize: '1.75rem', fontWeight: 600 },
  h4: { fontSize: '1.5rem', fontWeight: 600 },
  h5: { fontSize: '1.25rem', fontWeight: 600 },
  h6: { fontSize: '1rem', fontWeight: 600 },
  body1: { fontSize: '1rem', lineHeight: 1.5 },
  body2: { fontSize: '0.875rem', lineHeight: 1.43 },
};

// Component Overrides Configuration
export const COMPONENT_OVERRIDES = {
  BUTTON: {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: '0.5rem',
  },
  CARD: {
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  INPUT: {
    borderRadius: '0.5rem',
  },
  DIALOG: {
    borderRadius: '0.75rem',
  },
};

export default THEME_CONFIG;
