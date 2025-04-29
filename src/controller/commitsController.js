import gitLabApi from '../models/gitLabApi.js'

/**
 * Fetch commits from GitLab API
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 */
export async function getCommits (req, res) {
  try {
    // Use session token or environment variable for GitLab token and project ID
    // As per the issues, the session token is needed for the gitlab Oauth flow, since there might be multiple users.
    // The defult is to use the environment variable for the token and project ID.
    const token = req.session?.gitlabToken || process.env.GITLAB_TOKEN
    const projectId = req.session.projectId || process.env.PROJECT_ID

    const commits = await gitLabApi.fetchCommits(projectId, token)
    res.json(commits)
  } catch (err) {
    console.error('Error fetching commits:', err)
    res.status(500).send('Failed to fetch commits')
  }
}
