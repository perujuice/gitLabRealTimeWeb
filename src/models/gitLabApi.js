/**
 * Method to fetch issues from GitLab API.
 * @param {*} projectId - The project ID to fetch issues from.
 * @returns {*} A promise that resolves to an array of issues.
 */
export async function fetchIssues (projectId) {
  const response = await fetch(`https://gitlab.lnu.se/api/v4/projects/${projectId}/issues`, {
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_TOKEN}`
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
 * @returns {*} The response from the GitLab API.
 */
export async function closeIssue (projectId, issueIid) {
  const res = await fetch(`https://gitlab.lnu.se/api/v4/projects/${projectId}/issues/${issueIid}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_TOKEN}`,
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
 * @returns {*} The response from the GitLab API.
 */
export async function commentOnIssue (projectId, issueIid, comment) {
  const res = await fetch(`https://gitlab.lnu.se/api/v4/projects/${projectId}/issues/${issueIid}/notes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body: comment })
  })

  if (!res.ok) throw new Error('Failed to add comment')
  return res.json()
}
