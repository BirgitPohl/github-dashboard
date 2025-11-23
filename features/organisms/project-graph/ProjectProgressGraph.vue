<template>
  <div class="progress-graph-container">
    <div class="graph-header">
      <Header :level="3" size="base" variant="primary">
        Progress Over Time (Last 30 Days)
      </Header>
      <Text v-if="currentData" variant="tertiary" size="sm">
        {{ currentData.open }} open, {{ currentData.closed }} closed
      </Text>
    </div>

    <div v-if="timeSeriesData.length > 0" class="graph-content">
      <!-- Time Series Area Chart -->
      <svg class="chart" :viewBox="`0 0 ${chartWidth} ${chartHeight}`" preserveAspectRatio="xMidYMid meet">
        <!-- Grid lines -->
        <g class="grid">
          <line
            v-for="i in 5"
            :key="`grid-${i}`"
            :x1="padding.left"
            :y1="padding.top + ((chartHeight - padding.top - padding.bottom) / 4) * (i - 1)"
            :x2="chartWidth - padding.right"
            :y2="padding.top + ((chartHeight - padding.top - padding.bottom) / 4) * (i - 1)"
            stroke="var(--color-gray-200)"
            stroke-width="1"
          />
        </g>

        <!-- Closed area (stacked on bottom) -->
        <path
          :d="closedAreaPath"
          fill="var(--color-success-500)"
          fill-opacity="0.3"
        />
        <path
          :d="closedLinePath"
          fill="none"
          stroke="var(--color-success-500)"
          stroke-width="2"
        />

        <!-- Open area (stacked on top of closed) -->
        <path
          :d="openAreaPath"
          fill="var(--color-gray-400)"
          fill-opacity="0.3"
        />
        <path
          :d="openLinePath"
          fill="none"
          stroke="var(--color-gray-400)"
          stroke-width="2"
        />

        <!-- X-axis labels (dates) -->
        <g class="x-axis">
          <text
            v-for="(point, index) in timeSeriesData"
            v-if="index % 5 === 0 || index === timeSeriesData.length - 1"
            :key="`x-label-${index}`"
            :x="getX(index)"
            :y="chartHeight - padding.bottom + 20"
            text-anchor="middle"
            font-size="11"
            fill="var(--color-gray-500)"
          >
            {{ formatDateLabel(point.date) }}
          </text>
        </g>

        <!-- Y-axis labels (counts) -->
        <g class="y-axis">
          <text
            v-for="i in 5"
            :key="`y-label-${i}`"
            :x="padding.left - 10"
            :y="padding.top + ((chartHeight - padding.top - padding.bottom) / 4) * (i - 1) + 5"
            text-anchor="end"
            font-size="11"
            fill="var(--color-gray-500)"
          >
            {{ Math.round(maxValue - (maxValue / 4) * (i - 1)) }}
          </text>
        </g>
      </svg>

      <!-- Legend -->
      <div class="graph-legend">
        <div class="legend-item">
          <div class="legend-color closed" />
          <Text variant="secondary" size="sm">Closed</Text>
        </div>
        <div class="legend-item">
          <div class="legend-color open" />
          <Text variant="secondary" size="sm">Open</Text>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <Text variant="tertiary" size="sm">
        No items to display
      </Text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectGraph } from './useProjectGraph'

interface ProjectItem {
  id: string
  type: 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE'
  state: string
  created_at: string
  updated_at: string
  [key: string]: any
}

interface Props {
  items: ProjectItem[]
}

const props = defineProps<Props>()

const { calculateTimeSeriesData, formatDateLabel } = useProjectGraph()

const timeSeriesData = computed(() => calculateTimeSeriesData(props.items))
const currentData = computed(() => timeSeriesData.value[timeSeriesData.value.length - 1])

// Chart dimensions
const chartWidth = 800
const chartHeight = 300
const padding = { top: 20, right: 20, bottom: 40, left: 50 }

// Calculate max value for Y-axis scaling
const maxValue = computed(() => {
  if (timeSeriesData.value.length === 0) return 0
  return Math.max(...timeSeriesData.value.map(d => d.total)) || 1
})

// Helper to get X coordinate for a data point
const getX = (index: number): number => {
  const dataWidth = chartWidth - padding.left - padding.right
  const step = dataWidth / (timeSeriesData.value.length - 1 || 1)
  return padding.left + (index * step)
}

// Helper to get Y coordinate for a value
const getY = (value: number): number => {
  const dataHeight = chartHeight - padding.top - padding.bottom
  const scale = dataHeight / maxValue.value
  return chartHeight - padding.bottom - (value * scale)
}

// Generate SVG path for closed area (stacked at bottom)
const closedAreaPath = computed(() => {
  if (timeSeriesData.value.length === 0) return ''

  const points = timeSeriesData.value.map((d, i) => ({
    x: getX(i),
    y: getY(d.closed)
  }))

  let path = `M ${points[0].x} ${chartHeight - padding.bottom}`
  points.forEach(p => {
    path += ` L ${p.x} ${p.y}`
  })
  path += ` L ${points[points.length - 1].x} ${chartHeight - padding.bottom} Z`

  return path
})

// Generate SVG path for closed line
const closedLinePath = computed(() => {
  if (timeSeriesData.value.length === 0) return ''

  const points = timeSeriesData.value.map((d, i) => ({
    x: getX(i),
    y: getY(d.closed)
  }))

  return 'M ' + points.map(p => `${p.x} ${p.y}`).join(' L ')
})

// Generate SVG path for open area (stacked on top of closed)
const openAreaPath = computed(() => {
  if (timeSeriesData.value.length === 0) return ''

  const points = timeSeriesData.value.map((d, i) => ({
    x: getX(i),
    yBottom: getY(d.closed),
    yTop: getY(d.closed + d.open)
  }))

  let path = `M ${points[0].x} ${points[0].yBottom}`
  points.forEach(p => {
    path += ` L ${p.x} ${p.yTop}`
  })
  for (let i = points.length - 1; i >= 0; i--) {
    path += ` L ${points[i].x} ${points[i].yBottom}`
  }
  path += ' Z'

  return path
})

// Generate SVG path for open line
const openLinePath = computed(() => {
  if (timeSeriesData.value.length === 0) return ''

  const points = timeSeriesData.value.map((d, i) => ({
    x: getX(i),
    y: getY(d.closed + d.open)
  }))

  return 'M ' + points.map(p => `${p.x} ${p.y}`).join(' L ')
})
</script>

<style scoped>
.progress-graph-container {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
}

.graph-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.chart {
  width: 100%;
  height: auto;
  max-height: 300px;
}

.graph-legend {
  display: flex;
  gap: var(--spacing-6);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--spacing-3);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-default);
}

.legend-color.closed {
  background: var(--color-success-500);
}

.legend-color.open {
  background: var(--color-gray-400);
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: var(--spacing-8) 0;
}
</style>
