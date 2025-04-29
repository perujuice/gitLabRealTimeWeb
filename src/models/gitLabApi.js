const gitlabApi = {}
export default gitlabApi

/**
 * Method to fetch issues from GitLab API.
 * @param {*} projectId - The project ID to fetch issues from.
 * @param {*} token - The access token for authentication.
 * @returns {*} A promise that resolves to an array of issues.
 */
gitlabApi.fetchIssues = async (projectId, token = process.env.GITLAB_TOKEN) => {
  const response = await fetch(`https://gitlab.lnu.se/api/v4/projects/${projectId}/issues`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    console.error(`GitLab API error: ${response.statusText}`)
    return []
  }

  return await response.json()
}

/**
 * Closes an issue in GitLab.
 * @param {*} projectId The project ID to close the issue in.
 * @param {*} issueIid The issue IID to close.
 * @param {*} token Optional user token (fallback to default).
 * @returns {*} The response from the GitLab API.
 */
gitlabApi.closeIssue = async (projectId, issueIid, token = process.env.GITLAB_TOKEN) => {
  const res = await fetch(`https://gitlab.lnu.se/api/v4/projects/${projectId}/issues/${issueIid}`, {
    method: 'PUT', // Use PUT to update the issue state.
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ state_event: 'close' })
  })

  // Handle any errors.
  if (!res.ok) {
    const errorText = await res.text()
    console.error(`Failed to close issue ${issueIid}:`, res.status, errorText)
  }

  return await res.json()
}

/**
 * Adds a comment to an issue in GitLab.
 * @param {*} projectId The project ID to add the comment to.
 * @param {*} issueIid The issue IID to add the comment to.
 * @param {*} comment The comment text to add.
 * @param {*} token Optional user token (fallback to default).
 * @returns {*} The response from the GitLab API.
 */
gitlabApi.commentOnIssue = async (projectId, issueIid, comment, token = process.env.GITLAB_TOKEN) => {
  const res = await fetch(`https://gitlab.lnu.se/api/v4/projects/${projectId}/issues/${issueIid}/notes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body: comment })
  })

  // Error handling for the response.
  if (!res.ok) {
    const errorText = await res.text()
    console.error(`Failed to add comment to issue ${issueIid}:`, res.status, errorText)
  }

  return await res.json()
}

/**
 * Fetches commits from GitLab API.
 * @param {*} projectId - The project ID to fetch commits from.
 * @param {*} token - Optional access token.
 * @returns {*} A promise that resolves to an array of commits.
 */
gitlabApi.fetchCommits = async (projectId, token = process.env.GITLAB_TOKEN) => {
  const response = await fetch(`https://gitlab.lnu.se/api/v4/projects/${projectId}/repository/commits`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  // Check for errors in the response.
  if (!response.ok) {
    console.error(`GitLab API error: ${response.statusText}`)
    return []
  }

  return await response.json()
}

/**
 * Creates a webhook for a GitLab project.
 * @param {*} projectId - The project ID to create the webhook for.
 * @param {*} token - The access token for authentication.
 * @returns {*} The response from the GitLab API.
 */
gitlabApi.createWebhook = async (projectId, token) => {
  // https://docs.gitlab.com/api/project_webhooks/#add-a-webhook-to-a-project --> Documentation
  const res = await fetch(`https://gitlab.lnu.se/api/v4/projects/${projectId}/hooks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://cscloud9-62.lnu.se/webhook', // The URL of the webhook endpoint
      issues_events: true, // Trigger webhook on issue events
      push_events: true, // and trigger for Commits
      token: process.env.WEBHOOK_SECRET, // The secret token for the webhook
      enable_ssl_verification: true
    })
  })

  // Simple error handling.
  if (!res.ok) {
    const errorText = await res.text()
    console.error('Webhook creation failed:', res.status, errorText)
  }

  return await res.json()
}

/**
 * Fetches user projects from GitLab API and filters projects where the user can create webhooks.
 * https://docs.gitlab.com/api/projects/#list-all-projects
 * @param {*} token - The access token for authentication.
 * @returns {*} A promise that resolves to an array of user projects where the user is an owner or maintainer.
 */
gitlabApi.fetchUserProjects = async (token) => {
  // Fetch all projects where the user is a member
  const response = await fetch('https://gitlab.lnu.se/api/v4/projects?membership=true&simple=true&per_page=100', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  // Check for errors in the response
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to fetch user projects:', response.status, errorText)
    return []
  }

  // Parse the response JSON
  const projects = await response.json()

  // Filter projects where the user is an owner or maintainer
  const filteredProjects = projects.filter(project => {
    const accessLevel = project.permissions?.project_access?.access_level || project.permissions?.group_access?.access_level
    return accessLevel === 40 || accessLevel === 50 // 40 = Maintainer, 50 = Owner
  })

  return filteredProjects
}
