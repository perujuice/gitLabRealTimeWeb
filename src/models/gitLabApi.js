

export async function fetchIssues(projectId) {
    const response = await fetch(`https://gitlab.lnu.se/api/v4/projects/${projectId}/issues`, {
      headers: {
        Authorization: `Bearer ${process.env.GITLAB_TOKEN}`
      }
    });
  
    if (!response.ok) {
      console.error(`GitLab API error: ${response.statusText}`);
      return [];
    }
  
    return await response.json();
  }
  