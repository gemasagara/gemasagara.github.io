import AdminManager from "./modules/admin-manager.js";
import AdminUI from "./modules/admin-ui.js";
import BlogAPI from "./modules/blog-api.js";

class AdminPanel {
  constructor() {
    this.manager = AdminManager;
    this.ui = new AdminUI(this.manager);
    this.blogAPI = BlogAPI;
    this.currentSection = "dashboard";
    this.init();
  }

  async init() {
    console.log("Initializing Admin Panel...");
    await this.manager.init();
    this.restoreSidebarState();
    this.openSection("dashboard");
    this.setupEventListeners();
    this.startAutoSave();
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
      alert("Error loading form: " + error.message);
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
          alert('Image too large! Max 5MB');
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
      console.log("[OK] EasyMDE initialized successfully");
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
            console.log(`[OK] Blog markdown saved to server: ${itemData.id}`);
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
        console.log(`[OK] Item created:`, itemData);
        alert("[OK] Item created successfully!");
      } else {
        console.log(`[DEBUG] Entering else block for update, type=${type}, id=${id}`);
        // For both "edit" (single objects) and regular IDs (array items)
        console.log(`[saveItem] Updating ${type} with id=${id}`, itemData);
        console.log(`[saveItem] this.manager is:`, this.manager);
        const result = await this.manager.updateItem(type, id, itemData);
        console.log(`[saveItem] updateItem returned:`, result);
        console.log(`[OK] Item updated:`, itemData);
        alert("[OK] Item updated successfully!");
      }

      // Ensure data is saved to localStorage
      this.manager.saveToLocalStorage();
      console.log("[INFO] localStorage synchronized after save");

      this.closeModal();
      this.openSection(this.currentSection);
    } catch (error) {
      console.error("Error saving item:", error);
      alert("❌ Error saving item: " + error.message);
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
      alert("✅ Item deleted successfully!");
      this.openSection(this.currentSection);
    }
  }

  resetData() {
    this.manager.resetToOriginal();
    alert("✅ Data reset to original!");
    this.openSection("dashboard");
  }
}

// Initialize admin panel
window.adminPanel = new AdminPanel();
