import WebSocket, { WebSocketServer } from 'ws'

// Using noServer so I can attach to my existing HTTP server in express.js
const wsServer = new WebSocketServer({
  noServer: true,
  clientTracking: true
})

export default wsServer

// Establish a connection with the client
wsServer.on('connection', (ws) => {
    console.log('Client connected')

    ws.send(JSON.stringify({ type: 'welcome', message: 'Hello client!' }))
  
    ws.on('close', () => {
      console.log('Client disconnected')
    })
  
    ws.on('error', console.error)
})


/**
 * Broadcast to all connected clients.
 */
wsServer.broadcast = (data) => {
  console.log('Broadcasting to all clients:', data)
  // Send the data to all connected clients
  const message = JSON.stringify(data)
  wsServer.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message)
    }
  })
}
