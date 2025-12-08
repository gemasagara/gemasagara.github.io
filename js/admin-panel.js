import AdminManager from "./modules/admin-manager.js";
import AdminUI from "./modules/admin-ui.js";
import BlogAPI from "./modules/blog-api.js";
import GitHubAuth from "./modules/github-auth.js";
import GitHubPush from "./modules/github-push.js";

class AdminPanel {
  constructor() {
    this.manager = AdminManager;
    this.ui = new AdminUI(this.manager);
    this.blogAPI = BlogAPI;
    this.githubAuth = GitHubAuth;
    this.githubPush = GitHubPush;
    this.currentSection = "dashboard";
    this.init();
  }

  async init() {
    console.log("Initializing Admin Panel...");
    
    // Set GitHub Client ID (from config or environment)
    const githubClientId = this.getGitHubClientId();
    if (githubClientId) {
      this.githubAuth.setClientId(githubClientId);
    }
    
    // Set alert callbacks for GitHub push module
    this.githubPush.setAlertCallbacks(
      this.showAlert.bind(this),
      this.showConfirm.bind(this)
    );

    // Check if user is authenticated
    // use: !this.githubAuth.isAuthenticated() in production
    const testing = true;
    if (!testing) {
      // Show login page
      document.getElementById("loginPage").style.display = "flex";
      document.getElementById("adminContainer").style.display = "none";
      return;
    }

    // User is authenticated, check if they have access
    // use: const hasAccess = await this.githubAuth.checkAccess(); in production
    const hasAccess = testing;
    if (!hasAccess) {
      document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #f3f4f6;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="color: #dc2626; margin-bottom: 1rem;">Access Denied</h1>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">You don't have permission to access this admin panel.</p>
            <button onclick="window.location.href = './'" style="padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">Back to Portfolio</button>
          </div>
        </div>
      `;
      return;
    }
    
    // User has access, show admin panel
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("adminContainer").style.display = "flex";
    
    await this.manager.init();
    this.migrateImagePaths();
    this.restoreSidebarState();
    this.updateAuthUI();
    this.openSection("dashboard");
    this.setupEventListeners();
    this.startAutoSave();
  }

  migrateImagePaths() {
    const data = localStorage.getItem("portfolio_admin_data");
    if (!data) return;

    try {
      let allData = JSON.parse(data);
      let hasChanges = false;

      // Recursively migrate image paths
      const migrateImagePath = (obj) => {
        if (typeof obj === "string") {
          let migrated = obj;
          
          // Migrate ./images/ to ./data/images/
          if (migrated.includes("./images/") && !migrated.includes("./data/images/")) {
            migrated = migrated.replace(/\.\/images\//g, "./data/images/");
            hasChanges = true;
          }
          
          // Migrate .jpg, .jpeg, .png to .webp
          if (/\.(jpg|jpeg|png)$/i.test(migrated)) {
            migrated = migrated.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            hasChanges = true;
          }
          
          return migrated;
        } else if (Array.isArray(obj)) {
          return obj.map(migrateImagePath);
        } else if (obj !== null && typeof obj === "object") {
          const newObj = {};
          for (const key in obj) {
            newObj[key] = migrateImagePath(obj[key]);
          }
          return newObj;
        }
        return obj;
      };

      allData = migrateImagePath(allData);

      if (hasChanges) {
        localStorage.setItem("portfolio_admin_data", JSON.stringify(allData));
        console.log("✓ Image paths migrated (paths & WebP format)");
      }
    } catch (e) {
      console.error("Error migrating image paths:", e);
    }
  }

  restoreSidebarState() {
    const isCollapsed = localStorage.getItem("adminSidebarCollapsed") === "true";
    if (isCollapsed) {
      const sidebar = document.getElementById("adminSidebar");
      const container = document.querySelector(".admin-container");
      sidebar.classList.add("collapsed");
      container.classList.add("sidebar-collapsed");
    }
  }

  setupEventListeners() {
    // Event listeners setup
  }

  toggleSidebar() {
    const sidebar = document.getElementById("adminSidebar");
    const container = document.querySelector(".admin-container");
    sidebar.classList.toggle("collapsed");
    container.classList.toggle("sidebar-collapsed");
    
    // Store preference in localStorage
    const isCollapsed = sidebar.classList.contains("collapsed");
    localStorage.setItem("adminSidebarCollapsed", isCollapsed);
  }

  startAutoSave() {
    // Auto-save to localStorage every 30 seconds if there are changes
    setInterval(() => {
      if (this.manager.hasUnsavedChanges()) {
        this.manager.saveToLocalStorage();
      }
    }, 30000);
  }

  openSection(section) {
    this.currentSection = section;

    // Update nav
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });
    document
      .querySelector(`[data-section="${section}"]`)
      .classList.add("active");

    // Update content
    const content = document.getElementById("adminContent");

    if (section === "dashboard") {
      document.getElementById("pageTitle").textContent = "Dashboard";
      content.innerHTML = this.ui.renderDashboard();
    } else {
      document.getElementById("pageTitle").textContent =
        this.ui.getTitleCase(section);
      content.innerHTML = this.ui.renderTable(section);
    }
  }

  async showEditForm(type, id) {
    const modal = document.getElementById("editModal");
    const modalContent = document.getElementById("modalContent");

    try {
      modalContent.innerHTML = await this.ui.renderEditForm(type, id);
      modal.classList.add("active");

      this.currentEditType = type;
      this.currentEditId = id;
      
      // Initialize image upload handlers
      this.initializeImageUploadHandlers();
      
      // Initialize markdown editor if this is a blog form
      if (type === "blogs") {
        setTimeout(() => {
          this.initializeMarkdownEditor();
        }, 100);
      }
    } catch (error) {
      console.error("Error loading form:", error);
      this.showAlert("Error loading form: " + error.message);
    }
  }

  initializeImageUploadHandlers() {
    const imageFields = ["thumbnail", "backgroundImage", "image", "logo"];
    
    imageFields.forEach((field) => {
      const input = document.getElementById(field);
      const statusDiv = document.getElementById(`status-${field}`);
      
      if (!input || !statusDiv) return;
      
      // Function to update status display
      const updateStatus = () => {
        if (input.dataset.base64) {
          // Show newly uploaded image with filename and size
          const fileName = input.files && input.files[0] ? input.files[0].name : 'Image';
          const fileSize = input.files && input.files[0] ? (input.files[0].size / 1024).toFixed(2) : '?';
          statusDiv.innerHTML = 'Image ready: ' + fileName + ' (' + fileSize + ' KB)';
          statusDiv.style.color = '#059669';
          console.log(`[initImageUpload] ${field} has base64 data`);
        } else if (input.dataset.existingImage) {
          // Show existing image URL
          const url = input.dataset.existingImage;
          const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
          statusDiv.innerHTML = 'Image exists: ' + displayUrl;
          statusDiv.style.color = '#059669';
          console.log(`[initImageUpload] ${field} has existing image`);
        } else {
          statusDiv.innerHTML = '';
        }
      };
      
      // Show initial status if image exists
      updateStatus();
      
      // Handle file selection
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
          statusDiv.innerHTML = '';
          return;
        }
        
        console.log(`[initImageUpload] File selected: ${field} - ${file.name} (${file.size} bytes)`);
        
        if (file.size > 5 * 1024 * 1024) {
          this.showAlert('Image too large! Max 5MB');
          input.value = '';
          statusDiv.innerHTML = 'File too large!';
          statusDiv.style.color = '#dc2626';
          setTimeout(() => { statusDiv.innerHTML = ''; }, 2000);
          return;
        }
        
        statusDiv.innerHTML = 'Image loading... 0%';
        statusDiv.style.color = '#d97706';
        
        const reader = new FileReader();
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            statusDiv.innerHTML = 'Image loading... ' + percentComplete + '%';
          }
        };
        reader.onload = (event) => {
          input.dataset.base64 = event.target.result;
          console.log(`[initImageUpload] Base64 set for ${field}`);
          updateStatus();
        };
        reader.readAsDataURL(file);
      });
    });
  }

  /**
   * Initialize markdown editor for blog forms
   */
  initializeMarkdownEditor() {
    if (typeof EasyMDE === 'undefined') {
      console.warn("EasyMDE not loaded yet");
      return;
    }
    
    const mdElement = document.getElementById('markdownContent');
    if (!mdElement) {
      console.warn("Markdown element not found");
      return;
    }
    
    // Destroy existing editor if any
    if (window.easyMDE) {
      window.easyMDE.toTextArea();
      window.easyMDE = null;
    }
    
    // Create new editor
    try {
      window.easyMDE = new EasyMDE({
        element: mdElement,
        spellChecker: false,
        autoDownloadFontAwesome: true,
        toolbar: [
          'bold', 'italic', 'heading', '|',
          'quote', 'unordered-list', 'ordered-list', '|',
          'link', 'image', 'table', '|',
          'preview', 'side-by-side', 'fullscreen', '|',
          'guide'
        ],
        placeholder: 'Write your blog content here...',
        initialValue: mdElement.value
      });
      console.log("EasyMDE initialized successfully");
    } catch (error) {
      console.error("Error initializing EasyMDE:", error);
    }
  }

  closeModal() {
    const modal = document.getElementById("editModal");
    modal.classList.remove("active");
  }

  async saveItem(event, type, id) {
    event.preventDefault();

    const form = document.getElementById("editForm");
    const formData = new FormData(form);
    const itemData = {};
    const imageFields = ["thumbnail", "backgroundImage", "image", "logo"];
    let markdownContent = null;

    // Convert form data to object, skip file inputs (they're handled separately)
    formData.forEach((value, key) => {
      // Skip file inputs - they'll be handled via base64
      if (imageFields.includes(key) && value instanceof File) {
        return;
      }
      
      // Store markdown content separately for blogs
      if (key === "markdownContent") {
        markdownContent = value;
        return;
      }
      
      if (value === "true") {
        itemData[key] = true;
      } else if (value === "false") {
        itemData[key] = false;
      } else if (!isNaN(value) && value !== "") {
        itemData[key] = parseInt(value);
      } else {
        itemData[key] = value;
      }
    });

    // Handle image uploads (base64) - capture BEFORE trying other values
    imageFields.forEach((field) => {
      const input = document.getElementById(field);
      if (input && input.dataset.base64) {
        console.log(`[saveItem] Capturing base64 for ${field}`);
        itemData[field] = input.dataset.base64;
      }
    });

    // If EasyMDE is initialized for blogs, get content from editor
    if (type === "blogs" && window.easyMDE) {
      markdownContent = window.easyMDE.value();
    }

    try {

      // Parse JSON fields if they exist
      ["bio", "skills", "tags", "cta", "relatedProjects", "relatedAwards", "relatedLeadership"].forEach((field) => {
        if (itemData[field] && typeof itemData[field] === "string") {
          try {
            itemData[field] = JSON.parse(itemData[field]);
          } catch (e) {
            console.warn(`Could not parse ${field}:`, e);
          }
        }
      });

      // For blogs, parse tags if it's a string
      if (type === "blogs" && itemData.tags && typeof itemData.tags === "string") {
        try {
          // Try to parse as JSON first
          itemData.tags = JSON.parse(itemData.tags);
        } catch (e) {
          // If not JSON, split by comma
          itemData.tags = itemData.tags
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag);
        }
      }

      // For blogs, handle markdown content and auto-generate filename
      if (type === "blogs") {
        const recentBlogs = JSON.parse(
          sessionStorage.getItem("recently_edited_blogs") || "[]"
        );
        if (!recentBlogs.includes(itemData.id)) {
          recentBlogs.push(itemData.id);
        }
        sessionStorage.setItem("recently_edited_blogs", JSON.stringify(recentBlogs));

        if (!itemData.markdownFile) {
          itemData.markdownFile = `posts/${itemData.id}.md`;
        }
        
        // Calculate read time if markdown content provided
        if (markdownContent) {
          itemData.readTime = await this.calculateReadTime(markdownContent);
          itemData.markdownContent = markdownContent;
          
          // Prepare markdown file for saving (will be sent to server)
          const blogMarkdownData = {
            blogId: itemData.id,
            title: itemData.title,
            date: itemData.date,
            category: itemData.category,
            author: itemData.author,
            tags: itemData.tags,
            thumbnail: itemData.thumbnail,
            excerpt: itemData.excerpt,
            featured: itemData.featured,
            published: itemData.published,
            externalLink: itemData.externalLink,
            markdownFile: itemData.markdownFile,
            content: markdownContent
          };
          
          // Try to save to server, fall back to localStorage if server is unavailable
          try {
            await this.blogAPI.saveBlogMarkdown(blogMarkdownData);
            console.log(`Blog markdown saved to server: ${itemData.id}`);
          } catch (apiError) {
            console.warn("Could not save to server, storing in localStorage:", apiError);
            const blogMarkdownKey = `blog_markdown_${itemData.id}`;
            localStorage.setItem(blogMarkdownKey, JSON.stringify(blogMarkdownData));
            console.log(`[INFO] Blog markdown stored in localStorage: ${blogMarkdownKey}`);
          }
        }
      }

      if (id === "new") {
        console.log(`[saveItem] Creating new ${type}`, itemData);
        this.manager.createItem(type, itemData);
        console.log(`Item created:`, itemData);
        this.showAlert("Item created successfully!");
      } else {
        console.log(`[DEBUG] Entering else block for update, type=${type}, id=${id}`);
        // For both "edit" (single objects) and regular IDs (array items)
        console.log(`[saveItem] Updating ${type} with id=${id}`, itemData);
        console.log(`[saveItem] this.manager is:`, this.manager);
        const result = await this.manager.updateItem(type, id, itemData);
        console.log(`[saveItem] updateItem returned:`, result);
        console.log(`Item updated:`, itemData);
        this.showAlert("Item updated successfully!");
      }

      // Ensure data is saved to localStorage
      this.manager.saveToLocalStorage();
      console.log("[INFO] localStorage synchronized after save");

      this.closeModal();
      this.openSection(this.currentSection);
    } catch (error) {
      console.error("Error saving item:", error);
      this.showAlert("Error saving item: " + error.message, "error", "Error");
    }
  }

  /**
   * Calculate read time based on word count
   */
  calculateReadTime(content) {
    const wordCount = content.split(/\s+/).length;
    const readingSpeed = 200; // words per minute
    const minutes = Math.ceil(wordCount / readingSpeed);
    return `${minutes} min read`;
  }

  deleteItem(type, id) {
    if (this.manager.deleteItem(type, id)) {
      this.showAlert("Item deleted successfully!", "success", "Deleted");
      this.openSection(this.currentSection);
    }
  }

  async confirmDelete(type, id) {
    const confirmed = await this.showConfirm("Are you sure you want to delete this item?", "Confirm Delete");
    if (confirmed) {
      this.deleteItem(type, id);
    }
  }

  resetData() {
    this.manager.resetToOriginal();
    this.manager.saveToLocalStorage();
    this.forcePush = true;
    this.showAlert("Data reset to original!", "success", "Reset Complete");
    this.openSection("dashboard");
  }

  async confirmResetAll() {
    const confirmed = await this.showConfirm("Reset all changes to original? This cannot be undone.", "Confirm Reset");
    if (confirmed) {
      this.resetData();
    }
  }

  /**
   * GitHub Authentication Methods
   */

  getGitHubClientId() {
    // Get from meta tag or config
    const metaTag = document.querySelector('meta[name="github-client-id"]');
    if (metaTag) {
      return metaTag.getAttribute("content");
    }
    // Or try to get from window config
    return window.GITHUB_CLIENT_ID || "";
  }

  login() {
    this.githubAuth.startLogin();
  }

  logout() {
    this.githubAuth.logout();
    document.getElementById("loginPage").style.display = "flex";
    document.getElementById("adminContainer").style.display = "none";
    this.showAlert("Logged out from GitHub");
  }

  updateAuthUI() {
    const loginBtn = document.getElementById("loginBtn");
    const authInfo = document.getElementById("authInfo");
    const userAvatar = document.getElementById("userAvatar");
    const userName = document.getElementById("userName");
    const pushBtn = document.getElementById("pushChangesBtn");

    if (this.githubAuth.isAuthenticated()) {
      const user = this.githubAuth.getUser();
      
      // Show auth info
      loginBtn.style.display = "none";
      authInfo.style.display = "block";
      userAvatar.src = user.avatar_url;
      userName.textContent = user.login;
      
      // Show push button
      if (pushBtn) {
        pushBtn.style.display = "inline-block";
      }
    } else {
      // Show login button
      loginBtn.style.display = "block";
      authInfo.style.display = "none";
      
      // Hide push button
      if (pushBtn) {
        pushBtn.style.display = "none";
      }
    }
  }

  async pushChangesToGitHub() {
    const forcePush = this.forcePush || false;
    const success = await this.githubPush.pushChanges();
    this.forcePush = false;
    if (success) {
      // Could add additional UI updates here
      console.log("Changes successfully pushed to GitHub");
    }
  }

  previewChanges(){
    // Open the preview page in a new tab/window
    window.open('./preview.html', 'preview');
  }

  /**
 * Show custom alert box
 */
showAlert(message, type = "info", title = null) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "custom-alert-overlay";

    const typeClass = type === "success" ? "custom-alert-success" : 
                      type === "error" ? "custom-alert-error" :
                      type === "warning" ? "custom-alert-warning" : "";

    overlay.innerHTML = `
      <div class="custom-alert-box ${typeClass}">
        ${title ? `<div class="custom-alert-title">${title}</div>` : ""}
        <div class="custom-alert-message">${message}</div>
        <div class="custom-alert-buttons">
          <button class="custom-alert-btn custom-alert-btn-ok">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const btn = overlay.querySelector(".custom-alert-btn-ok");
    btn.addEventListener("click", () => {
      overlay.remove();
      resolve();
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve();
      }
    });
  });
}

/**
 * Show custom confirm dialog
 */
showConfirm(message, title = "Confirm") {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "custom-alert-overlay";

    overlay.innerHTML = `
      <div class="custom-alert-box">
        <div class="custom-alert-title">${title}</div>
        <div class="custom-alert-message">${message}</div>
        <div class="custom-alert-buttons">
          <button class="custom-alert-btn custom-alert-btn-cancel">Cancel</button>
          <button class="custom-alert-btn custom-alert-btn-ok">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const okBtn = overlay.querySelector(".custom-alert-btn-ok");
    const cancelBtn = overlay.querySelector(".custom-alert-btn-cancel");

    okBtn.addEventListener("click", () => {
      overlay.remove();
      resolve(true);
    });

    cancelBtn.addEventListener("click", () => {
      overlay.remove();
      resolve(false);
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(false);
      }
    });
  });
}
}

// Initialize admin panel
window.adminPanel = new AdminPanel();
