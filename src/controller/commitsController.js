import { fetchCommits } from '../models/gitLabApi.js'

/**
 *
 * @param req
 * @param res
 */
export async function getCommits (req, res) {
  try {
    const token = req.session?.gitlabToken || process.env.GITLAB_TOKEN
    const projectId = process.env.PROJECT_ID

    const commits = await fetchCommits(projectId, token)
    res.json(commits)
  } catch (err) {
    console.error('Error fetching commits:', err)
    res.status(500).send('Failed to fetch commits')
  }
}
