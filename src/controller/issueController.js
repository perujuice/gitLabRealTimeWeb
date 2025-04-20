import { fetchIssues, closeIssue, commentOnIssue } from '../models/gitLabAPI.js'

/**
 * Method to fetch issues from GitHub repository
 * @param {*} req The request object
 * @param {*} res The response object
 */
export async function getIssues (req, res) {
  try {
    res.set('Cache-Control', 'no-store') // avoid caching
    const issues = await fetchIssues(process.env.PROJECT_ID)
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
    const allIssues = await fetchIssues(process.env.PROJECT_ID)
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
 *
 * @param req
 * @param res
 */
export async function commentOnIssueHandler (req, res) {
  try {
    const comment = await commentOnIssue(process.env.PROJECT_ID, req.params.id, req.body.comment)
    res.json(comment)
  } catch (error) {
    console.error('Error commenting on issue:', error)
    res.status(500).send('Failed to add comment')
  }
}
