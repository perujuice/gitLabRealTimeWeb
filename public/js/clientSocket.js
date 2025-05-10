import { renderIssue } from './issues.js'
import { renderCommit } from './commits.js'

/**
 * Connects to the WebSocket server and listens for incoming messages.
 * @param {*} container - The container element where issues will be rendered.
 */
export default function connectWebSocket (container) {
  // Convert 'http' or 'https' to 'ws' or 'wss' to match the current protocol.
  // This ensures WebSocket works both in local (http) and production (https) environments.
  const socket = new WebSocket(`${window.location.protocol.replace('http', 'ws')}//${window.location.host}`)

  socket.onopen = () => console.log('WebSocket connection opened')

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)

    if (data.type === 'issue') {
      const li = container.querySelector(`li[data-id="${data.id}"]`)
      if (data.state === 'opened') {
        renderIssue(data, container)
      } else if (data.state === 'closed' && li) {
        li.remove()
      }
    }

    if (data.type === 'commit') {
      renderCommit(data, container)
    }
  }

  socket.onclose = () => {
    console.warn('WebSocket closed, retrying...')
    setTimeout(() => connectWebSocket(container), 3000)
  }

  socket.onerror = (err) => {
    console.error('WebSocket error:', err.message)
    socket.close()
  }
}
