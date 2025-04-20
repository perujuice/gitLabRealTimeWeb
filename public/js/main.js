const issueList = document.getElementById('issue-list');

/**
 * Establishes a WebSocket connection to the server and listens for incoming messages.
 */
function connectWebSocket() {
  // This line just allows the code to work both locally and on the production server
  const socket = new WebSocket(`${window.location.protocol.replace('http', 'ws')}//${window.location.host}`)

  socket.onopen = () => {
    console.log(' WebSocket connection opened')
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    handleWebSocketMessage(data)
  };

  socket.onclose = () => {
    console.warn(' WebSocket closed, retrying in 3s...')
    setTimeout(connectWebSocket, 30000) // reconnect after delay
  };

  socket.onerror = (err) => {
    console.error('WebSocket error:', err.message)
    socket.close()
  };
}

/**
 * Handles incoming WebSocket messages and updates the issue list accordingly.
 * @param {*} data - The data received from the WebSocket.
 */
function handleWebSocketMessage(data) {
  if (data.type === 'issue') {
    const id = data.id

    const existingItem = issueList.querySelector(`li[data-id="${id}"]`)
    const newText = `[issue] ${data.title} (${data.state})`

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
    issueList.innerHTML = '' // clear existing items
    data.forEach(issue => {
      const item = document.createElement('li')
      item.setAttribute('data-id', issue.id)
      item.textContent = `[issue] ${issue.title} (${issue.state})`
      issueList.appendChild(item)
    })
  })
  .catch(err => {
    console.error('Failed to fetch issues:', err.message)
  });