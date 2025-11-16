interface ParsedError {
  title: string
  message: string
  code?: string | number
  details?: unknown
}

type ErrorInput = Error | string | { 
  message?: string
  data?: { message?: string }
  statusCode?: number
  status?: number
  code?: string | number
}

/**
 * Error handling composable for consistent error management
 */
export const useErrorBox = () => {
  /**
   * Parse error object to extract meaningful information
   */
  const parseError = (error: ErrorInput): ParsedError => {
    if (!error) {
      return { title: 'Unknown Error', message: 'An unexpected error occurred' }
    }

    if (typeof error === 'string') {
      return { title: 'Error', message: error }
    }

    if (error instanceof Error) {
      return { title: getErrorTitle(), message: error.message, details: error.stack }
    }

    return parseObjectError(error)
  }

  /**
   * Parse object-type errors
   */
  const parseObjectError = (error: Record<string, unknown>): ParsedError => {
    // Handle API errors with data property
    if ('data' in error && typeof error.data === 'object' && error.data !== null) {
      const data = error.data as Record<string, unknown>
      const statusCode = getStatusCode(error)
      
      return {
        title: getErrorTitle(statusCode),
        message: (data.message as string) || (error.message as string) || 'Request failed',
        code: statusCode,
        details: error.data
      }
    }

    // Handle errors with message property
    if ('message' in error) {
      const code = getErrorCode(error)
      return {
        title: getErrorTitle(code),
        message: error.message as string,
        code,
        details: error
      }
    }

    return { title: 'Error', message: 'An error occurred' }
  }

  /**
   * Extract status code from error object
   */
  const getStatusCode = (errorObj: Record<string, unknown>): number | undefined => {
    if ('statusCode' in errorObj) return errorObj.statusCode as number
    if ('status' in errorObj) return errorObj.status as number
    return undefined
  }

  /**
   * Extract error code from error object
   */
  const getErrorCode = (errorObj: Record<string, unknown>): string | number | undefined => {
    if ('code' in errorObj) return errorObj.code as string | number
    if ('status' in errorObj) return errorObj.status as string | number
    return undefined
  }

  /**
   * Get appropriate error title based on status code
   */
  const getErrorTitle = (statusCode?: string | number): string => {
    if (!statusCode) return 'Error'

    const code = Number(statusCode)
    
    switch (code) {
      case 400:
        return 'Bad Request'
      case 401:
        return 'Authentication Required'
      case 403:
        return 'Access Forbidden'
      case 404:
        return 'Not Found'
      case 429:
        return 'Rate Limited'
      case 500:
        return 'Server Error'
      case 502:
        return 'Bad Gateway'
      case 503:
        return 'Service Unavailable'
      default:
        return code >= 400 && code < 500 ? 'Client Error' : 'Server Error'
    }
  }

  /**
   * Get error variant based on error type/code
   */
  const getErrorVariant = (statusCode?: string | number): 'error' | 'warning' | 'info' => {
    if (!statusCode) return 'error'

    const code = Number(statusCode)
    
    if (code === 401 || code === 403) return 'warning'
    if (code === 404) return 'info'
    return 'error'
  }

  /**
   * Check if error is retryable
   */
  const isRetryableError = (statusCode?: string | number): boolean => {
    if (!statusCode) return true

    const code = Number(statusCode)
    
    // Don't retry client errors (4xx) except for 429 (rate limit)
    if (code >= 400 && code < 500) {
      return code === 429
    }
    
    // Retry server errors (5xx) and network errors
    return true
  }

  /**
   * Get suggested actions for error resolution
   */
  const getErrorActions = (statusCode?: string | number): string[] => {
    if (!statusCode) return ['Try refreshing the page', 'Check your internet connection']

    const code = Number(statusCode)
    
    switch (code) {
      case 401:
        return ['Check your authentication token', 'Log in again if necessary']
      case 403:
        return ['Verify you have the required permissions', 'Contact an administrator']
      case 404:
        return ['Check the URL is correct', 'The resource may have been moved or deleted']
      case 429:
        return ['Wait a moment before trying again', 'Rate limiting is active']
      case 500:
      case 502:
      case 503:
        return ['Try again in a few moments', 'The server may be temporarily unavailable']
      default:
        return ['Try refreshing the page', 'Contact support if the problem persists']
    }
  }

  return {
    parseError,
    getErrorTitle,
    getErrorVariant,
    isRetryableError,
    getErrorActions
  }
}