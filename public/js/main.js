import connectWebSocket from './clientSocket.js'
import { fetchAndRenderIssues, formatIssueHtml } from './issues.js'
import { renderCommit } from './commits.js'
import { toggleCommentBox, handleCommentSubmit } from './comments.js'

const eventList = document.getElementById('event-list') // unified name

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

// Event delegation for the event list
document.addEventListener('click', (e) => {
  const id = e.target.dataset.id
  if (!id) return

  // Check if the clicked element is a close button
  // If it is, close the issue
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

/**
 * Fetches projects from the server and populates the project select dropdown.
 */
fetch('/projects')
  // Check if the response is ok. If not, throw an error.
  .then(res => {
    if (!res.ok) console.log('Failed to fetch projects.')
    return res.json()
  })
  // If the response is ok, return the projects data.
  .then(projects => {
    const select = document.getElementById('project-select')
    // populate the dropdown with the projects
    projects.forEach(p => {
      const option = document.createElement('option')
      option.value = p.id
      option.textContent = `${p.name_with_namespace}`
      select.appendChild(option)
    })
  })
  // If the response is not ok, hide the project picker.
  .catch(() => {
    document.getElementById('project-picker').style.display = 'none'
  })

//  Set project button click event
//  When the button is clicked, fetch the selected project ID and create a webhook for it.
document.getElementById('set-project-btn').addEventListener('click', () => {
  const projectId = document.getElementById('project-select').value
  if (!projectId) return alert('Please select a project.')

  fetch(`/projects/${projectId}/webhook`, { method: 'POST' })
    .then(res => {
      if (!res.ok) console.log('Webhook created! Events from this repo will now appear in real time.')

      // Clear DOM
      eventList.innerHTML = ''

      // Re-fetch content from newly selected project
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

      // Fetch commits from the selected project.
      fetch('/commits')
        .then(res => res.json())
        .then(data => {
          data.forEach(commit => renderCommit(commit, eventList))
        })
    })
    // If the response is not ok.
    .catch(() => console.log('Failed to create webhook for that project.'))
})

/**
 * Updates the authentication controls based on the user's login status.
 * If the user is logged in, it shows a welcome message and a logout link.
 */
async function updateAuthControls () {
  const res = await fetch('/me')
  const data = await res.json()

  const controls = document.getElementById('auth-controls')
  controls.innerHTML = data.loggedIn
    ? `<span>Welcome, ${data.username}</span> <a href="/logout">Log out</a>`
    : '<a href="/auth/gitlab">Log in with GitLab</a>'
}

updateAuthControls()
