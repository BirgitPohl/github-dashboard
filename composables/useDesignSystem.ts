/**
 * Design System Composable
 *
 * Provides JavaScript/TypeScript access to design tokens
 * Useful for dynamic styling, computed styles, or programmatic color manipulation
 *
 * Usage:
 * ```ts
 * const { colors, typography, spacing } = useDesignSystem()
 * const buttonStyle = computed(() => ({
 *   backgroundColor: colors.primary[600],
 *   padding: `${spacing[4]} ${spacing[6]}`
 * }))
 * ```
 */
export const useDesignSystem = () => {
  /**
   * Color palette with semantic naming
   */
  const colors = {
    primary: {
      50: 'var(--color-primary-50)',
      100: 'var(--color-primary-100)',
      600: 'var(--color-primary-600)',
      700: 'var(--color-primary-700)',
      800: 'var(--color-primary-800)',
      900: 'var(--color-primary-900)',
    },
    gray: {
      50: 'var(--color-gray-50)',
      100: 'var(--color-gray-100)',
      200: 'var(--color-gray-200)',
      300: 'var(--color-gray-300)',
      400: 'var(--color-gray-400)',
      500: 'var(--color-gray-500)',
      600: 'var(--color-gray-600)',
      700: 'var(--color-gray-700)',
      800: 'var(--color-gray-800)',
      900: 'var(--color-gray-900)',
    },
    success: {
      50: 'var(--color-success-50)',
      500: 'var(--color-success-500)',
      700: 'var(--color-success-700)',
    },
    warning: {
      50: 'var(--color-warning-50)',
      500: 'var(--color-warning-500)',
      700: 'var(--color-warning-700)',
    },
    error: {
      50: 'var(--color-error-50)',
      500: 'var(--color-error-500)',
      600: 'var(--color-error-600)',
      700: 'var(--color-error-700)',
    },
    info: {
      50: 'var(--color-info-50)',
      500: 'var(--color-info-500)',
      700: 'var(--color-info-700)',
    },
    purple: {
      500: 'var(--color-purple-500)',
    },
    orange: {
      50: 'var(--color-orange-50)',
      100: 'var(--color-orange-100)',
      500: 'var(--color-orange-500)',
    },
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      tertiary: 'var(--color-text-tertiary)',
      muted: 'var(--color-text-muted)',
      inverse: 'var(--color-text-inverse)',
    },
    bg: {
      primary: 'var(--color-bg-primary)',
      secondary: 'var(--color-bg-secondary)',
      tertiary: 'var(--color-bg-tertiary)',
      overlay: 'var(--color-bg-overlay)',
      overlayDark: 'var(--color-bg-overlay-dark)',
    },
    border: {
      default: 'var(--color-border-default)',
      hover: 'var(--color-border-hover)',
      focus: 'var(--color-border-focus)',
    }
  } as const

  /**
   * Typography tokens
   */
  const typography = {
    fontSize: {
      '2xs': 'var(--font-size-2xs)',
      xs: 'var(--font-size-xs)',
      sm: 'var(--font-size-sm)',
      base: 'var(--font-size-base)',
      lg: 'var(--font-size-lg)',
      xl: 'var(--font-size-xl)',
      '2xl': 'var(--font-size-2xl)',
      '3xl': 'var(--font-size-3xl)',
      '4xl': 'var(--font-size-4xl)',
    },
    fontFamily: {
      sans: 'var(--font-family-sans)',
      mono: 'var(--font-family-mono)',
    },
    fontWeight: {
      normal: 'var(--font-weight-normal)',
      medium: 'var(--font-weight-medium)',
      semibold: 'var(--font-weight-semibold)',
      bold: 'var(--font-weight-bold)',
    },
    lineHeight: {
      tight: 'var(--line-height-tight)',
      snug: 'var(--line-height-snug)',
      base: 'var(--line-height-base)',
      normal: 'var(--line-height-normal)',
      relaxed: 'var(--line-height-relaxed)',
    },
    lineClamp: {
      1: 'var(--line-clamp-1)',
      2: 'var(--line-clamp-2)',
      3: 'var(--line-clamp-3)',
    }
  } as const

  /**
   * Spacing scale
   */
  const spacing = {
    0: 'var(--spacing-0)',
    1: 'var(--spacing-1)',
    2: 'var(--spacing-2)',
    3: 'var(--spacing-3)',
    4: 'var(--spacing-4)',
    5: 'var(--spacing-5)',
    6: 'var(--spacing-6)',
    7: 'var(--spacing-7)',
    8: 'var(--spacing-8)',
    10: 'var(--spacing-10)',
    12: 'var(--spacing-12)',
    16: 'var(--spacing-16)',
    20: 'var(--spacing-20)',
  } as const

  /**
   * Border radius scale
   */
  const radius = {
    none: 'var(--radius-none)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    full: 'var(--radius-full)',
  } as const

  /**
   * Box shadow scale
   */
  const shadows = {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  } as const

  /**
   * Transition durations
   */
  const transitions = {
    fast: 'var(--transition-fast)',
    base: 'var(--transition-base)',
    slow: 'var(--transition-slow)',
    slower: 'var(--transition-slower)',
  } as const

  /**
   * Layout constants
   */
  const layout = {
    containerMaxWidth: 'var(--container-max-width)',
    navHeight: 'var(--nav-height)',
    navHeightMobile: 'var(--nav-height-mobile)',
  } as const

  /**
   * Z-index layers
   */
  const zIndex = {
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    navigation: 100,
  } as const

  /**
   * Breakpoints (for media queries)
   */
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  } as const

  return {
    colors,
    typography,
    spacing,
    radius,
    shadows,
    transitions,
    layout,
    zIndex,
    breakpoints,
  }
}

/**
 * Type definitions for design tokens
 */
export type DesignSystemColors = ReturnType<typeof useDesignSystem>['colors']
export type DesignSystemTypography = ReturnType<typeof useDesignSystem>['typography']
export type DesignSystemSpacing = ReturnType<typeof useDesignSystem>['spacing']
export type DesignSystemRadius = ReturnType<typeof useDesignSystem>['radius']
export type DesignSystemShadows = ReturnType<typeof useDesignSystem>['shadows']
export type DesignSystemTransitions = ReturnType<typeof useDesignSystem>['transitions']
