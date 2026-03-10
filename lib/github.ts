const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function readFile(
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`File not found: ${path}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return content;
  } catch (error) {
    throw error;
  }
}

export async function writeFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string = 'main'
): Promise<{ success: boolean }> {
  try {
    let sha = null;
    try {
      const existingRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      if (existingRes.ok) {
        const existing = await existingRes.json();
        sha = existing.sha;
      }
    } catch (e) {
      // File doesn't exist, that's ok
    }

    const body: any = {
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to write file');
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}
