import formatRelativeTime from './utils.js'

/**
 * Renders a commit item in the given container.
 * @param {*} commit - The commit object containing commit details.
 * @param {*} container - The container element where the commit item will be rendered.
 */
export function renderCommit (commit, container) {
  const time = commit.created_at
  const li = document.createElement('li')
  li.classList.add('commit-item')
  li.setAttribute('data-id', commit.id)
  li.setAttribute('data-type', 'commit')

  li.innerHTML = `
    <div class="commit-header"><strong>[commit]</strong> ${commit.message}</div>
    <div class="meta">
      <span>By: ${commit.author_name}</span> · 
      <span>${formatRelativeTime(time)}</span> · 
    </div>
  `
  container.prepend(li)
}
