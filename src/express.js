import express from 'express'
import http from 'http'
import logger from 'morgan'
import dotenv from 'dotenv'
import apiRoutes from './routes/apiRoutes.js'
import wsServer from './models/webSocket.js'

dotenv.config()
const app = express()
const server = http.createServer(app) // Create an HTTP server using Express

// Initialize WebSocket server with the HTTP server
server.on('upgrade', (req, socket, head) => {
  wsServer.handleUpgrade(req, socket, head, (ws) => {
    wsServer.emit('connection', ws, req)
  })
})

// Middleware setup
app.use(logger('dev'))
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Set all routes to use the apiRoutes module
app.use('/', apiRoutes)

// Let the server listen on the port specified in the environment variables or default to 3000
export default (port = process.env.PORT || 3000) => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}. NODE_ENV is set to ${process.env.NODE_ENV}`)
  })
}
