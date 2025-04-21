import { fetchIssues, closeIssue, commentOnIssue } from '../models/gitLabAPI.js'

/**
 * Method to fetch issues from GitHub repository
 * @param {*} req The request object
 * @param {*} res The response object
 */
export async function getIssues (req, res) {
  try {
    res.set('Cache-Control', 'no-store') // avoid caching
    const token = req.session?.gitlabToken || process.env.GITLAB_TOKEN
    const projectId = process.env.PROJECT_ID

    const issues = await fetchIssues(projectId, token)
    res.json(issues)
  } catch (error) {
    console.error('Error fetching issues:', error)
    res.status(500).send('Failed to fetch issues')
  }
}

/**
 * Method to close an issue by its ID
 * @param {*} req The request object
 * @param {*} res The response object
 * @returns {*} Error message if any.
 */
export async function closeIssueHandler (req, res) {
  try {
    const token = req.session?.gitlabToken || process.env.GITLAB_TOKEN
    const projectId = process.env.PROJECT_ID

    const allIssues = await fetchIssues(projectId, token)
    const issue = allIssues.find(issue => issue.id.toString() === req.params.id) // find the specific issue by ID to close.

    if (!issue) {
      return res.status(404).send('Issue not found')
    }

    const closed = await closeIssue(process.env.PROJECT_ID, issue.iid) // issue.iid is the internal ID used by GitLab
    res.json(closed)
  } catch (error) {
    console.error('Error closing issue:', error)
    res.status(500).send('Failed to close issue')
  }
}

/**
 * Adds a comment to an issue by its ID.
 * @param {*} req The request object
 * @param {*} res The response object
 * @returns {*} Error message if any.
 */
export async function commentOnIssueHandler (req, res) {
  try {
    // Fetch all issues to find the specific issue by its global ID
    const token = req.session?.gitlabToken || process.env.GITLAB_TOKEN
    const projectId = process.env.PROJECT_ID

    const allIssues = await fetchIssues(projectId, token)
    const issue = allIssues.find(issue => issue.id.toString() === req.params.id) // Match by global ID

    if (!issue) {
      return res.status(404).send('Issue not found') // Return 404 if the issue doesn't exist
    }

    // Use the internal IID to add the comment
    const comment = await commentOnIssue(process.env.PROJECT_ID, issue.iid, req.body.comment)
    res.json(comment)
  } catch (error) {
    console.error('Error commenting on issue:', error)
    res.status(500).send('Failed to add comment')
  }
}
