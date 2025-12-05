# Admin Panel - Developer Documentation

> **Latest Updates**: See [ADMIN_PANEL_UPDATES.md](ADMIN_PANEL_UPDATES.md) for recent changes and improvements (December 4, 2025)
>
> **Testing Guide**: See [ADMIN_PANEL_TEST_GUIDE.md](ADMIN_PANEL_TEST_GUIDE.md) for comprehensive testing instructions

## Architecture Overview

The admin panel consists of three main layers:

```
┌─────────────────────────────────────────┐
│         Admin UI (admin-ui.js)          │  ← User interface components
│    (Tables, Forms, Modals, Rendering)   │
├─────────────────────────────────────────┤
│      Admin Manager (admin-manager.js)   │  ← Business logic & CRUD
│    (Data loading, persistence, I/O)     │
├─────────────────────────────────────────┤
│    Admin HTML (admin.html)              │  ← Entry point & orchestration
│    (Initialization, event handling)     │
└─────────────────────────────────────────┘
```

---

## File Structure

```
Portfolio/
├── admin.html                          # Main admin panel page
├── js/
│   └── modules/
│       ├── admin-manager.js           # Core data management
│       └── admin-ui.js                # UI rendering
├── css/
│   └── admin.css                      # Admin styling
└── data/
    ├── projects.json
    ├── awards.json
    ├── experiences.json
    ├── leadership.json
    ├── teams.json
    ├── hero.json
    └── about.json
```

---

## Module: admin-manager.js

Core data management singleton. Handles CRUD operations and data persistence.

### Class: AdminManager

#### Properties

```javascript
this.data              // Current data in memory
this.originalData      // Original data (for reset)
this.unsavedChanges    // Tracks which data types have changes
this.storageKey        // localStorage key ('portfolio_admin_data')
```

#### Methods

##### Load Data
```javascript
await adminManager.init()
// Loads all JSON files from /data/ folder
// Restores from localStorage if available
```

##### Read Operations
```javascript
adminManager.getItems(type)           // Returns all items of type
adminManager.getItemById(type, id)    // Returns single item
```

##### Create Operation
```javascript
adminManager.createItem(type, itemData)
// Generates ID if not provided
// Sets timestamps (createdAt, lastModified)
// Sets default visibility to 'draft'
// Increments order automatically
// Returns created item
```

##### Update Operation
```javascript
adminManager.updateItem(type, id, updates)
// Updates specific fields
// Updates lastModified timestamp
// Returns updated item
```

##### Delete Operation
```javascript
adminManager.deleteItem(type, id)
// Removes item from array
// Returns boolean (success/failure)
```

##### Ordering
```javascript
adminManager.reorderItems(type, orderedIds)
// Takes array of IDs in desired order
// Updates order field for each item
```

##### Visibility
```javascript
adminManager.setVisibility(type, id, visibility)
// Sets visibility: 'published', 'draft', 'hidden'
// Returns updated item
```

##### Persistence
```javascript
adminManager.saveToLocalStorage()   // Save to browser storage
adminManager.restoreFromLocalStorage()  // Load from browser storage
adminManager.resetToOriginal(type)  // Reset to original data
```

##### Import/Export
```javascript
adminManager.exportData(type)       // Download JSON file
adminManager.importData(file)       // Load JSON file (Promise)
```

##### Status Checking
```javascript
adminManager.hasUnsavedChanges(type)  // Boolean - true if unsaved
adminManager.getStats()            // Returns statistics object
```

---

## Module: admin-ui.js

UI rendering and form generation. Converts data to HTML strings.

### Class: AdminUI

#### Constructor
```javascript
const ui = new AdminUI(adminManager)
// Takes admin manager instance
// Used for accessing data
```

#### Rendering Methods

##### Dashboard
```javascript
adminUI.renderDashboard()
// Returns HTML string with stats and action buttons
// Shows: project count, award count, etc.
// Includes: export, import, reset buttons
```

##### Tables
```javascript
adminUI.renderTable(type)
// Returns HTML table for content type
// Shows: columns based on type
// Includes: edit and delete buttons for each row
```

##### Forms
```javascript
adminUI.renderEditForm(type, id)
// Returns HTML modal with edit form
// If id is null, creates new item form
// Includes: all fields for type, submit button
```

##### Form Fields
```javascript
adminUI.renderFormField(fieldName, config, value)
// Renders single form input
// Supports: text, textarea, number, select
// Config: { type, label, required, options }
```

#### Configuration Methods

##### Table Headers
```javascript
adminUI.getTableHeaders(type)
// Returns array of column names for table
// Example: ['ID', 'Title', 'Year', 'Visibility', 'Order']
```

##### Form Schema
```javascript
adminUI.getItemSchema(type)
// Returns schema for form generation
// Includes: field names, types, labels, validation
// Example:
// {
//   title: { label: 'Title', required: true },
//   year: { label: 'Year', required: true }
// }
```

##### Empty Item Template
```javascript
adminUI.getEmptyItem(type)
// Returns blank item with defaults
// Sets: visibility='draft', order=999
```

---

## File: admin.html

Entry point and orchestration. Initializes and controls admin panel.

### Key Components

#### HTML Structure
```html
<div class="admin-container">
  <aside class="admin-sidebar">
    <!-- Navigation -->
  </aside>
  <main class="admin-main">
    <!-- Content area -->
  </main>
</div>

<div id="editModal" class="modal-overlay">
  <!-- Form modal -->
</div>
```

#### AdminPanel Class (JavaScript)

Main application class that coordinates everything.

```javascript
class AdminPanel {
  async init()                  // Initialize on page load
  setupEventListeners()         // Attach event handlers
  startAutoSave()              // Auto-save every 30s

  openSection(section)         // Load content section
  showEditForm(type, id)       // Show edit modal
  closeModal()                 // Close modal
  saveItem(event, type, id)    // Save edited item
  deleteItem(type, id)         // Delete item
  saveAllChanges()             // Export all changes
  handleImport(event)          // Import JSON file
  showExportModal()            // Show export dialog
  executeExport()              // Execute export
  resetData()                  // Reset to original
  updateUnsavedIndicator()     // Update UI state
}
```

### Event Flow

```
User Action
    ↓
Event Handler
    ↓
AdminPanel Method
    ↓
AdminManager (CRUD)
    ↓
Data Updated
    ↓
AdminUI Renders
    ↓
DOM Updated
    ↓
User Sees Change
```

---

## Data Flow

### Creating an Item

```
1. User clicks "➕ Add New"
   ↓
2. openSection() or showEditForm(type, null)
   ↓
3. AdminUI.renderEditForm(type, null)
   ↓
4. Form rendered in modal with empty fields
   ↓
5. User fills form and clicks "Create"
   ↓
6. saveItem(event, type, 'new')
   ↓
7. Extract form data into object
   ↓
8. AdminManager.createItem(type, data)
   ↓
9. Generate ID, add timestamps, set defaults
   ↓
10. Push to this.data[type] array
    ↓
11. Set unsavedChanges[type] = true
    ↓
12. Save to localStorage
    ↓
13. Close modal and refresh view
```

### Updating localStorage

```
User makes change
    ↓
updateItem() / createItem() / deleteItem()
    ↓
Set unsavedChanges[type] = true
    ↓
Call saveToLocalStorage()
    ↓
JSON.stringify(this.data)
    ↓
localStorage.setItem(storageKey, json)
    ↓
Next page load:
    ↓
restoreFromLocalStorage()
    ↓
JSON.parse from localStorage
    ↓
Merge into this.data
```

### Exporting Data

```
User clicks "💾 Save All"
    ↓
saveAllChanges()
    ↓
Get unsaved types from stats
    ↓
Create object with only changed types
    ↓
JSON.stringify with formatting
    ↓
Create Blob
    ↓
Create download link
    ↓
Trigger download
    ↓
File saved to Downloads folder
    ↓
User manually copies to /data/ folder
```

---

## localStorage Schema

Data stored in browser under key: `portfolio_admin_data`

```javascript
{
  "projects": [...],
  "awards": [...],
  "leadership": [...],
  "experiences": [...],
  "teams": [...],
  "hero": {...},
  "about": {...}
}
```

**Key Features**:
- Stored as JSON string
- ~5MB limit per domain
- Persists across sessions
- Can be cleared by user
- No expiration

---

## Content Type Schemas

### Projects

```javascript
{
  id: string,
  title: string,
  category: string,
  year: string,
  thumbnail: string (URL),
  tagline: string,
  featured: boolean,
  detailsPage: string (URL),
  tags: string[],
  order: number,
  visibility: 'published'|'draft'|'hidden',
  createdAt: ISO8601,
  lastModified: ISO8601
}
```

### Awards

```javascript
{
  id: string,
  title: string,
  year: string,
  backgroundImage: string (URL),
  description: string,
  link: string (URL),
  external: boolean,
  order: number,
  visibility: 'published'|'draft'|'hidden',
  createdAt: ISO8601,
  lastModified: ISO8601
}
```

### Leadership

```javascript
{
  id: string,
  title: string,
  organization: string,
  year: string,
  image: string (URL),
  description: string,
  order: number,
  visibility: 'published'|'draft'|'hidden',
  createdAt: ISO8601,
  lastModified: ISO8601
}
```

---

## Extending the Admin Panel

### Adding a New Content Type

1. **Add to AdminManager**
   ```javascript
   // In init() method
   const response = await fetch('./data/newtype.json');
   this.data['newtype'] = await response.json();
   ```

2. **Add Schema to AdminUI**
   ```javascript
   getItemSchema(type) {
     const schemas = {
       // ... existing ...
       newtype: {
         field1: { label: 'Field 1', required: true },
         field2: { label: 'Field 2', type: 'textarea' }
       }
     };
   }
   ```

3. **Add to Sidebar**
   ```html
   <li><a href="#" onclick="window.adminPanel.openSection('newtype')" 
     class="nav-link" data-section="newtype">📌 New Type</a></li>
   ```

4. **Add Table Headers**
   ```javascript
   getTableHeaders(type) {
     const headers = {
       newtype: ['ID', 'Field 1', 'Field 2', 'Order']
     };
   }
   ```

---

## Future Enhancements

### GitHub API Integration

```javascript
// Save directly to GitHub
async commitToGitHub(token) {
  // 1. Get current file from GitHub
  // 2. Create commit with changes
  // 3. Push to main branch
  // 4. GitHub Pages rebuilds automatically
}
```

### User Authentication

```javascript
// Add login screen
async authenticateUser(password) {
  // 1. Verify password
  // 2. Store session token
  // 3. Allow access to admin panel
}
```

### Image Upload

```javascript
// Instead of URL input
async uploadImage(file) {
  // 1. Convert to base64
  // 2. Save to /images/ folder
  // 3. Return image path
}
```

### Preview Mode

```javascript
// Preview changes before saving
showPreview(type, id) {
  // 1. Load preview window
  // 2. Display item as it would appear on site
  // 3. Allow switching between versions
}
```

---

## Browser Compatibility

**Supported Browsers**:
- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+

**Requirements**:
- ES6 Module Support
- localStorage API
- Fetch API
- FormData API

---

## Performance Considerations

### localStorage Limits

- Typical limit: 5-10MB
- Current data size: ~100-200KB
- Safe operations: Create, update, delete individual items
- Risky: Storing multiple large JSON exports

### Optimization

```javascript
// Good: Store only modified data
unsavedChanges[type] = true;

// Bad: Store entire history
history.push({ ...snapshot });

// Solution: Use indexed storage for large datasets
// Future: Implement IDB (IndexedDB) for larger data
```

---

## Content Type Handling

### Array-Based Types
Projects, Awards, Leadership, Experiences, Teams - These are stored as arrays and support full CRUD operations.

### Single Object Types
Hero and About - These are stored as single objects and only support Read and Update operations. Delete and Create are not available for these sections.

**Hero Fields:**
- `title` - Hero section title
- `subtitle` - Subtitle text
- `description` - Description text
- `backgroundImage` - URL to background image
- `cta` - Call-to-action object `{ text, link }`
- `visibility` - published/draft/hidden
- `createdAt` - Auto-generated timestamp
- `lastModified` - Auto-updated timestamp

**About Fields:**
- `image` - URL to profile image
- `greeting` - Greeting text
- `bio` - Array of biography strings (JSON)
- `skills` - Array of skill objects `[{ name, level }, ...]` (JSON)
- `visibility` - published/draft/hidden
- `createdAt` - Auto-generated timestamp
- `lastModified` - Auto-updated timestamp

---

## Testing

### Manual Testing Checklist

- [ ] Create new item
- [ ] Edit existing item
- [ ] Delete item
- [ ] Change visibility
- [ ] Reorder items
- [ ] Export single type
- [ ] Export all data
- [ ] Import data
- [ ] Page refresh preserves changes
- [ ] Reset to original works
- [ ] All sections load correctly
- [ ] Hero section edit works
- [ ] About section edit works
- [ ] JSON fields (bio, skills, cta) parse correctly
- [ ] Checkbox fields (featured, external) work correctly

### Console Testing

```javascript
// Check manager state
window.adminPanel.manager.getStats()

// Check unsaved changes
window.adminPanel.manager.hasUnsavedChanges()

// Force save
window.adminPanel.manager.saveToLocalStorage()

// Clear cache
localStorage.removeItem('portfolio_admin_data')
```

---

## Debugging

### Enable Verbose Logging

Already enabled by default. Check browser console (F12).

```javascript
// Output example:
✅ Admin Manager initialized
🚀 Initializing Admin Panel...
💾 Data saved to localStorage
📂 Data restored from localStorage
📥 Data exported
📤 Data imported successfully
```

### DevTools Tips

1. **Check localStorage**
   - DevTools → Application → LocalStorage
   - Look for `portfolio_admin_data` key

2. **Monitor network**
   - DevTools → Network tab
   - Check JSON file loads successfully

3. **Inspect DOM**
   - DevTools → Elements
   - Find `.admin-table`, `.modal-overlay`, etc.

4. **Console errors**
   - DevTools → Console
   - All errors logged with context

---

## License & Security Notes

⚠️ **Current Limitations**:
- No authentication
- No access control
- Data stored in plain text (localStorage)
- Vulnerable to XSS if not careful with HTML

🔒 **Security Recommendations**:
1. Don't publish admin.html to GitHub
2. Keep admin.html local only
3. Add password protection before public use
4. Sanitize all user inputs
5. Validate form data server-side (when backend added)

---

## API Reference Summary

### AdminManager
- `init()` - Initialize
- `getItems(type)` - Get all
- `getItemById(type, id)` - Get one
- `createItem(type, data)` - Create
- `updateItem(type, id, updates)` - Update
- `deleteItem(type, id)` - Delete
- `reorderItems(type, ids)` - Reorder
- `setVisibility(type, id, status)` - Set visibility
- `exportData(type)` - Export to JSON
- `importData(file)` - Import from JSON
- `resetToOriginal(type)` - Reset

### AdminUI
- `renderDashboard()` - Dashboard HTML
- `renderTable(type)` - Table HTML
- `renderEditForm(type, id)` - Form HTML
- `renderFormField(name, config, value)` - Field HTML
- `getTableHeaders(type)` - Column names
- `getItemSchema(type)` - Field schema
- `getEmptyItem(type)` - Blank item

---

## Support & Maintenance

For questions or issues, check:
1. Browser console for errors
2. localStorage integrity
3. JSON file validation
4. Network requests (DevTools)
5. Module imports in admin.html
