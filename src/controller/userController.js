import gitLabApi from '../models/gitLabApi.js'

const userController = {}
export default userController

/**
 *
 * @param req
 * @param res
 */
userController.gitlabOAuthCallback = async (req, res) => {
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
    const accessToken = tokenData.access_token

    // Store token in session
    req.session.gitlabToken = accessToken

    // Fetch user info from GitLab
    const userRes = await fetch('https://gitlab.lnu.se/api/v4/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    const userData = await userRes.json()
    req.session.user = {
      id: userData.id,
      username: userData.username,
      name: userData.name,
      avatar_url: userData.avatar_url
    }

    console.log('Logged in as:', req.session.user.username) // Log the username

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
userController.createWebhookHandler = async (req, res) => {
  const token = req.session?.gitlabToken
  const projectId = req.params.id

  if (!token) return res.status(401).send('User not logged in')

  try {
    const result = await gitLabApi.createWebhook(projectId, token)
    req.session.projectId = projectId
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
userController.listUserProjects = async (req, res) => {
  const token = req.session?.gitlabToken
  if (!token) return res.status(401).send('User not logged in')

  try {
    const projects = await gitLabApi.fetchUserProjects(token)
    res.json(projects)
  } catch (err) {
    console.error('Error listing projects:', err)
    res.status(500).send('Failed to list user projects')
  }
}

/**
 *
 * @param req
 * @param res
 */
userController.logoutHandler = async (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err)
      return res.status(500).send('Failed to log out')
    }
    res.clearCookie('connect.sid', { path: '/' }) // Clear the session cookie
    res.redirect('/')
  })
}

/**
 * Returns the current logged-in user's basic info
 * @param {*} req
 * @param {*} res
 */
userController.getCurrentUser = async (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      username: req.session.user.username,
      name: req.session.user.name,
      avatar_url: req.session.user.avatar_url
    })
  } else {
    res.json({ loggedIn: false })
  }
}

/**
 * Redirects the user to GitLab's OAuth authorization page
 * This function is called when the user clicks the "Login with GitLab" button
 * @param {*} req The request object
 * @param {*} res The response object
 */
userController.redirectToGitLabOAuth = async (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITLAB_CLIENT_ID,
    redirect_uri: process.env.GITLAB_REDIRECT_URI,
    response_type: 'code',
    scope: 'read_user'
  })

  res.redirect(`https://gitlab.lnu.se/oauth/authorize?${params.toString()}`)
}
