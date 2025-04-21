import connectWebSocket from './clientSocket.js'
import { fetchAndRenderIssues, formatIssueHtml } from './issues.js'
import { renderCommit } from './commits.js'
import { toggleCommentBox, handleCommentSubmit } from './comments.js'

const eventList = document.getElementById('event-list') //  unified name

connectWebSocket(eventList)

//  Fetch issues without clearing existing content
fetch('/issues')
  .then(res => res.json())
  .then(data => {
    data
      .filter(issue => issue.state === 'opened')
      .forEach(issue => {
        const li = document.createElement('li')
        li.setAttribute('data-id', issue.id)
        li.setAttribute('data-type', 'issue')
        li.innerHTML = formatIssueHtml(issue)
        eventList.appendChild(li)
      })
  })

fetchAndRenderIssues(eventList)
//  Fetch commits
fetch('/commits')
  .then(res => res.json())
  .then(data => {
    data.forEach(commit => renderCommit(commit, eventList))
  })

//  Filter logic
const filterRadios = document.querySelectorAll('#event-filter input[name="filter"]')
filterRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    const selected = document.querySelector('#event-filter input[name="filter"]:checked').value
    Array.from(eventList.children).forEach(item => {
      const type = item.getAttribute('data-type')
      item.style.display = (selected === 'all' || type === selected) ? '' : 'none'
    })
  })
})

//  Event delegation
document.addEventListener('click', (e) => {
  const id = e.target.dataset.id
  if (!id) return

  if (e.target.classList.contains('close-btn')) {
    fetch(`/issues/${id}/close`, { method: 'POST' })
  }

  if (e.target.classList.contains('comment-btn')) {
    toggleCommentBox(e.target.closest('li'), id)
  }

  if (e.target.classList.contains('submit-comment')) {
    const textarea = e.target.previousElementSibling
    const comment = textarea.value.trim()
    if (comment) {
      handleCommentSubmit(id, comment).then(() => {
        textarea.value = ''
        console.log('Comment submitted')
      })
    }
  }
})
