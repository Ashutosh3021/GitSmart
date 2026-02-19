/**
 * GitHub Push Service
 * Handles pushing content to GitHub repositories via OAuth
 */

import { parseRepoUrl, getAuthHeader } from "./github";

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Get file SHA (required for updates)
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param path - File path
 * @param branch - Branch name
 * @param accessToken - GitHub OAuth access token
 */
async function getFileSha(
  owner: string,
  repo: string,
  path: string,
  branch: string,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: getAuthHeader(accessToken),
      }
    );

    if (response.status === 404) {
      return null; // File doesn't exist
    }

    if (!response.ok) {
      throw new Error(`Failed to get file info: ${response.statusText}`);
    }

    const data = await response.json();
    return data.sha;
  } catch (error) {
    console.error("Error getting file SHA:", error);
    return null;
  }
}

/**
 * Push content to GitHub repository
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param path - File path
 * @param content - File content
 * @param message - Commit message
 * @param branch - Branch name
 * @param accessToken - GitHub OAuth access token
 */
export async function pushToGitHub(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string = "main",
  accessToken: string
): Promise<{
  success: boolean;
  url?: string;
  commit?: {
    sha: string;
    message: string;
  };
  error?: string;
}> {
  console.log(`📤 Pushing to GitHub: ${owner}/${repo}/${path}`);

  try {
    // Get existing file SHA (if file exists)
    const sha = await getFileSha(owner, repo, path, branch, accessToken);

    // Prepare request body
    const body: Record<string, string> = {
      message,
      content: Buffer.from(content).toString("base64"),
      branch,
    };

    // Add SHA if updating existing file
    if (sha) {
      body.sha = sha;
    }

    // Make the request
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          ...getAuthHeader(accessToken),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `GitHub API error: ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log(`✅ Successfully pushed to GitHub`);

    return {
      success: true,
      url: data.content.html_url,
      commit: {
        sha: data.commit.sha,
        message: data.commit.message,
      },
    };
  } catch (error) {
    console.error("Error pushing to GitHub:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Push README to repository
 * @param url - Repository URL
 * @param content - README content
 * @param message - Commit message
 * @param branch - Branch name
 * @param accessToken - GitHub OAuth access token
 */
export async function pushReadme(
  url: string,
  content: string,
  message: string = "Update README.md via RepoLens",
  branch: string = "main",
  accessToken: string
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const { owner, repo } = parseRepoUrl(url);
  const result = await pushToGitHub(
    owner,
    repo,
    "README.md",
    content,
    message,
    branch,
    accessToken
  );

  return {
    success: result.success,
    url: result.url,
    error: result.error,
  };
}

/**
 * Create a pull request
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param title - PR title
 * @param head - Branch with changes
 * @param base - Target branch
 * @param body - PR description
 * @param accessToken - GitHub OAuth access token
 */
export async function createPullRequest(
  owner: string,
  repo: string,
  title: string,
  head: string,
  base: string = "main",
  body: string = "",
  accessToken: string
): Promise<{
  success: boolean;
  prUrl?: string;
  prNumber?: number;
  error?: string;
}> {
  console.log(`📤 Creating PR: ${title}`);

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          ...getAuthHeader(accessToken),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          head,
          base,
          body,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `GitHub API error: ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      prUrl: data.html_url,
      prNumber: data.number,
    };
  } catch (error) {
    console.error("Error creating PR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create a new branch
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - New branch name
 * @param fromBranch - Source branch
 * @param accessToken - GitHub OAuth access token
 */
export async function createBranch(
  owner: string,
  repo: string,
  branch: string,
  fromBranch: string = "main",
  accessToken: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log(`🌿 Creating branch: ${branch}`);

  try {
    // Get the SHA of the source branch
    const refResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/${fromBranch}`,
      {
        headers: getAuthHeader(accessToken),
      }
    );

    if (!refResponse.ok) {
      throw new Error(`Failed to get source branch: ${fromBranch}`);
    }

    const refData = await refResponse.json();
    const sha = refData.object.sha;

    // Create the new branch
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers: {
          ...getAuthHeader(accessToken),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: `refs/heads/${branch}`,
          sha,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `GitHub API error: ${response.statusText}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating branch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
