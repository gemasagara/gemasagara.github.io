/**
 * Admin Manager - Core functionality for managing portfolio content
 * Handles: CRUD operations, localStorage persistence, import/export
 */

import BlogManager from "./blog-manager.js";

class AdminManager {
  constructor() {
     this.data = {};
     this.originalData = {};
     this.storageKey = "portfolio_admin_data";
     this.blogManager = BlogManager;
     this.init();
   }

  /**
   * Initialize admin manager
   */
  async init() {
    console.log("Loading admin data...");

    try {
        this.data = await this.fetchDataFromServer();
        localStorage.setItem("portfolio_admin_data", JSON.stringify(this.data));
        console.log("Loaded from server and cached in localStorage");
      } catch (error) {
        console.error("Failed to load data from server:", error);
        this.data = this.getDefaultData();
      }

    this.originalData = JSON.parse(JSON.stringify(this.data));
  }

  async fetchDataFromServer() {
    const sections = ["hero", "about", "projects", "awards", "leadership", "experiences", "teams", "blogs"];
    const data = {};

    for (const section of sections) {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/gemasagara/gemasagara.github.io/admin/data/${section}.json`
        );
        if (response.ok) {
          data[section] = await response.json();
        }
      } catch (error) {
        console.warn(`Could not load ${section}.json:`, error);
      }
    }

    return data;
  }

  /**
   * Load data from JSON files
   */
  async loadData() {
    const dataTypes = [
      "projects",
      "awards",
      "experiences",
      "leadership",
      "teams",
      "hero",
      "about",
    ];

    for (const type of dataTypes) {
       try {
         const response = await fetch(`./data/${type}.json`);
         if (!response.ok) throw new Error(`Failed to load ${type}.json`);
         this.data[type] = await response.json();
         this.originalData[type] = JSON.parse(JSON.stringify(this.data[type]));
       } catch (error) {
         console.error(`Error loading ${type}.json:`, error);
         this.data[type] = [];
       }
     }
     
     // Load and auto-discover blogs from markdown files
     try {
       await this.discoverBlogsFromMarkdown();
     } catch (error) {
       console.error(`Error loading blogs:`, error);
       this.data.blogs = [];
     }
  }

  /**
   * Get all items of a type
   * For arrays: returns the array
   * For objects (hero, about): returns array with single object
   */
  getItems(type) {
    if (!this.data[type]) {
      return [];
    }
    if (Array.isArray(this.data[type])) {
      return this.data[type];
    }
    // For single objects like hero/about, return as array for UI consistency
    return [this.data[type]];
  }

  /**
   * Get single item by ID
   * For single objects (hero, about), returns the object regardless of id
   */
  async getItemById(type, id) {
    // For single objects, return the object itself
    if (type === "hero" || type === "about") {
      return this.data[type];
    }

    const items = this.getItems(type);
    const item = items.find((item) => item.id === id);
    
    // If it's a blog, load the markdown content
    if (item && type === "blogs" && !item.markdownContent) {
      try {
        item.markdownContent = await this.loadBlogMarkdown(item.markdownFile);
      } catch (error) {
        console.warn(`Could not load markdown for blog ${id}:`, error);
        item.markdownContent = "";
      }
    }
    
    return item;
  }

  /**
   * Load markdown content from file
   */
  async loadBlogMarkdown(markdownFile) {
    try {
      const response = await fetch(`./data/blogs/${markdownFile}`);
      if (!response.ok) return "";
      
      const content = await response.text();
      // Extract only the content (after frontmatter)
      return this.blogManager.extractContent(content);
    } catch (error) {
      console.warn(`Could not load markdown file ${markdownFile}:`, error);
      return "";
    }
  }

  /**
   * Create new item
   */
  createItem(type, itemData) {
    if (!Array.isArray(this.data[type])) {
      this.data[type] = [];
    }

    // Generate ID if not provided
    if (!itemData.id) {
      itemData.id = this.generateId(type);
    }

    // Add timestamps
    itemData.createdAt = new Date().toISOString();
    itemData.lastModified = new Date().toISOString();

    // Add default visibility
    if (!itemData.visibility) {
      itemData.visibility = "draft";
    }

    // Add default order
    if (itemData.order === undefined) {
      const maxOrder = Math.max(
        0,
        ...this.data[type].map((item) => item.order || 0)
      );
      itemData.order = maxOrder + 1;
    }

    this.data[type].push(itemData);
    this.saveToLocalStorage();

    return itemData;
  }

  /**
   * Update item
   */
  async updateItem(type, id, updates) {
    console.log(`[updateItem] type: ${type}, id: ${id}, updates:`, updates);
    
    // For single objects (hero, about), id is ignored
    if (type === "hero" || type === "about") {
      const item = this.data[type];
      if (!item) {
        console.error(`[updateItem] Item not found for ${type}`);
        return null;
      }
      console.log(`[updateItem] Before update:`, JSON.parse(JSON.stringify(item)));
      Object.assign(item, updates);
      item.lastModified = new Date().toISOString();
      console.log(`[updateItem] After update:`, JSON.parse(JSON.stringify(item)));
      console.log(`[updateItem] this.data[${type}] is now:`, JSON.parse(JSON.stringify(this.data[type])));
      this.saveToLocalStorage();
      return item;
    }

    // For arrays
    const item = await this.getItemById(type, id);
    if (!item) {
      console.error(`[updateItem] Item not found for ${type} with id ${id}`);
      return null;
    }

    console.log(`[updateItem] Before update:`, JSON.parse(JSON.stringify(item)));
    Object.assign(item, updates);
    item.lastModified = new Date().toISOString();
    console.log(`[updateItem] After update:`, JSON.parse(JSON.stringify(item)));
    console.log(`[updateItem] this.data[${type}] is now:`, JSON.parse(JSON.stringify(this.data[type])));
    
    this.saveToLocalStorage();

    return item;
  }

  /**
   * Delete item
   */
  deleteItem(type, id) {
    const index = this.data[type].findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.data[type].splice(index, 1);
    this.saveToLocalStorage();

    return true;
  }

  /**
   * Reorder items
   */
  reorderItems(type, orderedIds) {
    const items = this.data[type];
    orderedIds.forEach((id, index) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        item.order = index + 1;
      }
    });

    this.saveToLocalStorage();
  }

  /**
   * Change visibility status
   */
  setVisibility(type, id, visibility) {
    const item = this.getItemById(type, id);
    if (!item) return null;

    item.visibility = visibility;
    item.lastModified = new Date().toISOString();

    this.saveToLocalStorage();

    return item;
  }



  /**
   * Generate unique ID
   */
  generateId(type) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${type}-${timestamp}-${random}`;
  }

  /**
   * Save to localStorage
   */
  saveToLocalStorage() {
    try {
      const dataToSave = JSON.stringify(this.data);
      console.log("[saveToLocalStorage] About to save:", this.data);
      localStorage.setItem(this.storageKey, dataToSave);
      const savedData = localStorage.getItem(this.storageKey);
      console.log("[saveToLocalStorage] Verified saved data:", JSON.parse(savedData));
      console.log("[INFO] Data saved to localStorage");
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  /**
   * Restore from localStorage
   */
  restoreFromLocalStorage() {
     try {
       const stored = localStorage.getItem(this.storageKey);
       if (stored) {
         const storedData = JSON.parse(stored);
         // Merge localStorage data with current data
         Object.keys(storedData).forEach((type) => {
           if (Array.isArray(storedData[type]) || typeof storedData[type] === "object") {
             this.data[type] = storedData[type];
           }
         });
         console.log("[INFO] Data restored from localStorage");
       }
     } catch (error) {
       console.error("Failed to restore from localStorage:", error);
     }
   }



  /**
   * Reset to original data
   */
  resetToOriginal(type) {
     if (type) {
       this.data[type] = JSON.parse(JSON.stringify(this.originalData[type]));
     } else {
       Object.keys(this.originalData).forEach((key) => {
         this.data[key] = JSON.parse(JSON.stringify(this.originalData[key]));
       });
     }
     localStorage.removeItem(this.storageKey);
     console.log("[INFO] Data reset to original");
   }

  /**
   * Discover blogs from markdown files with "project-*.md" pattern
   */
  async discoverBlogsFromMarkdown() {
    const markdownFiles = [
      "project-cherapace.md",
      "project-example.md",
      "project-ftc2425.md",
      "project-ftcworlds.md",
      "project-gamedev.md",
      "project-natech.md",
      "project-robot.md",
      "project-rocket.md",
      "project-rover.md",
    ];

    const blogsMap = {};

    // Auto-discover from markdown files
    for (const file of markdownFiles) {
      try {
        const response = await fetch(`./data/blogs/posts/${file}`);
        if (!response.ok) continue;

        const content = await response.text();
        const blog = this.parseMarkdownFrontmatter(file, content);
        if (blog) {
          // Use map to avoid duplicates
          blogsMap[blog.id] = blog;
        }
      } catch (error) {
        console.warn(`Could not load blog file ${file}:`, error);
      }
    }

    // Try to load manual metadata for backward compatibility and additional fields
    try {
      const response = await fetch(`./data/blogs/metadata.json`);
      if (response.ok) {
        const manualBlogs = await response.json();
        // Merge manual metadata (only keep entries that match our auto-discovered blogs)
        manualBlogs.forEach((manual) => {
          if (blogsMap[manual.id]) {
            // Merge overrides from manual metadata
            Object.assign(blogsMap[manual.id], manual);
          }
        });
      }
    } catch (error) {
      // metadata.json is optional, so don't fail if it doesn't exist
    }

    // Convert map to array
    this.data.blogs = Object.values(blogsMap);
    this.originalData.blogs = JSON.parse(JSON.stringify(this.data.blogs));
    console.log(`[OK] Discovered ${this.data.blogs.length} blog posts`);
  }

  /**
   * Parse markdown frontmatter and extract metadata
   */
  parseMarkdownFrontmatter(filename, content) {
    // Extract filename without extension
    const fileId = filename.replace(".md", "");

    // Match frontmatter (YAML between ---)
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    let yaml = {};
    
    // Parse frontmatter if it exists, otherwise create empty entry
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      yaml = this.parseYAML(frontmatter);
    } else if (content.trim() === "") {
      // Empty file - still create entry with defaults
      console.warn(`Empty markdown file: ${filename}`);
    } else {
      // File has content but no frontmatter
      console.warn(`No frontmatter found in ${filename}`);
    }

    return {
      id: fileId,
      title: yaml.title || fileId.replace(/-/g, " "),
      date: yaml.date || new Date().toISOString().split("T")[0],
      category: yaml.category || "Uncategorized",
      tags: yaml.tags ? (Array.isArray(yaml.tags) ? yaml.tags : [yaml.tags]) : [],
      author: yaml.author || "Gema Sagara",
      thumbnail: yaml.media || yaml.thumbnail || "",
      excerpt: yaml.tagline || yaml.excerpt || "",
      readTime: yaml.readTime || this.estimateReadTime(content),
      featured: yaml.featured === true || yaml.featured === "true",
      published: yaml.published !== false && yaml.published !== "false",
      markdownFile: `posts/${filename}`,
      externalLink: yaml.link || "",
    };
  }

  /**
   * Simple YAML parser for frontmatter
   */
  parseYAML(yaml) {
    const obj = {};
    const lines = yaml.split("\n");

    lines.forEach((line) => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        // Parse booleans
        if (value === "true") value = true;
        if (value === "false") value = false;

        obj[key] = value;
      }
    });

    return obj;
  }

  /**
   * Estimate read time based on word count
   */
  estimateReadTime(content) {
    const wordCount = content.split(/\s+/).length;
    const readingSpeed = 200; // words per minute
    const minutes = Math.ceil(wordCount / readingSpeed);
    return `${minutes} min read`;
  }

  /**
   * Migrate detailsPage URLs to linkedBlog
   * Extracts blog ID from URLs like "view-details.html?project=project-id"
   */
  migrateDetailsPageToLinkedBlog() {
    const urlRegex = /[?&]project=([^&]+)/;

    // Migrate projects
    if (Array.isArray(this.data.projects)) {
      this.data.projects.forEach((project) => {
        if (project.detailsPage && !project.linkedBlog) {
          const match = project.detailsPage.match(urlRegex);
          if (match) {
            project.linkedBlog = match[1];
            console.log(`[OK] Migrated project ${project.id}: linkedBlog = ${match[1]}`);
          }
        }
        // Remove old field
        if (project.detailsPage) {
          delete project.detailsPage;
        }
      });
    }

    // Migrate awards (if they have similar URLs)
    if (Array.isArray(this.data.awards)) {
      this.data.awards.forEach((award) => {
        if (award.link && !award.linkedBlog) {
          const match = award.link.match(urlRegex);
          if (match) {
            award.linkedBlog = match[1];
            console.log(`[OK] Migrated award ${award.id}: linkedBlog = ${match[1]}`);
          }
        }
      });
    }
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges() {
    // Compare current data with localStorage
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return false;
      const storedData = JSON.parse(stored);
      const currentDataStr = JSON.stringify(this.data);
      const storedDataStr = JSON.stringify(storedData);
      return currentDataStr !== storedDataStr;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get statistics
   */
  getStats() {
     return {
       projects: this.getItems("projects").length,
       awards: this.getItems("awards").length,
       leadership: this.getItems("leadership").length,
       experiences: this.getItems("experiences").length,
       teams: this.getItems("teams").length,
       blogs: this.getItems("blogs").length,
     };
   }
}

// Create singleton instance
const adminManager = new AdminManager();
export default adminManager;
