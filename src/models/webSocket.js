import WebSocket, { WebSocketServer } from 'ws'

// Using noServer so I can attach to my existing HTTP server in express.js
const wsServer = new WebSocketServer({
  noServer: true,
  clientTracking: true
})

export default wsServer

wsServer.on('connection', (ws) => {
    console.log('Client connected')

    ws.send(JSON.stringify({ type: 'welcome', message: 'Hello client!' }))
  
    ws.on('close', () => {
      console.log('Client disconnected')
    })
  
    ws.on('error', console.error)
})

/**
 * Broadcast to all connected clients (maybe skip sender? Figure out later).
 * You can reuse this from server.js/webhook route.
 */
wsServer.broadcast = (data) => {
  let clients = 0

  const message = typeof data === 'string' ? data : JSON.stringify(data)

  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
      clients++
    }
  })

  console.log(`Broadcasted message to ${clients} clients.`)
}
