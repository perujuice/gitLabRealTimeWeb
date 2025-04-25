import express from 'express'
import issueController from '../controller/issueController.js'
import handleWebhook from '../controller/webHookController.js'
import { getCommits } from '../controller/commitsController.js'
import userController from '../controller/userController.js'

const router = express.Router()

router.get('/issues', issueController.getIssues) // Fetch issues from the GitHub repository
router.post('/issues/:id/close', issueController.closeIssueHandler) // Close an issue by its ID
router.post('/issues/:id/comments', issueController.commentOnIssueHandler) // Add a comment to an issue by its ID
router.get('/commits', getCommits) // Fetch commits from the GitHub repository
router.post('/webhook', handleWebhook) // Handle incoming webhook events from GitHub

router.post('/projects/:id/webhook', userController.createWebhookHandler) // Create a webhook for a specific project
router.get('/auth/gitlab', userController.redirectToGitLabOAuth) // Redirect to GitLab for OAuth authentication

router.get('/oauth/callback', userController.gitlabOAuthCallback) // Handle OAuth callback from GitLab, for login
router.post('/projects/:id/webhook', userController.createWebhookHandler) // Create a webhook for a specific project
router.get('/projects', userController.listUserProjects) // List all projects for the authenticated user
router.get('/logout', userController.logoutHandler) // Handle user logout

router.get('/me', userController.getCurrentUser) // Get the current user's information

export default router
