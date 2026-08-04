export const lightColors = {
  // Base background & surfaces
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',
  surfaceTertiary: '#E5E5EA',
  
  // Borders
  border: '#E5E5EA',
  borderLight: '#F2F2F7',
  
  // Main Brand Primary: Vibrant Orange (#FF9500)
  primary: '#FF9500',
  primaryLight: '#FFF5E6',
  primaryDark: '#E68200',

  // Status colors
  success: '#34C759',
  successBg: '#E8F9ED',
  successBorder: '#A3E9B8',
  
  warning: '#FF9500',
  warningBg: '#FFF5E6',
  warningBorder: '#FFD699',
  
  error: '#FF3B30',
  errorBg: '#FFEBEA',
  errorBorder: '#FFB3B0',

  info: '#5856D6',
  infoBg: '#F0F0FC',

  // Neutral typography colors
  textPrimary: '#000000',
  textSecondary: '#3C3C4399', // ~60% opacity dark gray
  textTertiary: '#3C3C434D',  // ~30% opacity dark gray
  textInverse: '#FFFFFF',
  
  athlete: {
    primary: '#FF9500',
    light: '#FFF5E6',
    shadow: '#FF9500',
  },
  coach: {
    primary: '#FF9500',
    light: '#FFF5E6',
    shadow: '#FF9500',
    accent: '#34C759',
    accentLight: '#E8F9ED',
  },
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const darkColors = {
  // Base background & surfaces
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  surfaceTertiary: '#3A3A3C',
  
  // Borders
  border: '#38383A',
  borderLight: '#2C2C2E',
  
  // Main Brand Primary: Vibrant Orange (#FF9500)
  primary: '#FF9500',
  primaryLight: 'rgba(255, 149, 0, 0.2)',
  primaryDark: '#E68200',

  // Status colors
  success: '#30D158',
  successBg: 'rgba(48, 209, 88, 0.15)',
  successBorder: '#1A4D2E',
  
  warning: '#FF9F0A',
  warningBg: 'rgba(255, 159, 10, 0.15)',
  warningBorder: '#4D3300',
  
  error: '#FF453A',
  errorBg: 'rgba(255, 69, 58, 0.15)',
  errorBorder: '#4D1410',

  info: '#64D2FF',
  infoBg: 'rgba(100, 210, 255, 0.15)',

  // Neutral typography colors
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  textInverse: '#000000',
  
  athlete: {
    primary: '#FF9500',
    light: 'rgba(255, 149, 0, 0.2)',
    shadow: '#FF9500',
  },
  coach: {
    primary: '#FF9500',
    light: 'rgba(255, 149, 0, 0.2)',
    shadow: '#FF9500',
    accent: '#30D158',
    accentLight: 'rgba(48, 209, 88, 0.15)',
  },
  overlay: 'rgba(0,0,0,0.7)',
} as const;

export const colors = lightColors;

export function getThemeColors(isDarkMode: boolean) {
  return isDarkMode ? darkColors : lightColors;
}

export type Role = 'athlete' | 'coach';

export function roleColors(_role?: Role) {
  return colors.coach;
}
