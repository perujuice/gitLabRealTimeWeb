import { fetchCommits } from '../models/gitLabApi.js'

/**
 *
 * @param req
 * @param res
 */
export async function getCommits (req, res) {
  try {
    const commits = await fetchCommits(process.env.PROJECT_ID)
    res.json(commits)
  } catch (err) {
    console.error('Error fetching commits:', err)
    res.status(500).send('Failed to fetch commits')
  }
}
