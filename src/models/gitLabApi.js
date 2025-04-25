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
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ state_event: 'close' })
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`Failed to close issue ${issueIid}:`, res.status, errorText)
    throw new Error('Failed to close issue')
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

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`Failed to add comment to issue ${issueIid}:`, res.status, errorText)
    throw new Error('Failed to add comment')
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

  if (!response.ok) {
    console.error(`GitLab API error: ${response.statusText}`)
    return []
  }

  return await response.json()
}

/**
 *
 * @param projectId
 * @param token
 */
gitlabApi.createWebhook = async (projectId, token) => {
  const res = await fetch(`https://gitlab.lnu.se/api/v4/projects/${projectId}/hooks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://cscloud9-62.lnu.se/webhook',
      issues_events: true,
      push_events: true,
      token: process.env.WEBHOOK_SECRET, // the same one your server checks
      enable_ssl_verification: true
    })
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Webhook creation failed:', res.status, errorText)
    throw new Error('Failed to create webhook')
  }

  return await res.json()
}

/**
 *
 * @param token
 */
gitlabApi.fetchUserProjects = async (token) => {
  // The URL for fetching user projects is given in the GitLab API documentation.
  const response = await fetch('https://gitlab.lnu.se/api/v4/projects?membership=true&simple=true&per_page=100', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to fetch user projects:', response.status, errorText)
    throw new Error('Could not fetch user projects')
  }

  return await response.json()
}
