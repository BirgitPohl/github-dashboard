interface StatusConfig {
  color: string
  textColor: string
  bgColor: string
  borderColor: string
  icon: string
  label: string
}

interface Workflow {
  state: string
  status: string
}

/**
 * Composable for workflow status card logic
 * Determines visual configuration based on workflow state and status
 */
export const useWorkflowStatusCard = () => {
  const getStatusConfig = (workflow: Workflow): StatusConfig => {
    const state = workflow.state?.toLowerCase() || 'unknown'
    const status = workflow.status?.toLowerCase() || ''

    // Check status/conclusion first (this is the actual run result)
    if (status.includes('failure') || status.includes('error') || status.includes('failed')) {
      return {
        color: '#ef4444', // Red
        textColor: 'text-red-700',
        bgColor: '#fef2f2', // Light red background
        borderColor: '#ef4444',
        icon: '✗',
        label: 'Failed'
      }
    } else if (status.includes('success')) {
      return {
        color: '#10b981', // Green
        textColor: 'text-green-700',
        bgColor: '#f0fdf4', // Light green background
        borderColor: '#10b981',
        icon: '✓',
        label: 'Success'
      }
    } else if (status.includes('cancelled')) {
      return {
        color: '#f59e0b', // Amber
        textColor: 'text-amber-700',
        bgColor: '#fffbeb', // Light amber background
        borderColor: '#f59e0b',
        icon: '○',
        label: 'Cancelled'
      }
    } else if (status.includes('in_progress') || status.includes('queued')) {
      return {
        color: '#3b82f6', // Blue
        textColor: 'text-blue-700',
        bgColor: '#eff6ff', // Light blue background
        borderColor: '#3b82f6',
        icon: '◐',
        label: 'Running'
      }
    } else if (status.includes('skipped')) {
      return {
        color: '#6b7280', // Gray
        textColor: 'text-gray-700',
        bgColor: '#f9fafb', // Light gray background
        borderColor: '#6b7280',
        icon: '−',
        label: 'Skipped'
      }
    } else if (state === 'disabled') {
      return {
        color: '#6b7280', // Gray
        textColor: 'text-gray-700',
        bgColor: '#f9fafb', // Light gray background
        borderColor: '#6b7280',
        icon: '○',
        label: 'Disabled'
      }
    } else if (state === 'active' && status.includes('completed')) {
      return {
        color: '#10b981', // Green
        textColor: 'text-green-700',
        bgColor: '#f0fdf4', // Light green background
        borderColor: '#10b981',
        icon: '✓',
        label: 'Passed'
      }
    } else {
      return {
        color: '#6b7280', // Gray
        textColor: 'text-gray-700',
        bgColor: '#f9fafb', // Light gray background
        borderColor: '#6b7280',
        icon: '●',
        label: status || state || 'Unknown'
      }
    }
  }

  return {
    getStatusConfig
  }
}
