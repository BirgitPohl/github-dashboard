interface StatusConfig {
  color: string
  onColor: string
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

const STATUS_CONFIGS = {
  failure: {
    color: 'var(--color-error)',
    onColor: 'var(--color-on-error)',
    textColor: 'text-red-700',
    bgColor: 'var(--color-error-bright)',
    borderColor: 'var(--color-error)',
    icon: '✗',
    label: 'Failed',
  },
  success: {
    color: 'var(--color-success)',
    onColor: 'var(--color-on-success)',
    textColor: 'text-green-700',
    bgColor: 'var(--color-success-bright)',
    borderColor: 'var(--color-success)',
    icon: '✓',
    label: 'Success',
  },
  cancelled: {
    color: 'var(--color-warning)',
    onColor: 'var(--color-on-warning)',
    textColor: 'text-amber-700',
    bgColor: 'var(--color-warning-bright)',
    borderColor: 'var(--color-warning)',
    icon: '○',
    label: 'Cancelled',
  },
  running: {
    color: 'var(--color-info)',
    onColor: 'var(--color-on-info)',
    textColor: 'text-blue-700',
    bgColor: 'var(--color-info-bright)',
    borderColor: 'var(--color-info)',
    icon: '◐',
    label: 'Running',
  },
  skipped: {
    color: 'var(--color-neutral)',
    onColor: 'var(--color-on-neutral)',
    textColor: 'text-gray-700',
    bgColor: 'var(--color-neutral-bright)',
    borderColor: 'var(--color-neutral)',
    icon: '−',
    label: 'Skipped',
  },
  disabled: {
    color: 'var(--color-neutral)',
    onColor: 'var(--color-on-neutral)',
    textColor: 'text-gray-700',
    bgColor: 'var(--color-neutral-bright)',
    borderColor: 'var(--color-neutral)',
    icon: '○',
    label: 'Disabled',
  },
  passed: {
    color: 'var(--color-success)',
    onColor: 'var(--color-on-success)',
    textColor: 'text-green-700',
    bgColor: 'var(--color-success-bright)',
    borderColor: 'var(--color-success)',
    icon: '✓',
    label: 'Passed',
  },
  unknown: {
    color: 'var(--color-neutral)',
    onColor: 'var(--color-on-neutral)',
    textColor: 'text-gray-700',
    bgColor: 'var(--color-neutral-bright)',
    borderColor: 'var(--color-neutral)',
    icon: '●',
    label: 'Unknown',
  },
} as const satisfies Record<string, StatusConfig>

/**
 * Composable for workflow status card logic
 * Determines visual configuration based on workflow state and status
 */
export const useWorkflowStatusCard = () => {
  const getStatusConfig = (workflow: Workflow): StatusConfig => {
    const state = workflow.state?.toLowerCase() || 'unknown'
    const status = workflow.status?.toLowerCase() || ''

    if (status.includes('failure') || status.includes('error') || status.includes('failed')) return STATUS_CONFIGS.failure
    if (status.includes('success')) return STATUS_CONFIGS.success
    if (status.includes('cancelled')) return STATUS_CONFIGS.cancelled
    if (status.includes('in_progress') || status.includes('queued')) return STATUS_CONFIGS.running
    if (status.includes('skipped')) return STATUS_CONFIGS.skipped
    if (state === 'disabled') return STATUS_CONFIGS.disabled
    if (state === 'active' && status.includes('completed')) return STATUS_CONFIGS.passed

    return { ...STATUS_CONFIGS.unknown, label: status || state || 'Unknown' }
  }

  return {
    getStatusConfig,
  }
}
