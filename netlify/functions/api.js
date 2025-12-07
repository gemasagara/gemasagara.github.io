import { promises as fs } from "fs";
import path from "path";

// GitHub OAuth config
const GITHUB_CLIENT_ID = "Ov23lirHIajJs11gwqbB";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const GITHUB_REPO_OWNER = "gemasagara";
const GITHUB_REPO_NAME = "gemasagara.github.io";

// Netlify Functions base directory
const BLOGS_DIR = path.join(process.cwd(), "data", "blogs", "posts");
const METADATA_FILE = path.join(process.cwd(), "data", "blogs", "metadata.json");

// Ensure blogs directory exists
async function ensureBlogsDir() {
  try {
    await fs.mkdir(BLOGS_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating blogs directory:", error);
  }
}

// Helper: Update metadata
async function updateMetadata(blogEntry) {
  try {
    let metadata = [];
    try {
      const content = await fs.readFile(METADATA_FILE, "utf8");
      metadata = JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet
    }

    const existingIndex = metadata.findIndex((b) => b.id === blogEntry.id);
    if (existingIndex >= 0) {
      metadata[existingIndex] = { ...metadata[existingIndex], ...blogEntry };
    } else {
      metadata.push(blogEntry);
    }

    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2), "utf8");
    console.log(`📝 Metadata updated for blog: ${blogEntry.id}`);
  } catch (error) {
    console.error("Error updating metadata:", error);
  }
}

// Helper: Remove from metadata
async function removeFromMetadata(blogId) {
  try {
    let metadata = [];
    try {
      const content = await fs.readFile(METADATA_FILE, "utf8");
      metadata = JSON.parse(content);
    } catch (error) {
      return;
    }

    metadata = metadata.filter((b) => b.id !== blogId);
    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2), "utf8");
    console.log(`📝 Metadata removed for blog: ${blogId}`);
  } catch (error) {
    console.error("Error removing from metadata:", error);
  }
}

// Helper: Send JSON response
function jsonResponse(body, status = 200) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(body),
  };
}

// Helper: Send text response
function textResponse(body, status = 200) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "text/markdown",
      "Access-Control-Allow-Origin": "*",
    },
    body,
  };
}

// Helper: Redirect response
function redirectResponse(url) {
  return {
    statusCode: 302,
    headers: {
      Location: url,
      "Access-Control-Allow-Origin": "*",
    },
    body: "",
  };
}

// Main handler
export async function handler(event, context) {
  await ensureBlogsDir();

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse({ ok: true });
  }

  const path = event.path || event.rawUrl || "";
  const method = event.httpMethod || "GET";

  // Parse path and query
  const urlObj = new URL("http://example.com" + path);
  const pathname = urlObj.pathname;
  const searchParams = new URLSearchParams(event.rawQuery || "");

  try {
    // GitHub OAuth callback
    if (pathname === "/api/auth/github/callback" && method === "GET") {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code || !state) {
        return jsonResponse({ error: "Missing code or state" }, 400);
      }

      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code: code,
          }),
        }
      );

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return jsonResponse({ error: tokenData.error }, 400);
      }

      return redirectResponse(`/admin.html#token=${tokenData.access_token}`);
    }

    // Verify GitHub token
    if (pathname === "/api/auth/verify" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { access_token } = body;

      if (!access_token) {
        return jsonResponse({ error: "Missing access token" }, 400);
      }

      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        return jsonResponse({ error: "Invalid token" }, 401);
      }

      const userData = await response.json();
      return jsonResponse({
        success: true,
        user: {
          login: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
        },
      });
    }

    // Check access
    if (pathname === "/api/auth/check-access" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { access_token } = body;

      if (!access_token) {
        return jsonResponse({ error: "Not authenticated" }, 401);
      }

      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!userResponse.ok) {
        return jsonResponse({ error: "Invalid token" }, 401);
      }

      const user = await userResponse.json();
      const username = user.login;

      if (username === GITHUB_REPO_OWNER) {
        return jsonResponse({ access: true, reason: "repo_owner" });
      }

      const collabResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/collaborators/${username}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (collabResponse.ok) {
        return jsonResponse({ access: true, reason: "collaborator" });
      }

      return jsonResponse(
        { access: false, error: "Not authorized to access this admin panel" },
        403
      );
    }

    // Save blog markdown
    if (pathname === "/api/blogs/save-markdown" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const {
        blogId,
        title,
        date,
        category,
        author,
        tags,
        thumbnail,
        excerpt,
        featured,
        published,
        externalLink,
        markdownFile,
        content,
      } = body;

      if (!blogId || !content) {
        return jsonResponse(
          { error: "Missing required fields: blogId and content" },
          400
        );
      }

      const frontmatter = [
        "---",
        `title: ${title || "Untitled"}`,
        `date: ${date || new Date().toISOString().split("T")[0]}`,
        `category: ${category || "Uncategorized"}`,
      ];

      if (thumbnail) frontmatter.push(`media: ${thumbnail}`);
      if (tags && Array.isArray(tags) && tags.length > 0) {
        const tagsStr = tags
          .map((t) => (t.includes(" ") ? `"${t}"` : t))
          .join(", ");
        frontmatter.push(`tags: [${tagsStr}]`);
      }
      if (author) frontmatter.push(`author: ${author}`);
      if (excerpt) frontmatter.push(`tagline: ${excerpt}`);
      if (featured) frontmatter.push(`featured: ${featured}`);
      if (published !== undefined) frontmatter.push(`published: ${published}`);
      if (externalLink) frontmatter.push(`link: ${externalLink}`);

      frontmatter.push("---");

      const fullContent = frontmatter.join("\n") + "\n\n" + content;
      const filename = `${blogId}.md`;
      const filepath = path.join(BLOGS_DIR, filename);

      await fs.writeFile(filepath, fullContent, "utf8");
      console.log(`✅ Blog markdown saved: ${filepath}`);

      await updateMetadata({
        id: blogId,
        title: title || "Untitled",
        date: date || new Date().toISOString().split("T")[0],
        category: category || "Uncategorized",
        tags: tags || [],
        author: author || "Admin",
        thumbnail: thumbnail || "",
        excerpt: excerpt || "",
        featured: featured || false,
        published: published !== false,
        markdownFile: markdownFile || `posts/${filename}`,
        externalLink: externalLink || "",
      });

      return jsonResponse({
        success: true,
        message: "Blog markdown saved successfully",
        file: filename,
        path: filepath,
      });
    }

    // Get blog metadata
    if (pathname === "/api/blogs/metadata" && method === "GET") {
      try {
        const metadata = await fs.readFile(METADATA_FILE, "utf8");
        return jsonResponse(JSON.parse(metadata));
      } catch (error) {
        return jsonResponse([]);
      }
    }

    // Load blog markdown by ID
    const blogIdMatch = pathname.match(/^\/api\/blogs\/([^/]+)\/markdown$/);
    if (blogIdMatch && method === "GET") {
      const blogId = blogIdMatch[1];
      const filepath = path.join(BLOGS_DIR, `${blogId}.md`);

      try {
        const content = await fs.readFile(filepath, "utf8");
        return textResponse(content);
      } catch (error) {
        return jsonResponse(
          { error: "Blog markdown not found", details: error.message },
          404
        );
      }
    }

    // Delete blog by ID
    const deleteMatch = pathname.match(/^\/api\/blogs\/([^/]+)$/);
    if (deleteMatch && method === "DELETE") {
      const blogId = deleteMatch[1];
      const filepath = path.join(BLOGS_DIR, `${blogId}.md`);

      try {
        await fs.unlink(filepath);
        console.log(`🗑️ Blog markdown deleted: ${filepath}`);
        await removeFromMetadata(blogId);

        return jsonResponse({
          success: true,
          message: "Blog markdown deleted successfully",
        });
      } catch (error) {
        return jsonResponse(
          {
            error: "Failed to delete blog markdown",
            details: error.message,
          },
          500
        );
      }
    }

    // Push to GitHub
    if (pathname === "/api/github/push" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { access_token, files, message } = body;

      if (!access_token || !files || !Array.isArray(files)) {
        return jsonResponse(
          { error: "Missing access_token or files" },
          400
        );
      }

      if (!GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
        return jsonResponse(
          { error: "GitHub repository not configured on server" },
          500
        );
      }

      try {
        const commitMessage =
          message || `Update portfolio data - ${new Date().toISOString()}`;

        const refResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/git/refs/heads/admin`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (!refResponse.ok) {
          throw new Error("Failed to get repository reference");
        }

        const refData = await refResponse.json();
        const baseSha = refData.object.sha;

        const treeItems = files.map((file) => ({
          path: file.path,
          mode: "100644",
          type: "blob",
          content: file.content,
        }));

        const newTreeResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/git/trees`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              base_tree: baseSha,
              tree: treeItems,
            }),
          }
        );

        if (!newTreeResponse.ok) {
          throw new Error("Failed to create new tree");
        }

        const newTreeData = await newTreeResponse.json();

        const commitResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/git/commits`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: commitMessage,
              tree: newTreeData.sha,
              parents: [baseSha],
            }),
          }
        );

        if (!commitResponse.ok) {
          throw new Error("Failed to create commit");
        }

        const commitData = await commitResponse.json();

        const updateRefResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/git/refs/heads/admin`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sha: commitData.sha,
            }),
          }
        );

        if (!updateRefResponse.ok) {
          throw new Error("Failed to update reference");
        }

        return jsonResponse({
          success: true,
          message: "Changes pushed to GitHub successfully",
          commit_sha: commitData.sha,
          files_pushed: files.length,
        });
      } catch (error) {
        console.error("Error pushing to GitHub:", error);
        return jsonResponse(
          {
            error: "Failed to push changes to GitHub",
            details: error.message,
          },
          500
        );
      }
    }

    // Health check
    if (pathname === "/api/health" && method === "GET") {
      return jsonResponse({
        status: "ok",
        message: "Portfolio admin server is running",
      });
    }

    // 404
    return jsonResponse({ error: "Not found" }, 404);
  } catch (error) {
    console.error("API error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
