
export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  html_url: string;
}

export const getGitHubUser = async (token: string): Promise<GitHubUser> => {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch GitHub user');
  }
  return res.json();
};

export const createRepo = async (token: string, name: string, description: string, isPrivate: boolean) => {
  const res = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: true,
    }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const msg = error.errors?.[0]?.message || error.message || 'Failed to create repository';
    throw new Error(msg);
  }
  
  return res.json();
};

export const pushFile = async (token: string, owner: string, repo: string, path: string, content: string, message: string) => {
  // 1. Get current SHA if file exists (for update)
  let sha: string | undefined;
  try {
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: { Authorization: `token ${token}` }
    });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }
  } catch (e) { /* ignore, file might not exist */ }

  // 2. Create/Update file
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: btoa(unescape(encodeURIComponent(content))), // Handle Unicode
      sha
    }),
  });
  
  if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to push file');
  }
  
  return res.json();
};
