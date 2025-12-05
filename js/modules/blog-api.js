/**
 * Blog API - Client-side module for communicating with backend
 * Handles saving blog markdown files to the server
 */

class BlogAPI {
  constructor() {
    // Detect API URL from current location
    // If running on localhost:3000, use /api
    // Otherwise, construct from current origin
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const port = window.location.port ? `:${window.location.port}` : '';
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    
    this.baseUrl = `${protocol}//${host}${port}/api`;
    console.log(`BlogAPI initialized with baseUrl: ${this.baseUrl}`);
  }

  /**
   * Save blog markdown to server
   * @param {Object} blogData - Blog metadata and content
   * @returns {Promise<Object>} Response from server
   */
  async saveBlogMarkdown(blogData) {
    try {
      const response = await fetch(`${this.baseUrl}/blogs/save-markdown`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving blog markdown:", error);
      throw error;
    }
  }

  /**
   * Load blog markdown from server
   * @param {string} blogId - Blog ID
   * @returns {Promise<string>} Markdown content
   */
  async loadBlogMarkdown(blogId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/blogs/${blogId}/markdown`
      );

      if (!response.ok) {
        throw new Error(`Could not load blog markdown`);
      }

      return await response.text();
    } catch (error) {
      console.error("Error loading blog markdown:", error);
      throw error;
    }
  }

  /**
   * Get all blog markdown metadata
   * @returns {Promise<Array>} Array of blog metadata
   */
  async getBlogMetadata() {
    try {
      const response = await fetch(`${this.baseUrl}/blogs/metadata`);

      if (!response.ok) {
        throw new Error("Could not fetch blog metadata");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching blog metadata:", error);
      throw error;
    }
  }

  /**
   * Delete blog markdown
   * @param {string} blogId - Blog ID
   * @returns {Promise<Object>} Response from server
   */
  async deleteBlogMarkdown(blogId) {
    try {
      const response = await fetch(`${this.baseUrl}/blogs/${blogId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Could not delete blog`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting blog:", error);
      throw error;
    }
  }
}

export default new BlogAPI();
