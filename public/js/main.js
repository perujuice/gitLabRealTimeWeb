console.log('Hello from the main.js client-side script!')

const issueList = document.getElementById('issue-list')
const ws = new WebSocket('ws://localhost:3000') // using "ws"

ws.onopen = () => {
  console.log('WebSocket connection opened')
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Received:', data)

  const item = document.createElement('li')
  item.textContent = `[${data.type}] ${data.message}`
  issueList.prepend(item)
}


fetch('/issues')
  .then(res => res.json())
  .then(data => {
    data.forEach(issue => {
      const item = document.createElement('li')
      item.textContent = `[issue] ${issue.title} (${issue.state})`
      document.getElementById('issue-list').appendChild(item)
    })
  })
  .catch(err => console.error('Failed to fetch issues:', err))

