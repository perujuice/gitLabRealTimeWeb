import express from 'express'
import issueController from '../controller/issueController.js'
import handleWebhook from '../controller/webHookController.js'
import { getCommits } from '../controller/commitsController.js'
import userController from '../controller/userController.js'

const router = express.Router()
export default router

// These routes are related to simple GitLab issues and commits.
router.get('/issues', issueController.getIssues) // Fetch issues from the GitLab repository
router.post('/issues/:id/close', issueController.closeIssueHandler) // Close an issue by its ID
router.post('/issues/:id/comments', issueController.commentOnIssueHandler) // Add a comment to an issue by its ID
router.get('/commits', getCommits) // Fetch commits from the GitLab repository
router.post('/webhook', handleWebhook) // Handle incoming webhook events from GitLab

// All of the routes below are related to GitLab OAuth authentication and user management.
router.get('/auth/gitlab', userController.redirectToGitLabOAuth) // Redirect to GitLab for OAuth authentication
router.get('/oauth/callback', userController.gitlabOAuthCallback) // Handle OAuth callback from GitLab, for login
router.get('/projects', userController.listUserProjects) // List all projects for the authenticated user
router.post('/projects/:id/webhook', userController.createWebhookHandler) // Create a webhook for a specific project

router.get('/logout', userController.logoutHandler) // Handle user logout
router.get('/me', userController.getCurrentUser) // Get the current user's information
