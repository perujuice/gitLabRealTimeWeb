import { renderIssue } from './issues.js'

/**
 * Connects to the WebSocket server and listens for incoming messages.
 * @param {*} container - The container element where issues will be rendered.
 */
export default function connectWebSocket (container) {
  const socket = new WebSocket(`${window.location.protocol.replace('http', 'ws')}//${window.location.host}`)

  socket.onopen = () => console.log('WebSocket connection opened')

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'issue' && data.state === 'open') {
      renderIssue(data, container)
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
