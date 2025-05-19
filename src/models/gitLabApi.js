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
  const response = await fetch(`https://gitlab.lnu.se/api/v4/projects/${projectId}/repository/commits?per_page=100`, {
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
  // The URL endpoint to fetch all projects for the authenticated user.
  // The 'membership=true' query parameter ensures that only projects the user is a member of are returned.
  const response = await fetch('https://gitlab.lnu.se/api/v4/projects?membership=true&per_page=100&statistics=false', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  // Check if the response is ok (status code 200).
  // If not, log the error and return an empty array.
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to fetch user projects:', response.status, errorText)
    return []
  }

  const allProjects = await response.json()

  // The access level is checked using the 'permissions' object in the project data.
  // The access level codes are: 0 = No access, 10 = Guest, 20 = Reporter, 30 = Developer, 40 = Maintainer, 50 = Owner
  // I filter for projects where the user has at least MAINTAINER access (40).
  const permittedProjects = allProjects.filter(p => {
    const access = p.permissions?.project_access?.access_level || p.permissions?.group_access?.access_level || 0
    return access >= 40 // Maintainer or higher
  })

  return permittedProjects
}
