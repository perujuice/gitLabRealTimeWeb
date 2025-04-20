const issueList = document.getElementById('issue-list')

/**
 * Establishes a WebSocket connection to the server and listens for incoming messages.
 */
function connectWebSocket () {
  // This line just allows the code to work both locally and on the production server
  const socket = new WebSocket(`${window.location.protocol.replace('http', 'ws')}//${window.location.host}`)

  socket.onopen = () => {
    console.log(' WebSocket connection opened')
  }

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    handleWebSocketMessage(data)
  }

  socket.onclose = () => {
    console.warn(' WebSocket closed, retrying in 3s...')
    setTimeout(connectWebSocket, 3000) // reconnect after delay
  }

  socket.onerror = (err) => {
    console.error('WebSocket error:', err.message)
    socket.close()
  }
}

/**
 * Formats an issue list item with title, state, created and updated timestamps.
 * @param {*} issue - The issue object containing details about the issue.
 * @returns {string} - The formatted issue text.
 */
function formatIssueText (issue) {
  const created = formatRelativeTime(issue.created_at)
  const updated = formatRelativeTime(issue.updated_at)

  return `
  <div class="issue-header"><strong>[issue]</strong> ${issue.title} (${issue.state})</div>
  <div class="timestamp-row">
    <span class="timestamp">Created: ${created}</span>
    <span class="timestamp">Updated: ${updated}</span>
  </div>
  <div class="actions">
    <button class="close-btn" data-id="${issue.id}">Close</button>
    <button class="comment-btn" data-id="${issue.id}">Comment</button>
  </div>`
}

/**
 * Handles incoming WebSocket messages and updates the issue list accordingly.
 * @param {*} data - The data received from the WebSocket.
 */
function handleWebSocketMessage (data) {
  if (data.type === 'issue' && data.state === 'open') {
    const id = data.id
    const existingItem = issueList.querySelector(`li[data-id="${id}"]`)
    const newText = formatIssueText(data)
    existingItem.innerHTML = newText

    if (existingItem) {
      existingItem.textContent = newText
    } else {
      const item = document.createElement('li')
      item.setAttribute('data-id', id)
      item.textContent = newText
      issueList.prepend(item)
    }
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('close-btn')) {
    const id = e.target.dataset.id
    fetch(`/issues/${id}/close`, { method: 'POST' }) // or PATCH depending on backend
  }

  if (e.target.classList.contains('comment-btn')) {
    const id = e.target.dataset.id
    const comment = prompt('Enter your comment:')
    if (comment) {
      fetch(`/issues/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      })
    }
  }
})

connectWebSocket()

/**
 * Fetches the list of issues from the server and populates the issue list.
 */
fetch('/issues')
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    return res.json()
  })
  .then(data => {
    issueList.innerHTML = ''
    console.log('fetched issues:', data)
    data
      .filter(issue => issue.state === 'opened')
      .forEach(issue => {
        const item = document.createElement('li')
        item.setAttribute('data-id', issue.id)
        item.innerHTML = formatIssueText(issue)
        issueList.appendChild(item)
      })
  })
  .catch(err => {
    console.error('Failed to fetch issues:', err.message)
  })

/**
 * Formats a date string into a human-readable relative time format.
 * @param {*} dateString - The date string to format.
 * @returns {string} - The formatted relative time string.
 */
function formatRelativeTime (dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  }

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
}
