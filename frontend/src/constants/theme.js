// KisanDrishti Design System Tokens
// Based on Bharat Civil Service Interface design system from Stitch

export const COLORS = {
  // Primary palette
  primary: '#1F4D2C',           // Deep Green
  primaryDark: '#043617',       // Darker green for headers
  primaryLight: '#BCEFC2',      // Light green tint
  primaryContainer: '#1F4D2C',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#8CBD93',
  inversePrimary: '#A0D3A7',

  // Secondary / Action palette
  secondary: '#805600',
  secondaryContainer: '#FFB639', // Mustard Yellow
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#6E4900',
  action: '#E5A022',            // Primary CTA color (Mustard Yellow)
  actionText: '#000000',        // Text on action buttons

  // Tertiary
  tertiary: '#4F1D2A',
  tertiaryContainer: '#6A3340',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#E79DAC',

  // Error / Danger
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',
  onErrorContainer: '#93000A',

  // Surfaces
  background: '#F9F9F9',
  surface: '#F9F9F9',
  surfaceDim: '#DADADA',
  surfaceBright: '#F9F9F9',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F3F3F3',
  surfaceContainer: '#EEEEEE',
  surfaceContainerHigh: '#E8E8E8',
  surfaceContainerHighest: '#E2E2E2',
  surfaceVariant: '#E2E2E2',

  // On-surface
  onSurface: '#1A1C1C',
  onSurfaceVariant: '#414941',
  inverseSurface: '#2F3131',
  inverseOnSurface: '#F1F1F1',

  // Outline / Borders
  outline: '#717970',
  outlineVariant: '#C1C9BE',
  border: '#D1D1D1',

  // Utility
  ashGray: '#666666',
  officialBlue: '#0C0566',
  surfaceTint: '#3A6844',

  // Semantic status
  healthy: '#2E7D32',
  diseased: '#C62828',
  warning: '#F57F17',
  info: '#0C0566',

  // Transparent
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
};

export const TYPOGRAPHY = {
  headlineLg: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.48, // -0.02em * 24
  },
  headlineMd: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  labelBold: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.6, // 0.05em * 12
    textTransform: 'uppercase',
  },
  labelSm: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
};

export const SPACING = {
  unit: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  marginMobile: 16,
  gutter: 12,
  stackSm: 8,
  stackMd: 16,
  stackLg: 24,
};

export const RADIUS = {
  sm: 2,
  default: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
};

export const BORDERS = {
  default: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  focused: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
};

export const SHADOWS = {
  // Flat UI — no shadows, but we keep a minimal one for FAB if needed
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  BORDERS,
  SHADOWS,
};
