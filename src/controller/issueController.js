import gitLabApi from '../models/gitLabApi.js'

const issueController = {}
export default issueController

/**
 * Method to fetch issues from GitHub repository
 * @param {*} req The request object
 * @param {*} res The response object
 */
issueController.getIssues = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store') // avoid caching
    // Fetch all issues from the GitLab repository
    // Use the token from the session or environment variable
    // The session variable was needed once I implemented the GitLab OAuth flow, since the token is stored in the session.
    // If the user is not logged in, the token will be undefined and the default token will be used from the environment variable.
    const token = req.session?.gitlabToken || process.env.GITLAB_TOKEN
    const projectId = req.session.projectId || process.env.PROJECT_ID

    const issues = await gitLabApi.fetchIssues(projectId, token)
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
issueController.closeIssueHandler = async (req, res) => {
  try {
    const token = req.session?.gitlabToken || process.env.GITLAB_TOKEN
    const projectId = req.session.projectId || process.env.PROJECT_ID

    const allIssues = await gitLabApi.fetchIssues(projectId, token)
    const issue = allIssues.find(issue => issue.id.toString() === req.params.id) // find the specific issue by ID to close.

    if (!issue) {
      return res.status(404).send('Issue not found')
    }

    const closed = await gitLabApi.closeIssue(projectId, issue.iid) // issue.iid is the internal ID used by GitLab
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
issueController.commentOnIssueHandler = async (req, res) => {
  try {
  // Validate the request body to ensure it contains a valid comment, and that the comment is a string.
  // The comment should be between 1 and 1000 characters long.
    const { comment } = req.body
    if (typeof comment !== 'string' || comment.length === 0 || comment.length > 1000) {
      return res.status(400).send('Invalid comment')
    }

    // Fetch the project ID and token from the session or environment variable.
    // The session variable was needed once I implemented the GitLab OAuth flow, since the token is stored in the session.
    const token = req.session?.gitlabToken || process.env.GITLAB_TOKEN
    const projectId = req.session.projectId || process.env.PROJECT_ID

    // Fetch all issues from the GitLab repository.
    const allIssues = await gitLabApi.fetchIssues(projectId, token)
    const issue = allIssues.find(issue => issue.id.toString() === req.params.id)

    if (!issue) {
      return res.status(404).send('Issue not found')
    }

    // Comment on the issue using the GitLab API.
    const createdComment = await gitLabApi.commentOnIssue(projectId, issue.iid, comment, token)
    res.json(createdComment)
  } catch (error) {
    console.error('Error commenting on issue:', error)
    res.status(500).send('Failed to add comment')
  }
}
