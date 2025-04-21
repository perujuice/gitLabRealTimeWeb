import express from 'express'
import { getIssues, closeIssueHandler, commentOnIssueHandler } from '../controller/issueController.js'
import { handleWebhook } from '../controller/webHookController.js'
import { getCommits } from '../controller/commitsController.js'
import { gitlabOAuthCallback, createWebhookHandler, listUserProjects } from '../controller/userController.js'

const router = express.Router()

router.get('/issues', getIssues) // Fetch issues from the GitHub repository
router.post('/issues/:id/close', closeIssueHandler) // Close an issue by its ID
router.post('/issues/:id/comments', commentOnIssueHandler) // Add a comment to an issue by its ID
router.get('/commits', getCommits) // Fetch commits from the GitHub repository
router.post('/webhook', handleWebhook) // Handle incoming webhook events from GitHub

router.post('/projects/:id/webhook', createWebhookHandler) // Create a webhook for a specific project
router.get('/oauth/callback', gitlabOAuthCallback)
router.post('/projects/:id/webhook', createWebhookHandler)
router.get('/projects', listUserProjects)

export default router
