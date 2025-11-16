/**
 * Temporary test endpoint to verify REST API works
 * DELETE THIS FILE after verification
 */

import { fetchProjectsREST, fetchProjectItemsREST } from '../utils/github-rest'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const projectNumber = query.projectNumber as string

  try {
    if (projectNumber) {
      // Test fetching items for a specific project
      console.log(`Testing REST API: Fetching items for project ${projectNumber}`)
      const items = await fetchProjectItemsREST(parseInt(projectNumber))

      // Log first item's fields to see what we get
      if (items.length > 0) {
        console.log('First item fields:', items[0].fields)
        console.log('Parent issue fields:', items[0].fields.filter(f => f.type === 'parent_issue'))
      }

      return {
        success: true,
        itemCount: items.length,
        firstItem: items[0] || null,
        parentIssueFields: items[0]?.fields.filter(f => f.type === 'parent_issue') || []
      }
    } else {
      // Test fetching projects list
      console.log('Testing REST API: Fetching projects list')
      const projects = await fetchProjectsREST()

      return {
        success: true,
        projectCount: projects.length,
        projects: projects.map(p => ({
          number: p.number,
          title: p.title,
          state: p.state
        }))
      }
    }
  } catch (error) {
    console.error('REST API test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})
