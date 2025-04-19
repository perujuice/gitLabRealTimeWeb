import express from 'express'
import http from 'http'
import wsServer from './models/webSocket.js'
import logger from 'morgan'
import dotenv from 'dotenv'
import { fetchIssues } from './models/gitLabApi.js'

dotenv.config() // Load environment variables from .env file
const app = express()
const server = http.createServer(app)

// Attach WebSocket upgrade
server.on('upgrade', (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, (ws) => {
      wsServer.emit('connection', ws, req)
    })
  })

app.use(logger('dev'))
app.use(express.static('public')) // Serve static files from the public directory
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/issues', async (req, res) => {
  const issues = await fetchIssues(process.env.PROJECT_ID)
  res.json(issues)
})


app.get('/test-broadcast', (req, res) => {
  wsServer.broadcast({
    type: 'test',
    message: 'This is a broadcast from the server!'
  })
  res.send('Broadcast sent.')
})

app.post('/webhook', (req, res) => {
  const secret = req.headers['x-gitlab-token']

  if (secret !== process.env.WEBHOOK_SECRET) {
    console.log('Webhook token invalid')
    return res.status(401).send('Unauthorized')
  }

  const payload = req.body
  console.log('Webhook received:', JSON.stringify(payload, null, 2))

  res.status(200).send('OK')
})


  
export default (port = process.env.PORT || 3000) => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}. NODE_ENV is set to ${process.env.NODE_ENV}`)
  })
}