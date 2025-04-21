import formatRelativeTime from './utils.js'

/**
 * This module provides functionality to fetch and render issues from a server.
 * @param {*} issue - The issue object to format.
 * @returns {string} - The formatted HTML string for the issue.
 */
export function formatIssueHtml (issue) {
  const created = formatRelativeTime(issue.created_at)
  const updated = formatRelativeTime(issue.updated_at)

  return `
    <div class="issue-header"><strong>[issue]</strong> ${issue.title} (${issue.state})</div>

    <div class="issue-footer">
      <div class="timestamps">
        <span>Created: ${created}</span>
        <span>Updated: ${updated}</span>
      </div>
      <div class="actions">
        <button class="close-btn" data-id="${issue.id}">Close</button>
        <button class="comment-btn" data-id="${issue.id}">Comment</button>
      </div>
    </div>`
}

/**
 * Renders an issue into the provided container element.
 * @param {*} issue - The issue object to render.
 * @param {*} container - The container element to render the issue into.
 */
export function renderIssue (issue, container) {
  const existing = container.querySelector(`li[data-id="${issue.id}"]`)

  if (existing) {
    existing.innerHTML = formatIssueHtml(issue)
  } else {
    const li = document.createElement('li')
    li.setAttribute('data-id', issue.id)
    li.setAttribute('data-type', 'issue') // Added data-type attribute for filtering
    li.innerHTML = formatIssueHtml(issue)
    container.prepend(li)
  }
}

/**
 * Fetches issues from the server and renders them in the provided container.
 * @param {*} container - The container element to render the issues into.
 */
export function fetchAndRenderIssues (container) {
  fetch('/issues')
    .then(res => res.ok ? res.json() : Promise.reject(res.status))
    .then(data => {
      container.innerHTML = ''
      data.filter(i => i.state === 'opened').forEach(issue => {
        const li = document.createElement('li')
        li.setAttribute('data-id', issue.id)
        li.setAttribute('data-type', 'issue')
        li.innerHTML = formatIssueHtml(issue)
        container.appendChild(li)
      })
    })
    .catch(err => {
      console.error('Failed to fetch issues:', err)
    })
}
