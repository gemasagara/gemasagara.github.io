/**
 * Admin UI - UI components and rendering for admin panel
 */

import BlogManager from "./blog-manager.js";

class AdminUI {
  constructor(adminManager) {
    this.manager = adminManager;
    this.currentType = "projects";
    this.currentEditId = null;
    this.blogManager = BlogManager;
  }

  /**
   * Render main dashboard
   */
  renderDashboard() {
    const stats = this.manager.getStats();

    return `
      <div class="admin-dashboard">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${stats.projects}</div>
            <div class="stat-label">Projects</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.awards}</div>
            <div class="stat-label">Awards</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.leadership}</div>
            <div class="stat-label">Leadership</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.experiences}</div>
            <div class="stat-label">Experiences</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.teams}</div>
            <div class="stat-label">Teams</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.blogs}</div>
            <div class="stat-label">Blogs</div>
          </div>
          </div>

        <div class="actions-grid">
          <button class="btn btn-warning" onclick="window.adminPanel.confirmResetAll()">
            Reset All
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render table for a content type
   */
  renderTable(type) {
    const items = this.manager.getItems(type);
    const headers = this.getTableHeaders(type);
    const isSingleObject = type === "hero" || type === "about";

    let html = `
      <div class="admin-content">
        <div class="content-header">
          <h2>${this.getTitleCase(type)}</h2>
          ${
            !isSingleObject
              ? `<button class="btn btn-success" onclick="window.adminPanel.showEditForm('${type}', null)">
             Add New
           </button>`
              : ""
          }
        </div>

        <div class="table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                ${headers.map((h) => `<th>${h}</th>`).join("")}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
    `;

    items.forEach((item) => {
      html += this.renderTableRow(type, item, headers);
    });

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Render single table row
   */
  renderTableRow(type, item, headers) {
    const isSingleObject = type === "hero" || type === "about";
    const itemId = isSingleObject ? "edit" : item.id;

    const values = headers.map((header) => {
      const key = header.toLowerCase();
      let value = item[key];

      if (key === "order") {
        return value || "-";
      }
      if (key === "visibility") {
        return `<span class="badge badge-${value}">${value}</span>`;
      }
      // Handle published column (blogs)
      if (key === "published") {
        const published = value === true || value === "true";
        const badgeClass = published ? "badge-published" : "badge-hidden";
        const text = published ? "Published" : "Not Published";
        return `<span class="badge ${badgeClass}">${text}</span>`;
      }
      // Handle featured column (blogs, projects)
      if (key === "featured") {
        const featured = value === true || value === "true";
        const badgeClass = featured ? "badge-published" : "badge-hidden";
        const text = featured ? "Featured" : "Not Featured";
        return `<span class="badge ${badgeClass}">${text}</span>`;
      }
      if (key === "lastmodified") {
        return new Date(item.lastModified).toLocaleDateString();
      }
      if (typeof value === "object") {
        return JSON.stringify(value).substring(0, 30) + "...";
      }
      return (value || "-").toString().substring(0, 50);
    });

    return `
      <tr>
        ${values.map((v) => `<td>${v}</td>`).join("")}
        <td class="actions">
          <button class="btn-small" onclick="window.adminPanel.showEditForm('${type}', '${itemId}')">Edit</button>
          ${
            !isSingleObject
              ? `<button class="btn-small btn-danger" onclick="window.adminPanel.confirmDelete('${type}', '${item.id}')">Delete</button>`
              : ""
          }
        </td>
      </tr>
    `;
  }

  /**
   * Render edit form
   */
  async renderEditForm(type, id) {
    // For single objects (hero, about), always fetch existing item
    let item;
    let isEdit = false;

    if (type === "hero" || type === "about") {
      item = await this.manager.getItemById(type, id);
      isEdit = !!item; // Will be true if item exists
    } else {
      item =
        id && id !== "new"
          ? await this.manager.getItemById(type, id)
          : this.getEmptyItem(type);
      isEdit = id && id !== "new";
    }

    const schema = this.getItemSchema(type);
    
    // Ensure item has all schema fields with defaults
    item = this.ensureItemDefaults(item, schema);

    let html = `
      <div class="modal-header">
        <h3>${isEdit ? "Edit" : "Create"} ${this.getTitleCase(type)}</h3>
        <button class="modal-close" onclick="window.adminPanel.closeModal()">✕</button>
      </div>

      <form id="editForm" onsubmit="window.adminPanel.saveItem(event, '${type}', '${
      id || "new"
    }')">
        <div class="modal-body" style="${type === "blogs" ? "max-height: 80vh; overflow-y: auto;" : ""}">
    `;

    // Render form fields
    Object.keys(schema).forEach((field) => {
      const config = schema[field];
      const value = item[field] ?? "";

      // For blogs, handle markdown content specially
      if (type === "blogs" && field === "markdownContent") {
        html += this.renderMarkdownEditor(field, value, isEdit);
      } else {
        html += this.renderFormField(field, config, value);
      }
    });

    html += `
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.adminPanel.closeModal()">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            ${id ? "Update" : "Create"}
          </button>
        </div>
      </form>
    `;

    return html;
  }

  /**
   * Render markdown editor for blog content
   */
  renderMarkdownEditor(fieldName, value, isEdit) {
    return `
      <div class="form-group">
        <label for="${fieldName}">Blog Content (Markdown)</label>
        <div id="markdown-editor-wrapper" style="margin-bottom: 15px;">
          <textarea id="${fieldName}" name="${fieldName}" style="width: 100%; min-height: 400px;">${this.escapeHtml(value)}</textarea>
        </div>
        <small style="display: block; margin-top: 5px; color: #666;">Write your blog content in Markdown format. Use the toolbar above for formatting.</small>
      </div>
    `;
  }

  /**
   * Get EasyMDE initialization script (no longer needed, initialized in admin.html)
   */


  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Render form field
   */
  renderFormField(fieldName, config, value) {
    const label = config.label || this.getTitleCase(fieldName);
    const required = config.required ? "required" : "";

    // Convert objects/arrays to JSON for display
    let displayValue = value;
    if (typeof value === "object" && value !== null) {
      displayValue = JSON.stringify(value, null, 2);
    }

    // Check if this is an image field
    const isImageField = ["thumbnail", "backgroundimage", "image", "logo"].includes(fieldName.toLowerCase());

    if (isImageField) {
      // Image upload field with status indicator
      const statusId = `status-${fieldName}`;
      const hasExistingImage = value ? `data-existing-image="${this.escapeHtml(value)}"` : "";
      const buttonText = value ? "Replace Image" : "Choose Image";
      
      return `
        <div class="form-group">
          <label>${label}</label>
          <div class="file-input-wrapper">
            <input type="file" id="${fieldName}" name="${fieldName}" accept="image/*" class="file-input-hidden" ${required} ${hasExistingImage}>
            <label for="${fieldName}" class="btn btn-primary file-input-label">${buttonText}</label>
          </div>
          <div id="${statusId}" style="margin-top: 8px; font-size: 0.875rem; color: #666;"></div>
          <small style="display: block; margin-top: 5px; color: #666;">Upload an image. Max size: 5MB</small>
        </div>
      `;
    }

    if (config.type === "textarea") {
      return `
        <div class="form-group">
          <label for="${fieldName}">${label}</label>
          <textarea id="${fieldName}" name="${fieldName}" ${required}>${displayValue}</textarea>
        </div>
      `;
    }

    if (config.type === "checkbox") {
      const checked = value === true || value === "true" ? "checked" : "";
      return `
        <div class="form-group">
          <label for="${fieldName}" class="checkbox-label">
            <input type="checkbox" id="${fieldName}" name="${fieldName}" value="true" ${checked}>
            ${label}
          </label>
        </div>
      `;
    }

    if (config.type === "select") {
      // Ensure value is a string for comparison
      const stringValue = String(value || "");
      return `
        <div class="form-group">
          <label for="${fieldName}">${label}</label>
          <select id="${fieldName}" name="${fieldName}" ${required}>
            ${config.options
              .map(
                (opt) =>
                  `<option value="${opt}" ${
                    String(opt) === stringValue ? "selected" : ""
                  }>${opt}</option>`
              )
              .join("")}
          </select>
        </div>
      `;
    }

    if (config.type === "number") {
      return `
        <div class="form-group">
          <label for="${fieldName}">${label}</label>
          <input type="number" id="${fieldName}" name="${fieldName}" value="${displayValue}" ${required}>
        </div>
      `;
    }

    // Default: text input
    return `
      <div class="form-group">
        <label for="${fieldName}">${label}</label>
        <input type="text" id="${fieldName}" name="${fieldName}" value="${displayValue}" ${required}>
      </div>
    `;
  }

  /**
   * Get table headers for type
   */
  getTableHeaders(type) {
    const headers = {
      projects: ["ID", "Title", "Category", "Year", "Visibility", "Order"],
      awards: ["ID", "Title", "Year", "Visibility", "Order"],
      leadership: [
        "ID",
        "Title",
        "Organization",
        "Year",
        "Visibility",
        "Order",
      ],
      experiences: ["ID", "Title", "Duration", "Visibility", "Order"],
      teams: ["ID", "Name", "Description", "Visibility", "Order"],
      blogs: ["ID", "Title", "Category", "Author", "Featured", "Published"],
    };

    return headers[type] || ["ID", "Title", "Visibility", "Order"];
  }

  /**
   * Get form schema for type
   */
  getItemSchema(type) {
    const blogOptions = this.getBlogOptions();
    
    const schemas = {
      projects: {
        id: { label: "ID", required: true },
        title: { label: "Title", required: true },
        category: { label: "Category", required: true },
        year: { label: "Year", required: true },
        thumbnail: { label: "Thumbnail URL" },
        tagline: { label: "Tagline", type: "textarea" },
        featured: { label: "Featured", type: "checkbox" },
        linkedBlog: { label: "Linked Blog Post ID", type: "select", options: blogOptions },
        externalLink: { label: "External Link (Instagram, News, etc.)" },
        order: { label: "Order", type: "number", required: true },
        visibility: {
          label: "Visibility",
          type: "select",
          options: ["published", "draft", "hidden"],
          required: true,
        },
      },
      awards: {
        id: { label: "ID", required: true },
        title: { label: "Title", required: true },
        year: { label: "Year", required: true },
        backgroundImage: { label: "Background Image URL" },
        description: { label: "Description", type: "textarea" },
        linkedBlog: { label: "Linked Blog Post ID", type: "select", options: blogOptions },
        externalLink: { label: "External Link (Instagram, News, etc.)" },
        order: { label: "Order", type: "number", required: true },
        visibility: {
          label: "Visibility",
          type: "select",
          options: ["published", "draft", "hidden"],
          required: true,
        },
      },
      leadership: {
        id: { label: "ID", required: true },
        title: { label: "Title", required: true },
        organization: { label: "Organization", required: true },
        year: { label: "Year", required: true },
        image: { label: "Image URL" },
        description: { label: "Description", type: "textarea" },
        order: { label: "Order", type: "number", required: true },
        visibility: {
          label: "Visibility",
          type: "select",
          options: ["published", "draft", "hidden"],
          required: true,
        },
      },
      experiences: {
        id: { label: "ID", required: true },
        title: { label: "Title", required: true },
        duration: { label: "Duration", required: true },
        description: { label: "Description", type: "textarea" },
        order: { label: "Order", type: "number", required: true },
        visibility: {
          label: "Visibility",
          type: "select",
          options: ["published", "draft", "hidden"],
          required: true,
        },
      },
      teams: {
        id: { label: "ID", required: true },
        name: { label: "Name", required: true },
        description: { label: "Description" },
        logo: { label: "Logo URL" },
        order: { label: "Order", type: "number", required: true },
        visibility: {
          label: "Visibility",
          type: "select",
          options: ["published", "draft", "hidden"],
          required: true,
        },
      },
      hero: {
        title: { label: "Title", required: true },
        subtitle: { label: "Subtitle", required: true },
        description: { label: "Description", type: "textarea", required: true },
        backgroundImage: { label: "Background Image URL" },
        visibility: {
          label: "Visibility",
          type: "select",
          options: ["published", "draft", "hidden"],
          required: true,
        },
      },
      about: {
        image: { label: "Profile Image URL", required: true },
        greeting: { label: "Greeting", required: true },
        bio: {
          label: "Biography (JSON array of strings)",
          type: "textarea",
          required: true,
        },
        skills: { label: "Skills (JSON array)", type: "textarea" },
        visibility: {
          label: "Visibility",
          type: "select",
          options: ["published", "draft", "hidden"],
          required: true,
        },
      },
      blogs: {
        id: { label: "ID", required: true },
        title: { label: "Title", required: true },
        date: { label: "Date (YYYY-MM-DD)", required: true },
        category: { label: "Category", required: true },
        tags: { label: "Tags (comma-separated or JSON array)", type: "textarea" },
        author: { label: "Author", required: true },
        thumbnail: { label: "Thumbnail Image" },
        excerpt: { label: "Excerpt", type: "textarea", required: true },
        readTime: { label: "Read Time (auto-calculated, edit if needed)" },
        featured: { label: "Featured", type: "checkbox" },
        published: { label: "Published", type: "checkbox" },
        markdownContent: { label: "Blog Content (Markdown)" },
        externalLink: { label: "External Link (Instagram, News, etc.)" },
      },
      };

      return schemas[type] || {};
      }

  /**
   * Get empty item template
   */
  getEmptyItem(type) {
    const templates = {
      projects: { featured: false, visibility: "draft", order: 999, linkedBlog: "", externalLink: "" },
      awards: { visibility: "draft", order: 999, linkedBlog: "", externalLink: "" },
      leadership: { visibility: "draft", order: 999 },
      experiences: { visibility: "draft", order: 999 },
      teams: { visibility: "draft", order: 999 },
      hero: { visibility: "draft" },
      about: { visibility: "draft", bio: "[]", skills: "[]" },
      blogs: { featured: false, published: false, tags: "[]", externalLink: "", markdownContent: "", author: "Gema Sagara" },
    };

    return templates[type] || { visibility: "draft", order: 999 };
  }

  /**
   * Get blog options for select dropdown
   */
  getBlogOptions() {
    const blogs = this.manager.getItems("blogs");
    const options = [""];  // Empty option for "none"
    blogs.forEach((blog) => {
      options.push(blog.id);
    });
    return options;
  }

  /**
   * Get title case version
   */
  getTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Ensure item has all schema fields with default values
   * This handles backward compatibility with old data structures
   */
  ensureItemDefaults(item, schema) {
    const itemWithDefaults = { ...item };
    
    Object.keys(schema).forEach((field) => {
      // If field is missing, add it with a default value
      if (!(field in itemWithDefaults)) {
        const config = schema[field];
        
        // Special handling for linkedBlog field
        if (field === "linkedBlog" && itemWithDefaults.detailsPage) {
          // Extract the project ID from detailsPage query parameter
          // e.g., "view-details.html?project=project-rover" -> "project-rover"
          const match = itemWithDefaults.detailsPage.match(/[?&]project=([^&]+)/);
          if (match && match[1]) {
            itemWithDefaults[field] = match[1];
          } else {
            itemWithDefaults[field] = "";
          }
        } else if (config.type === "checkbox") {
          itemWithDefaults[field] = false;
        } else if (config.type === "number") {
          itemWithDefaults[field] = 0;
        } else if (config.type === "select" && config.options) {
          itemWithDefaults[field] = config.options[0] || "";
        } else {
          itemWithDefaults[field] = "";
        }
      }
    });
    
    return itemWithDefaults;
  }
}

export default AdminUI;
