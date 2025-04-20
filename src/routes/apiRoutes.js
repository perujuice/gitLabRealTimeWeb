import express from 'express'
import { getIssues } from '../controller/issueController.js'
import { handleWebhook } from '../controller/webHookController.js'
import wsServer from '../models/webSocket.js'

const router = express.Router()

router.get('/issues', getIssues) // Fetch issues from the GitHub repository
router.post('/webhook', handleWebhook) // Handle incoming webhook events from GitHub
// This route is for testing purposes only. It sends a broadcast message to all connected WebSocket clients.
router.get('/test-broadcast', (req, res) => {
  wsServer.broadcast({ type: 'test', message: 'This is a broadcast from the server!' })
  res.send('Broadcast sent.')
})

export default router
