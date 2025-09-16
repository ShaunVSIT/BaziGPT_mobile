import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Primary colors matching the web app
  primary: '#ff9800',
  secondary: '#f44336',

  // Dark theme colors
  background: '#1a1a1a',
  surface: '#2d2d2d',
  card: '#3d3d3d',

  // Text colors
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  textMuted: '#808080',

  // Status colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',

  // Element colors for Bazi
  wood: '#4caf50',
  fire: '#f44336',
  earth: '#ff9800',
  metal: '#9e9e9e',
  water: '#2196f3',

  // Utility colors
  border: '#404040',
  divider: '#303030',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
};

export const SIZES = {
  // App dimensions
  width,
  height,

  // Font sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body: 16,
  caption: 14,
  small: 12,

  // Spacing
  base: 16,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Border radius
  radius: 8,
  radiusLg: 16,
  radiusXl: 24,

  // Icon sizes
  icon: 24,
  iconSm: 16,
  iconLg: 32,
  iconXl: 48,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
    elevation: 9,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10.32,
    elevation: 16,
  },
};

const theme = {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
};

export default theme;
