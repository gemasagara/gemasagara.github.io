/**
 * GitHub Push Module
 * Handles pushing changes to GitHub repository
 */

import GitHubAuth from "./github-auth.js";
import AdminManager from "./admin-manager.js";

class GitHubPush {
  constructor() {
    this.isLoading = false;
    this.alertCallbacks = null;
  }

  /**
   * Set alert callbacks from AdminPanel
   */
  setAlertCallbacks(showAlert, showConfirm) {
    this.alertCallbacks = { showAlert, showConfirm };
  }

  /**
   * Collect all modified files from localStorage
   */
  getModifiedFiles() {
  const files = [];

  // Get all data from the single localStorage key
  const allDataStr = localStorage.getItem("portfolio_admin_data");
  
  if (!allDataStr) {
    console.log("No portfolio data found in localStorage");
    return files;
  }

  try {
    const allData = JSON.parse(allDataStr);
    
    // Push each section as separate JSON files
    const sections = [
      "hero",
      "about",
      "projects",
      "awards",
      "leadership",
      "experiences",
      "teams",
      "blogs",
    ];

    sections.forEach((section) => {
      if (allData[section]) {
        files.push({
          path: `data/${section}.json`,
          content: JSON.stringify(allData[section], null, 2),
        });
      }
    });

  } catch (e) {
    console.error("Error parsing portfolio data:", e);
  }

  // Only push blog markdown files that were just edited in THIS session
  const recentlyEditedBlogs = JSON.parse(
    sessionStorage.getItem("recently_edited_blogs") || "[]"
  );

  recentlyEditedBlogs.forEach((blogId) => {
    const blogData = localStorage.getItem(`blog_markdown_${blogId}`);
    if (blogData) {
      files.push({
        path: `data/blogs/posts/${blogId}.md`,
        content: this.createMarkdownWithFrontmatter(JSON.parse(blogData)),
      });
    }
  });

  // Clear the list after collecting
  sessionStorage.removeItem("recently_edited_blogs");

  return files;
}


  /**
   * Create markdown file with frontmatter
   */
  createMarkdownWithFrontmatter(blogData) {
    const {
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
      content,
    } = blogData;

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
      const tagsStr = tags
        .map((t) => (t.includes(" ") ? `"${t}"` : t))
        .join(", ");
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

    return frontmatter.join("\n") + "\n\n" + (content || "");
  }

  /**
   * Push changes to GitHub
   */
  async pushChanges(forcePush) {
    if (!GitHubAuth.isAuthenticated()) {
      await this.alertCallbacks.showAlert("Please authenticate with GitHub first", "warning", "Not Authenticated");
      return false;
    }

    const files = this.getModifiedFiles();

    // Allow push if forcePush is true (from reset) or if there are files
    if (files.length === 0 && !forcePush) {
      await this.alertCallbacks.showAlert("No changes to push", "warning", "Nothing to Push");
      return false;
    }

    const confirmed = await this.alertCallbacks.showConfirm(`Push ${files.length} file(s) to GitHub?`, "Confirm Push");
    if (!confirmed) {
      return false;
    }

    this.isLoading = true;
    this.showLoadingIndicator();

    try {
      const response = await fetch("/api/github/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: GitHubAuth.getToken(),
          files: files,
          message: this.generateCommitMessage(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || "Failed to push changes");
      }

      const data = await response.json();

      await this.alertCallbacks.showAlert(
        `Successfully pushed ${data.files_pushed} file(s) to GitHub!\n\nCommit: ${data.commit_sha}\n\nChanges will be deployed in a few minutes.`,
        "success",
        "Push Successful"
      );

      return true;
    } catch (error) {
      console.error("Error pushing to GitHub:", error);
      await this.alertCallbacks.showAlert(
        `Failed to push changes: ${error.message}`,
        "error",
        "Push Failed"
      );
      return false;
    } finally {
      this.isLoading = false;
      this.hideLoadingIndicator();
    }
  }

  /**
   * Generate commit message based on changes
   */
  generateCommitMessage() {
    const timestamp = new Date().toLocaleString();
    return `Update portfolio data - ${timestamp}`;
  }

  /**
   * Show loading indicator
   */
  showLoadingIndicator() {
    let indicator = document.getElementById("push-loading-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "push-loading-indicator";
      indicator.className = "push-loading";
      indicator.innerHTML = `
        <div class="push-loading-content">
          <div class="spinner"></div>
          <p>Pushing changes to GitHub...</p>
        </div>
      `;
      document.body.appendChild(indicator);
    }
    indicator.style.display = "flex";
  }

  /**
   * Hide loading indicator
   */
  hideLoadingIndicator() {
    const indicator = document.getElementById("push-loading-indicator");
    if (indicator) {
      indicator.style.display = "none";
    }
  }
}

export default new GitHubPush();
