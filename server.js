/**
 * Portfolio Admin Server
 * Handles blog markdown file operations and API endpoints
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// GitHub OAuth config
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || "";
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || "";

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Static files
app.use(express.static(path.join(__dirname)));

// Constants
const BLOGS_DIR = path.join(__dirname, "data", "blogs", "posts");
const METADATA_FILE = path.join(__dirname, "data", "blogs", "metadata.json");

// Ensure blogs directory exists
async function ensureBlogsDir() {
  try {
    await fs.mkdir(BLOGS_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating blogs directory:", error);
  }
}

/**
 * API Routes
 */

// Save blog markdown
app.post("/api/blogs/save-markdown", async (req, res) => {
  try {
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
    } = req.body;

    if (!blogId || !content) {
      return res.status(400).json({
        error: "Missing required fields: blogId and content",
      });
    }

    // Create frontmatter
    const frontmatter = [
      "---",
      `title: ${title || "Untitled"}`,
      `date: ${date || new Date().toISOString().split("T")[0]}`,
      `category: ${category || "Uncategorized"}`,
    ];

    if (thumbnail) {
      frontmatter.push(`media: ${thumbnail}`);
    }

    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagsStr = tags.map((t) => (t.includes(" ") ? `"${t}"` : t)).join(", ");
      frontmatter.push(`tags: [${tagsStr}]`);
    }

    if (author) {
      frontmatter.push(`author: ${author}`);
    }

    if (excerpt) {
      frontmatter.push(`tagline: ${excerpt}`);
    }

    if (featured) {
      frontmatter.push(`featured: ${featured}`);
    }

    if (published !== undefined) {
      frontmatter.push(`published: ${published}`);
    }

    if (externalLink) {
      frontmatter.push(`link: ${externalLink}`);
    }

    frontmatter.push("---");

    // Combine frontmatter and content
    const fullContent = frontmatter.join("\n") + "\n\n" + content;

    // Generate filename
    const filename = `${blogId}.md`;
    const filepath = path.join(BLOGS_DIR, filename);

    // Write file
    await fs.writeFile(filepath, fullContent, "utf8");
    console.log(`✅ Blog markdown saved: ${filepath}`);

    // Update metadata.json
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

    res.json({
      success: true,
      message: "Blog markdown saved successfully",
      file: filename,
      path: filepath,
    });
  } catch (error) {
    console.error("Error saving blog markdown:", error);
    res
      .status(500)
      .json({ error: "Failed to save blog markdown", details: error.message });
  }
});

// Load blog markdown
app.get("/api/blogs/:blogId/markdown", async (req, res) => {
  try {
    const { blogId } = req.params;
    const filepath = path.join(BLOGS_DIR, `${blogId}.md`);

    const content = await fs.readFile(filepath, "utf8");
    res.type("text/markdown").send(content);
  } catch (error) {
    console.error("Error loading blog markdown:", error);
    res
      .status(404)
      .json({ error: "Blog markdown not found", details: error.message });
  }
});

// Get blog metadata
app.get("/api/blogs/metadata", async (req, res) => {
  try {
    const metadata = await fs.readFile(METADATA_FILE, "utf8");
    res.json(JSON.parse(metadata));
  } catch (error) {
    console.error("Error loading metadata:", error);
    res.json([]); // Return empty array if metadata doesn't exist
  }
});

// Delete blog markdown
app.delete("/api/blogs/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    const filepath = path.join(BLOGS_DIR, `${blogId}.md`);

    await fs.unlink(filepath);
    console.log(`🗑️ Blog markdown deleted: ${filepath}`);

    // Remove from metadata
    await removeFromMetadata(blogId);

    res.json({
      success: true,
      message: "Blog markdown deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog markdown:", error);
    res
      .status(500)
      .json({ error: "Failed to delete blog markdown", details: error.message });
  }
});

/**
 * GitHub OAuth & API Routes
 */

// GitHub OAuth callback endpoint
app.get("/api/auth/github/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: "Missing code or state" });
  }

  try {
    // Exchange code for access token
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
      return res.status(400).json({ error: tokenData.error });
    }

    // Redirect back to admin.html with token in hash
    res.redirect(`/admin.html#token=${tokenData.access_token}`);
  } catch (error) {
    console.error("Error during GitHub OAuth:", error);
    res.status(500).json({ error: "GitHub authentication failed" });
  }
});

// Verify GitHub token and get user info
app.post("/api/auth/verify", async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: "Missing access token" });
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userData = await response.json();
    res.json({
      success: true,
      user: {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
      },
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ error: "Token verification failed" });
  }
});

// Push files to GitHub
app.post("/api/github/push", async (req, res) => {
  const { access_token, files, message } = req.body;

  if (!access_token || !files || !Array.isArray(files)) {
    return res.status(400).json({ error: "Missing access_token or files" });
  }

  if (!GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
    return res
      .status(500)
      .json({ error: "GitHub repository not configured on server" });
  }

  try {
    const commitMessage = message || `Update portfolio data - ${new Date().toISOString()}`;

    // Get current repo reference
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

    // Get the current tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/git/trees/${baseSha}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!treeResponse.ok) {
      throw new Error("Failed to get repository tree");
    }

    // Create tree items for new files
    const treeItems = files.map((file) => ({
      path: file.path,
      mode: "100644",
      type: "blob",
      content: file.content,
    }));

    // Create new tree
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

    // Create commit
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

    // Update reference
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

    res.json({
      success: true,
      message: "Changes pushed to GitHub successfully",
      commit_sha: commitData.sha,
      files_pushed: files.length,
    });
  } catch (error) {
    console.error("Error pushing to GitHub:", error);
    res.status(500).json({
      error: "Failed to push changes to GitHub",
      details: error.message,
    });
  }
});

// Check if user is authorized to access admin
app.post("/api/auth/check-access", async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await userResponse.json();
    const username = user.login;

    // Check if user is repo owner
    if (username === GITHUB_REPO_OWNER) {
      return res.json({ access: true, reason: "repo_owner" });
    }

    // Check if user is a collaborator
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
      return res.json({ access: true, reason: "collaborator" });
    }

    // User is not authorized
    res.status(403).json({ access: false, error: "Not authorized to access this admin panel" });
  } catch (error) {
    console.error("Error checking access:", error);
    res.status(500).json({ error: "Access check failed" });
  }
});

/**
 * Helper Functions
 */

async function updateMetadata(blogEntry) {
  try {
    let metadata = [];

    // Read existing metadata
    try {
      const content = await fs.readFile(METADATA_FILE, "utf8");
      metadata = JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }

    // Find and update or add entry
    const existingIndex = metadata.findIndex((b) => b.id === blogEntry.id);
    if (existingIndex >= 0) {
      metadata[existingIndex] = { ...metadata[existingIndex], ...blogEntry };
    } else {
      metadata.push(blogEntry);
    }

    // Write updated metadata
    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2), "utf8");
    console.log(`📝 Metadata updated for blog: ${blogEntry.id}`);
  } catch (error) {
    console.error("Error updating metadata:", error);
  }
}

async function removeFromMetadata(blogId) {
  try {
    let metadata = [];

    // Read existing metadata
    try {
      const content = await fs.readFile(METADATA_FILE, "utf8");
      metadata = JSON.parse(content);
    } catch (error) {
      return; // File doesn't exist
    }

    // Remove entry
    metadata = metadata.filter((b) => b.id !== blogId);

    // Write updated metadata
    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2), "utf8");
    console.log(`📝 Metadata removed for blog: ${blogId}`);
  } catch (error) {
    console.error("Error removing from metadata:", error);
  }
}

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Portfolio admin server is running" });
});

/**
 * Start server
 */
async function startServer() {
  await ensureBlogsDir();

  app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║  Portfolio Admin Server                ║
    ║  Running on http://localhost:${PORT}      ║
    ║  Admin panel: http://localhost:${PORT}/admin.html ║
    ╚════════════════════════════════════════╝
    `);
  });
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server...");
  process.exit(0);
});

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
