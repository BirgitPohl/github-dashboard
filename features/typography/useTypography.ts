/**
 * Typography composable for handling text formatting and utilities
 */
export const useTypography = () => {
  /**
   * Get semantic heading level based on content hierarchy
   */
  const getSemanticLevel = (context: 'page-title' | 'section-title' | 'subsection' | 'card-title'): 1 | 2 | 3 | 4 | 5 | 6 => {
    const levelMap = {
      'page-title': 1,
      'section-title': 2, 
      'subsection': 3,
      'card-title': 4
    } as const
    
    return levelMap[context]
  }

  /**
   * Get appropriate size based on heading level and context
   */
  const getSizeForLevel = (level: 1 | 2 | 3 | 4 | 5 | 6, context: 'hero' | 'standard' | 'compact' = 'standard'): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' => {
    const sizeMap = {
      hero: {
        1: '3xl',
        2: '2xl', 
        3: 'xl',
        4: 'lg',
        5: 'md',
        6: 'sm'
      },
      standard: {
        1: '3xl',
        2: '2xl',
        3: 'lg', 
        4: 'md',
        5: 'sm',
        6: 'xs'
      },
      compact: {
        1: '2xl',
        2: 'xl',
        3: 'lg',
        4: 'md', 
        5: 'sm',
        6: 'xs'
      }
    } as const
    
    return sizeMap[context][level]
  }

  /**
   * Get variant based on semantic meaning
   */
  const getVariantForContext = (context: 'default' | 'muted'): 'primary' | 'secondary' => {
    const variantMap = {
      'default': 'primary',
      'muted': 'secondary'
    } as const
    
    return variantMap[context]
  }

  /**
   * Generate heading props for common use cases
   */
  const getHeadingProps = (
    semanticContext: 'page-title' | 'section-title' | 'subsection' | 'card-title',
    visualContext: 'hero' | 'standard' | 'compact' = 'standard',
    colorContext: 'default' | 'muted' = 'default'
  ) => {
    const level = getSemanticLevel(semanticContext)
    const size = getSizeForLevel(level, visualContext)
    const variant = getVariantForContext(colorContext)

    return {
      level,
      size,
      variant
    }
  }

  return {
    getSemanticLevel,
    getSizeForLevel,
    getVariantForContext,
    getHeadingProps
  }
}