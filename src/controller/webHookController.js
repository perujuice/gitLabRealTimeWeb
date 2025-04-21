import wsServer from '../models/webSocket.js'

/**
 * This function handles incoming GitLab webhook events.
 * It verifies the webhook token and processes the event based on its type.
 * @param {*} req - The request object containing the webhook payload.
 * @param {*} res - The response object used to send a response back to GitLab.
 * @returns {*} errors if the token is invalid or the payload is not an issue event.
 */
export function handleWebhook (req, res) {
  const token = req.headers['x-gitlab-token'] // Extract the token from the request headers

  if (token !== process.env.WEBHOOK_SECRET) {
    console.log('Invalid GitLab webhook token')
    return res.status(401).send('Unauthorized')
  }

  const payload = req.body
  console.log('Received webhook:', payload.object_kind)

  // Handle issue events
  if (payload.object_kind === 'issue') {
    const issue = payload.object_attributes

    const message = {
      type: 'issue',
      id: issue.id,
      action: issue.action,
      title: issue.title,
      state: issue.state,
      url: issue.url,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    }

    wsServer.broadcast(message)
    console.log('Issue webhook broadcasted:', message)
  }

  // Handle commit events from push webhook
  if (payload.object_kind === 'push' && Array.isArray(payload.commits)) {
    payload.commits.forEach(commit => {
      const message = {
        type: 'commit',
        id: commit.id,
        message: commit.message,
        author_name: commit.author.name,
        timestamp: commit.created_at,
        url: commit.url
      }

      wsServer.broadcast(message)
      console.log('Commit webhook broadcasted:', message)
    })
  }
  res.status(200).send('OK')
}
