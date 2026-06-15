const MAX_OVERRIDES = 10

/**
 * Semantic color roles that may be overridden via the BRAND_COLORS env var.
 * Keys in the JSON are camelCase; CSS variables are kebab-case.
 */
const ALLOWED_ROLES: Record<string, string> = {
  primary: '--color-primary',
  primaryBright: '--color-primary-bright',
  primaryDark: '--color-primary-dark',
  secondary: '--color-secondary',
  secondaryBright: '--color-secondary-bright',
  secondaryDark: '--color-secondary-dark',
  tertiary: '--color-tertiary',
  tertiaryBright: '--color-tertiary-bright',
  tertiaryDark: '--color-tertiary-dark',
  success: '--color-success',
  successBright: '--color-success-bright',
  successDark: '--color-success-dark',
  warning: '--color-warning',
  warningBright: '--color-warning-bright',
  warningDark: '--color-warning-dark',
  error: '--color-error',
  errorBright: '--color-error-bright',
  errorDark: '--color-error-dark',
  info: '--color-info',
  infoBright: '--color-info-bright',
  infoDark: '--color-info-dark',
}

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

/**
 * Reads BRAND_COLORS from runtime config (a JSON string), validates each entry
 * against the allowlist and a hex-color regex, and returns a `:root { ... }`
 * CSS snippet that overrides the design-token defaults. At most 10 overrides
 * are honored. Unknown keys, malformed values, and parse errors are ignored.
 */
export function useBrandThemeCss(): string {
  const { public: { brandColors } } = useRuntimeConfig()
  const raw = (brandColors as string | undefined)?.trim()
  if (!raw) return ''

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return ''
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return ''

  const declarations: string[] = []
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (declarations.length >= MAX_OVERRIDES) break
    const cssVar = ALLOWED_ROLES[key]
    if (!cssVar) continue
    if (typeof value !== 'string' || !HEX_RE.test(value)) continue
    declarations.push(`${cssVar}: ${value};`)
  }
  if (declarations.length === 0) return ''
  return `:root { ${declarations.join(' ')} }`
}
