# Admin Panel User Guide

## Overview

The Admin Panel is a web-based interface for managing all portfolio content without editing code or JSON files directly.

**Access URL**: `./admin.html` (relative to your site root)

---

## Features

✅ **Content Management**
- View all portfolio items (projects, awards, leadership, etc.)
- Create new items
- Edit existing items
- Delete items
- Manage item visibility (published/draft/hidden)

✅ **Data Operations**
- Export all data as JSON
- Import data from JSON files
- Auto-save to browser storage
- Reset to original data

✅ **User-Friendly**
- Clean, organized interface
- Sidebar navigation
- Modal forms for editing
- Real-time unsaved changes indicator
- Responsive design (desktop & mobile)

---

## Getting Started

### 1. Open the Admin Panel

Open in your browser:
```
file:///path/to/Portfolio/admin.html
```

Or if hosted:
```
https://yoursite.com/admin.html
```

### 2. You'll See the Dashboard

The dashboard displays:
- Number of projects, awards, leadership items, etc.
- Action buttons for export/import
- Quick statistics

### 3. Navigate Using the Sidebar

Left sidebar has links to:
- 🏠 **Hero** - Edit hero section
- 👤 **About** - Edit about section
- 📁 **Projects** - Manage projects
- 🏆 **Awards** - Manage awards
- 👥 **Leadership** - Manage leadership roles
- 💼 **Experiences** - Manage skills/experiences
- 🎯 **Teams** - Manage teams/organizations

---

## Managing Content

### View Content

1. Click on a section in the sidebar (e.g., "Projects")
2. See table with all items in that category
3. Each row shows key information and actions

### Create New Item

1. Click a section (e.g., "Projects")
2. Click **➕ Add New** button
3. Fill in the form fields
4. Click **Create**

**Example: Adding a Project**
```
Title: "My New Project"
Category: "Robotics"
Year: "2025"
Featured: false
Visibility: "draft"
Order: 26
```

### Edit Item

1. In the table, click **✏️ Edit** on the row
2. Modal opens with form
3. Update fields as needed
4. Click **Update**

### Delete Item

1. In the table, click **🗑️ Delete** on the row
2. Confirm deletion
3. Item is removed

### Change Visibility

Edit an item and change the **Visibility** field:
- **published** - Shows on live site
- **draft** - Hidden from site (for future use)
- **hidden** - Archived (won't show)

---

## Data Persistence

### Auto-Save to Browser

- Changes are automatically saved to browser's localStorage
- Every 30 seconds if you have unsaved changes
- You'll see **⚠️ Unsaved Changes** indicator in top right
- Survives page refresh!

### Manual Save

Click **💾 Save All** button to:
1. Export modified sections as JSON
2. Download file to your computer
3. Follow instructions to update `/data/` folder

---

## Import/Export

### Export Data

**Export All Data:**
1. Click **📥 Export All Data** on dashboard
2. JSON file downloads
3. Contains all current data

**Export Single Section:**
1. Click **📥 Export All Data** on dashboard
2. Select specific section from dropdown
3. Only that section exports

### Import Data

**Import JSON File:**
1. Click **📤 Import Data** on dashboard
2. Select JSON file from your computer
3. Data merges with existing content
4. Check results in respective sections

**Use Case:**
- Restoring backup data
- Transferring data between sites
- Batch uploading new content

---

## Updating the Live Site

### Option 1: Manual File Replacement (Recommended)

1. **Edit content in Admin Panel**
2. **Click 💾 Save All** when done
3. **Download the JSON file**
4. **Navigate to `/data/` folder in your project**
5. **Replace the JSON files** with downloaded versions
6. **Commit and push to GitHub**

```bash
# Example
git add data/
git commit -m "Update portfolio content via admin panel"
git push
```

### Option 2: Direct File Editing (Future)

When connected to a backend API, you can:
1. Click a "Sync" button
2. Changes instantly save to server
3. No manual download/upload needed

---

## Content Editing Guide

### Projects

**Required Fields**:
- Title
- Category (e.g., "Robotics", "Machine Learning")
- Year (e.g., "2025", "24/25")
- Order (numeric position)

**Optional Fields**:
- Thumbnail (image URL)
- Tagline (description, HTML allowed)
- Featured (show in featured section)
- Details Page URL

**Example**:
```json
{
  "title": "Autonomous Robot",
  "category": "Robotics",
  "year": "2025",
  "thumbnail": "./images/robot.png",
  "tagline": "Built a robot with <b>machine learning</b>",
  "featured": true,
  "order": 1
}
```

### Awards

**Required Fields**:
- Title
- Year
- Order

**Optional Fields**:
- Background Image
- Description (HTML allowed)
- Link URL
- External (open in new tab)

### Leadership/Experiences

Similar structure with appropriate fields.

### Hero Section

Edit as a single item:
- Title (main heading)
- Subtitle (tagline)
- Description (full description)
- CTA Text (button text)
- CTA Link (button target)

### About Section

- Greeting (e.g., "Hello, I'm Gema")
- Bio (multiple paragraphs)
- Skills (name + proficiency 0-100)

---

## Unsaved Changes Workflow

**Scenario**: You edit a project and refresh the page

1. **Edit in progress** → "⚠️ Unsaved Changes" appears
2. **Page refresh** → Data is preserved from localStorage
3. **Click 💾 Save All** → Download and upload to `/data/` folder
4. **Indicator disappears** → All saved!

**Important**: Always save/export before:
- Closing the browser
- Clearing browser cache
- Reinstalling OS
- Major browser updates

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Close modal | ESC key |
| Submit form | Enter (in form) |
| Save all | Ctrl+S (not implemented, use button) |

---

## Troubleshooting

### Changes Don't Appear on Live Site

**Problem**: You edited content in admin panel but don't see changes

**Solution**:
1. Click 💾 Save All
2. Download the JSON file
3. Replace files in `/data/` folder
4. Commit and push to GitHub
5. Wait for GitHub Pages to rebuild (~1 min)
6. Hard refresh browser (Ctrl+Shift+R)

### Lost Changes

**Problem**: Changes disappeared after refresh

**Solution**:
1. Check browser developer tools → Application → LocalStorage
2. Look for `portfolio_admin_data` key
3. If it exists, data is still there - use export to recover
4. If not, check browser cache settings

### Import Fails

**Problem**: "Error importing data"

**Solution**:
1. Verify JSON file is valid (use online JSON validator)
2. Check file name matches expected format
3. Ensure file has correct structure
4. Try exporting first, then examine the format

### Can't Edit Hero/About

**Problem**: Hero/About sections show edit form instead of table

**Reason**: Hero and About are single objects (not arrays) so they load directly in edit form

**Solution**: This is expected behavior. Just edit and the changes save.

---

## Security Notes

⚠️ **Important**:

1. **No Authentication Yet**
   - Anyone with access to admin.html can edit content
   - For now, keep admin.html locally on your computer
   - Don't commit admin.html to public GitHub

2. **Future Security**
   - Add password protection
   - Implement user roles (admin, editor)
   - Require GitHub login for access

3. **Data Privacy**
   - localStorage is browser-specific
   - Clearing browser data = losing drafts
   - Always export important changes

---

## Keyboard Navigation

- **Tab** - Move between form fields
- **Enter** - Submit forms
- **ESC** - Close modals
- **Arrow Keys** - Scroll tables

---

## Tips & Tricks

### Batch Operations

1. Export all data
2. Edit JSON in text editor
3. Import back
4. Verify changes in admin panel

### Workflow

1. **Create draft** → Set visibility to "draft"
2. **Review** → Check on live site via preview
3. **Publish** → Change to "published"
4. **Save** → Download and commit to GitHub

### Backup Strategy

1. Regularly export all data
2. Store backups locally
3. Keep multiple versions
4. Date your backups

---

## Features Coming Soon

🔜 **Planned Enhancements**:
- GitHub API integration (auto-commit changes)
- User authentication
- Preview functionality
- Image upload instead of URL only
- Bulk import from CSV
- Content versioning
- Change history
- User roles & permissions

---

## API Reference (For Developers)

### Admin Manager Methods

```javascript
// Get all items of a type
adminManager.getItems('projects')

// Get single item
adminManager.getItemById('projects', 'id-123')

// Create item
adminManager.createItem('projects', { title: '...' })

// Update item
adminManager.updateItem('projects', 'id-123', { title: 'New Title' })

// Delete item
adminManager.deleteItem('projects', 'id-123')

// Export data
adminManager.exportData('projects')

// Import data
adminManager.importData(file)

// Check unsaved changes
adminManager.hasUnsavedChanges()
```

### Admin UI Methods

```javascript
// Render content for type
adminUI.renderTable('projects')

// Render edit form
adminUI.renderEditForm('projects', 'id-123')

// Get schema for type
adminUI.getItemSchema('projects')
```

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review browser console (F12) for errors
3. Check localStorage data (DevTools → Application → LocalStorage)
4. Refer to DATA_SCHEMA.md for content structure

---

## Summary

**Quick Reference**:

| Task | Steps |
|------|-------|
| View content | Sidebar → Section → See table |
| Add item | Click ➕ Add New → Fill form → Create |
| Edit item | Click ✏️ Edit → Update → Submit |
| Delete item | Click 🗑️ Delete → Confirm |
| Export | Click 📥 Export → Download JSON |
| Import | Click 📤 Import → Select file |
| Save changes | Click 💾 Save All → Download → Upload to /data/ |

**Remember**: 
- ✅ Data persists in browser (localStorage)
- ✅ Export to download backup
- ✅ Manual save needed for live site
- ✅ Future: Auto-sync via GitHub API
