import gitLabApi from '../models/gitLabApi.js'

const userController = {}
export default userController

/**
 * This method is used to redirect the user to GitLab for OAuth authentication.
 * This function is called when the user clicks the "Login with GitLab" button
 * @param {*} req The request object
 * @param {*} res The response object
 */
userController.redirectToGitLabOAuth = async (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITLAB_CLIENT_ID,
    redirect_uri: process.env.GITLAB_REDIRECT_URI,
    response_type: 'code',
    scope: 'api'
  })

  res.redirect(`https://gitlab.lnu.se/oauth/authorize?${params.toString()}`)
}

/**
 * Handles the GitLab OAuth callback, where GitLab redirects the user after authorization
 * @param {*} req - The request object containing the OAuth code
 * @param {*} res - The response object to send the result back to the client
 * @returns {*} - Error status in case of failure.
 */
userController.gitlabOAuthCallback = async (req, res) => {
  // This first lines are needed to get the code from the query parameters.
  // The code is sent by GitLab after the user authorizes the app.
  // The code is used to get the access token from GitLab, which is then used to fetch user info.
  const code = req.query.code // Extract the OAuth code from the query parameters
  if (!code) return res.status(400).send('Missing OAuth code')

  // The try block starts by sending a POST request to GitLab's token endpoint to exchange the code for an access token.
  try {
    const tokenRes = await fetch('https://gitlab.lnu.se/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Both the client_id and client_secret are needed to authenticate the app with GitLab.
        client_id: process.env.GITLAB_CLIENT_ID,
        client_secret: process.env.GITLAB_CLIENT_SECRET,
        code, // The code received from GitLab
        grant_type: 'authorization_code',
        redirect_uri: process.env.GITLAB_REDIRECT_URI // The same redirect URI used in the authorization request
      })
    })

    const tokenData = await tokenRes.json() // Parse the JSON response from GitLab
    const accessToken = tokenData.access_token // Extract the access token from the response

    // Store token in session
    req.session.gitlabToken = accessToken

    // Fetch user info from GitLab
    const userRes = await fetch('https://gitlab.lnu.se/api/v4/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    // extract user data from the response and store it in the session.
    const userData = await userRes.json()
    req.session.user = {
      id: userData.id,
      username: userData.username,
      name: userData.name,
      avatar_url: userData.avatar_url
    }

    console.log('Logged in as:', req.session.user.username) // Log the username

    // Redirect to the home page after successful login.
    res.redirect('/')
  } catch (err) {
    console.error('OAuth error:', err)
    res.status(500).send('OAuth failed')
  }
}

/**
 * Creates a webhook for a specific project in GitLab, using the GitLab API.
 * @param {*} req - The request object containing the project ID and user token
 * @param {*} res - The response object to send the result back to the client
 * @returns {*} - 401 status if user is not logged in.
 */
userController.createWebhookHandler = async (req, res) => {
  const token = req.session?.gitlabToken // Get the GitLab token from the session
  const projectId = req.params.id // Get the project ID from the request parameters

  if (!token) return res.status(401).send('User not logged in')

  try {
    const result = await gitLabApi.createWebhook(projectId, token)
    req.session.projectId = projectId // Store the project ID in the session for later use
    res.json({ success: true, webhook: result }) // Send the result back to the client
  } catch (err) {
    // Handle errors that may occur during the webhook creation process
    console.error('Webhook creation error:', err)
    res.status(500).send('Failed to create webhook')
  }
}

/**
 * Lists all projects for the authenticated user.
 * This method takes care of the /projects route: https://docs.gitlab.com/api/projects/#list-all-projects
 * @param {*} req - The request object containing the user token.
 * @param {*} res - The response object to send the result back to the client.
 * @returns {*} - 401 status if user is not logged in.
 */
userController.listUserProjects = async (req, res) => {
  // Get the GitLab token from the session
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
 * Handles user logout by destroying the session and clearing the session cookie.
 * @param {*} req - The request object
 * @param {*} res - The response object
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
 * Method to get the current user information from the session.
 * @param {*} req The request object
 * @param {*} res The response object
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
