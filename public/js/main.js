console.log('Hello from the main.js client-side script!')

const issueList = document.getElementById('issue-list')
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
const socket = new WebSocket(`${protocol}//${window.location.host}`)


socket.onopen = () => {
  console.log('WebSocket connection opened')
}

socket.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Received:', data)

  if (data.type === 'issue') {
    const id = data.id

    const existingItem = issueList.querySelector(`li[data-id="${id}"]`)
    const newText = `[issue] ${data.title} (${data.state})`

    if (existingItem) {
      existingItem.textContent = newText
    } else {
      const item = document.createElement('li')
      item.setAttribute('data-id', id)
      item.textContent = newText
      issueList.prepend(item)
    }
  } else if (data.type === 'welcome') {
    const item = document.createElement('li')
    item.textContent = `[welcome] ${data.message}`
    issueList.prepend(item)
  }
}


fetch('/issues')
  .then(res => res.json())
  .then(data => {
    issueList.innerHTML = '' // clear existing items
    data.forEach(issue => {
      const item = document.createElement('li')
      item.setAttribute('data-id', issue.id)
      item.textContent = `[issue] ${issue.title} (${issue.state})`
      issueList.appendChild(item)
    })
  })
