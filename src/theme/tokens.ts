/**
 * Design Tokens do Locus (sincronizados com classroom-web/globals.css)
 */

export const colors = {
  ink: '#18191b',
  muted: '#5c5e63',
  paper: '#ffffff',
  surface: '#f5f5f5',
  border: '#e4e4e4',
  controlBorder: '#8a8c91',

  accent: {
    DEFAULT: '#ffc400',
    surface: '#fff4cc',
  },

  success: {
    DEFAULT: '#1e7a44',
    surface: '#e7f2eb',
  },

  warn: '#b45309',

  danger: {
    DEFAULT: '#c42b1c',
    surface: '#fbecea',
  },

  onInk: {
    DEFAULT: '#ffffff',
    muted: '#b8b9bd',
    subtle: '#86888d',
    border: '#3a3b3f',
    controlBorder: '#75777c',
  },
} as const;

export const fontFamilies = {
  sans: 'Archivo_400Regular',
  sansMedium: 'Archivo_500Medium',
  sansSemiBold: 'Archivo_600SemiBold',
  sansBold: 'Archivo_700Bold',
  sansExtraBold: 'Archivo_800ExtraBold',
  sansBlack: 'Archivo_900Black',
  mono: 'IBMPlexMono_400Regular',
  monoBold: 'IBMPlexMono_700Bold',
} as const;

export const typography = {
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
  },
  sectionSm: {
    fontSize: 28,
    lineHeight: 32,
  },
  sectionMd: {
    fontSize: 32,
    lineHeight: 38,
  },
  section: {
    fontSize: 40,
    lineHeight: 46,
  },
  finale: {
    fontSize: 52,
    lineHeight: 58,
  },
  codeSm: {
    fontSize: 44,
    lineHeight: 52,
  },
  code: {
    fontSize: 56,
    lineHeight: 64,
  },
  displayLg: {
    fontSize: 64,
    lineHeight: 68,
  },
} as const;

export const tracking = {
  tight: -0.3,
  normal: 0,
  caps: 1.2,
  code: 0.6,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const touchTargets = {
  minTouchTargetIos: 44,
  minTouchTargetAndroid: 48,
  buttonMd: 44,
  buttonLg: 52,
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;
