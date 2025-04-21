import { createWebhook, fetchUserProjects } from '../models/gitLabApi.js'
import fetch from 'node-fetch'

/**
 *
 * @param req
 * @param res
 */
export async function gitlabOAuthCallback (req, res) {
  const code = req.query.code
  if (!code) return res.status(400).send('Missing OAuth code')

  try {
    const tokenRes = await fetch('https://gitlab.lnu.se/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITLAB_CLIENT_ID,
        client_secret: process.env.GITLAB_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GITLAB_REDIRECT_URI
      })
    })

    const tokenData = await tokenRes.json()
    req.session.gitlabToken = tokenData.access_token

    res.redirect('/')
  } catch (err) {
    console.error('OAuth error:', err)
    res.status(500).send('OAuth failed')
  }
}

/**
 *
 * @param req
 * @param res
 */
export async function createWebhookHandler (req, res) {
  const token = req.session?.gitlabToken
  const projectId = req.params.id

  if (!token) return res.status(401).send('User not logged in')

  try {
    const result = await createWebhook(projectId, token)
    res.json({ success: true, webhook: result })
  } catch (err) {
    console.error('Webhook creation error:', err)
    res.status(500).send('Failed to create webhook')
  }
}

/**
 *
 * @param req
 * @param res
 */
export async function listUserProjects (req, res) {
  const token = req.session?.gitlabToken
  if (!token) return res.status(401).send('User not logged in')

  try {
    const projects = await fetchUserProjects(token)
    res.json(projects)
  } catch (err) {
    console.error('Error listing projects:', err)
    res.status(500).send('Failed to list user projects')
  }
}
