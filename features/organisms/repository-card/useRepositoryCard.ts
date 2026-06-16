interface CategoryConfig {
  color: string
  bgColor: string
  borderColor: string
  icon: string
  label: string
}

type Role = 'success' | 'info' | 'tertiary' | 'warning' | 'error' | 'neutral'
type Tone = 'base' | 'dark'

const buildTriple = (role: Role, icon: string, label: string, tone: Tone = 'base'): CategoryConfig => {
  const accent = tone === 'dark' ? `var(--color-${role}-dark)` : `var(--color-${role})`
  return {
    color: accent,
    bgColor: `var(--color-${role}-bright)`,
    borderColor: accent,
    icon,
    label,
  }
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'web application':   buildTriple('success',  'lucide:globe',     'Web App', 'dark'),
  'api/service':       buildTriple('info',     'lucide:zap',       'API/Service'),
  'library/component': buildTriple('tertiary', 'lucide:package',   'Library'),
  'documentation':     buildTriple('warning',  'lucide:book-open', 'Docs'),
  'tool/utility':      buildTriple('error',    'lucide:wrench',    'Tool'),
}

const DEFAULT_CATEGORY = buildTriple('neutral', 'lucide:folder', 'General')

/**
 * Composable for repository card logic
 * Determines visual configuration based on repository category.
 */
export const useRepositoryCard = () => {
  const getCategoryConfig = (category: string): CategoryConfig =>
    CATEGORY_CONFIGS[category.toLowerCase()] ?? DEFAULT_CATEGORY

  const formatSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) return `${sizeInKB} KB`
    const mb = sizeInKB / 1024
    if (mb < 1024) return `${mb.toFixed(1)} MB`
    const gb = mb / 1024
    return `${gb.toFixed(1)} GB`
  }

  return {
    getCategoryConfig,
    formatSize,
  }
}
