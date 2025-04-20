/**
 * This method is used to toggle the comment box for a specific issue.
 * @param {*} issueElement - The issue element that contains the comment box.
 * @param {*} issueId - The ID of the issue.
 * @returns {void}
 */
export function toggleCommentBox (issueElement, issueId) {
  let commentBox = issueElement.querySelector('.comment-section')
  if (commentBox) {
    commentBox.remove()
    return
  }

  commentBox = document.createElement('div')
  commentBox.className = 'comment-section'
  commentBox.innerHTML = `
      <textarea placeholder="Write a comment..." rows="2"></textarea>
      <button class="submit-comment" data-id="${issueId}">Submit</button>
    `
  issueElement.appendChild(commentBox)
}

/**
 * This method is used to handle the submission of a comment.
 * @param {*} issueId - The ID of the issue to which the comment is being submitted.
 * @param {*} commentText - The text of the comment being submitted.
 * @returns {Promise} - A promise that resolves when the comment is successfully submitted.
 */
export function handleCommentSubmit (issueId, commentText) {
  return fetch(`/issues/${issueId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment: commentText })
  })
}
