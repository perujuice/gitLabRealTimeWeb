import express from 'express'
import http from 'http'
import wsServer from './models/webSocket.js'
import logger from 'morgan'
import dotenv from 'dotenv'

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

// Replace "12345" with your actual GitLab project ID
app.get('/issues', async (req, res) => {
    const issues = await fetchIssues(process.env.PROJECT_ID)
    res.json(issues)
  })
  
export default (port = process.env.PORT || 3000) => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}. NODE_ENV is set to ${process.env.NODE_ENV}`)
  })
}