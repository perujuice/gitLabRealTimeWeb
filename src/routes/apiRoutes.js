import express from 'express'
import { getIssues, closeIssueHandler, commentOnIssueHandler } from '../controller/issueController.js'
import { handleWebhook } from '../controller/webHookController.js'
import { getCommits } from '../controller/commitsController.js'
import { gitlabOAuthCallback, createWebhookHandler, listUserProjects, logoutHandler, getCurrentUser } from '../controller/userController.js'

const router = express.Router()

router.get('/issues', getIssues) // Fetch issues from the GitHub repository
router.post('/issues/:id/close', closeIssueHandler) // Close an issue by its ID
router.post('/issues/:id/comments', commentOnIssueHandler) // Add a comment to an issue by its ID
router.get('/commits', getCommits) // Fetch commits from the GitHub repository
router.post('/webhook', handleWebhook) // Handle incoming webhook events from GitHub

router.post('/projects/:id/webhook', createWebhookHandler) // Create a webhook for a specific project
router.get('/oauth/callback', gitlabOAuthCallback) // Handle OAuth callback from GitLab, for login
router.post('/projects/:id/webhook', createWebhookHandler) // Create a webhook for a specific project
router.get('/projects', listUserProjects) // List all projects for the authenticated user
router.get('/logout', logoutHandler) // Handle user logout

router.get('/me', getCurrentUser) // Get the current user's information

export default router
