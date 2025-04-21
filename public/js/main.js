import connectWebSocket from './clientSocket.js'
import { fetchAndRenderIssues } from './issues.js'
import { toggleCommentBox, handleCommentSubmit } from './comments.js'

const issueList = document.getElementById('issue-list')

connectWebSocket(issueList)
fetchAndRenderIssues(issueList)

const eventList = document.getElementById('issue-list')

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
