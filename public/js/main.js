import connectWebSocket from './clientSocket.js'
import { fetchAndRenderIssues, formatIssueHtml } from './issues.js'
import { renderCommit } from './commits.js'
import { toggleCommentBox, handleCommentSubmit } from './comments.js'

const eventList = document.getElementById('event-list') // unified name for the event list (issues and commits)

connectWebSocket(eventList) // Connect to the WebSocket server and pass the event list element

// Call the function to fetch and render issues from issues.js.
fetchAndRenderIssues(eventList)

//  Fetch commits form the server and render them in the event list.
fetch('/commits')
  .then(res => res.json())
  .then(data => {
    data.forEach(commit => renderCommit(commit, eventList))
  })

// Filter logic for the radio buttons.
// When a radio button is selected, it filters the event list based on the selected type (issues, commits, or all).
const filterRadios = document.querySelectorAll('#event-filter input[name="filter"]')
// Add event listeners to each radio button.
filterRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    const selected = document.querySelector('#event-filter input[name="filter"]:checked').value // Get the selected value
    // Show all items if 'all' is selected, otherwise filter by the selected type.
    Array.from(eventList.children).forEach(item => {
      const type = item.getAttribute('data-type') // Get the type of the current item
      item.style.display = (selected === 'all' || type === selected) ? '' : 'none' // Show or hide the item based on the selected filter
    })
  })
})

// Event delegation for the event list items.
// When an item in the event list is clicked, it checks if the clicked element has a data-id attribute.
// If it does, it checks if the clicked element is a close button or a comment button.
document.addEventListener('click', (e) => {
  const id = e.target.dataset.id // Get the ID of the clicked element
  if (!id) return

  // Check if the clicked element is a close button
  // If it is, close the issue
  if (e.target.classList.contains('close-btn')) {
    fetch(`/issues/${id}/close`, { method: 'POST' })
  }

  if (e.target.classList.contains('comment-btn')) {
    // Using the closest method to find the parent li element, so that I can target the full list item DOM element related to that button.
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

// **Only for logged in users**
//  Set project button click event listener.
//  When the button is clicked, fetch the selected project ID and create a webhook for it.
document.getElementById('set-project-btn').addEventListener('click', () => {
  const projectId = document.getElementById('project-select').value
  if (!projectId) return alert('Please select a project.')
  // Create a webhook for the selected project
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

  // Fetches projects from the server and populates the project select dropdown.
  if (data.loggedIn) {
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
  } else {
    document.getElementById('project-picker').style.display = 'none'
  }
}

updateAuthControls()
