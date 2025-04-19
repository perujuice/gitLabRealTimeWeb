import { fetchIssues } from '../models/gitLabApi.js'

/**
 * Method to fetch issues from GitHub repository
 * @param {*} req The request object
 * @param {*} res The response object
 */
export async function getIssues(req, res) {
  try {
    res.set('Cache-Control', 'no-store') // avoid caching
    const issues = await fetchIssues(process.env.PROJECT_ID)
    res.json(issues)
  } catch (error) {
    console.error('Error fetching issues:', error)
    res.status(500).send('Failed to fetch issues')
  }
}
