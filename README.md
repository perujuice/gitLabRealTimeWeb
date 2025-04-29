# B3 Production

### URL to the server
<a>https://cscloud9-62.lnu.se/</a>


## Basic Requirements Implemented

*To run locally, simply run the following command:*

```sh
npm install
npm start # runs in production (NODE_ENV)
```

**But this will not work for real time web, that only works on the production server!**

## Security Measures:
- The express server uses the helmet package, for setting security related HTTP response headers.
- Prevent CSRF (Cross-site request forgery) attacs by setting a state: "a value that can’t be predicted used by the client to maintain state between the request and callback". It is done in the GitLab Oauth flow, before anything happens, a state is set. 

## Extra requirements

- I implemented a richer UI
- Implemented a button to close an issue
- Implemented commenting in issues, using gitLabs API
- Implemented commits
- GitLab Oauth

## Basic workflow! 
1. Client connects and the app will contact contact GitLab through their API

## GitLab Oauth

Initially the implementation of this follows the documentation for the authorization code flow: [GitLab Oauth 2.0 auth code flow](https://docs.gitlab.com/api/oauth2/#authorization-code-flow)


### Documentation
- The projects for a logged-in user are fetched using the
[GitLab API docs for projects](https://docs.gitlab.com/api/projects/#list-all-projects)
- The webhooks are created dynamically for each user project using [GitLab API for creating webhooks for user projects](https://docs.gitlab.com/api/project_webhooks/#add-a-webhook-to-a-project)

Only projects with **owner** or **Maintainer** access level can be used for the required actions of this app so in the code I refer

![Access levels](accessLevel.png)