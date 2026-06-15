interface CategoryConfig {
  color: string
  bgColor: string
  borderColor: string
  icon: string
  label: string
}

const buildTriple = (role: 'success' | 'info' | 'tertiary' | 'warning' | 'error' | 'neutral', icon: string, label: string): CategoryConfig => ({
  color: `var(--color-${role})`,
  bgColor: `var(--color-${role}-bright)`,
  borderColor: `var(--color-${role})`,
  icon,
  label,
})

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'web application':   buildTriple('success',  '🌐', 'Web App'),
  'api/service':       buildTriple('info',     '⚡', 'API/Service'),
  'library/component': buildTriple('tertiary', '📦', 'Library'),
  'documentation':     buildTriple('warning',  '📚', 'Docs'),
  'tool/utility':      buildTriple('error',    '🔧', 'Tool'),
}

const DEFAULT_CATEGORY = buildTriple('neutral', '📁', 'General')

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
