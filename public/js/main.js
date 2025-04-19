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


/*
ws.onmessage = (event) => {
  const issue = JSON.parse(event.data)

  const item = document.createElement('li')
  item.innerHTML = `<strong>[${issue.action}]</strong> ${issue.title} (${issue.state})`
  issueList.prepend(item)
}

ws.onclose = () => {
  console.log('WebSocket closed')
}
*/
