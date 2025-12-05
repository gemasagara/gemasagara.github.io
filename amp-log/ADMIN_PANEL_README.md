# Portfolio Admin Panel

A modern, client-side admin panel for managing portfolio content without backend infrastructure.

## Quick Links

- **Use Admin Panel**: Open [admin.html](admin.html) in your browser
- **Developer Docs**: See [ADMIN_PANEL_DEVELOPMENT.md](ADMIN_PANEL_DEVELOPMENT.md)
- **Latest Updates**: See [ADMIN_PANEL_UPDATES.md](ADMIN_PANEL_UPDATES.md)
- **Testing Guide**: See [ADMIN_PANEL_TEST_GUIDE.md](ADMIN_PANEL_TEST_GUIDE.md)

---

## What You Can Do

### Manage Content
- **Projects**: Create, edit, delete projects with images, tags, and links
- **Awards**: Manage awards with descriptions and external links
- **Leadership**: Track leadership roles and organizations
- **Experiences**: Document work experience and timeline
- **Teams**: Manage team information and logos
- **Hero Section**: Edit landing page hero section (title, subtitle, CTA)
- **About Section**: Manage about page content (bio, skills, image)

### Save & Export
- **Auto-Save**: Changes automatically save to browser storage every 30 seconds
- **Export**: Download changes as JSON files
- **Import**: Upload previously exported JSON data
- **Reset**: Restore all data to original state

---

## Key Features

### Single-Click Editing
Click any item to edit instantly - no page reloads needed

### Form Validation
- Required fields enforced
- Proper field types (text, textarea, select, checkbox)
- JSON field support for complex data

### Auto-Persistence
Changes saved to browser localStorage automatically

### Safe Operations
- Unsaved changes indicator shows what needs saving
- Delete confirmation prevents accidents
- Reset feature restores original data

### JSON Export
Download your changes as JSON for backup or version control

---

## Architecture

```
Admin Panel
├── admin.html              ← Entry point, main UI
├── js/modules/
│   ├── admin-manager.js    ← Data management & CRUD
│   └── admin-ui.js         ← UI rendering & forms
├── css/
│   └── admin.css           ← Styling
└── data/
    ├── projects.json
    ├── awards.json
    ├── hero.json
    └── ... (other content)
```

---

## Content Types

### Array Types (Full CRUD)
- **Projects** - Can create, read, update, delete, reorder
- **Awards** - Can create, read, update, delete, reorder
- **Leadership** - Can create, read, update, delete, reorder
- **Experiences** - Can create, read, update, delete, reorder
- **Teams** - Can create, read, update, delete, reorder

### Object Types (Read & Update Only)
- **Hero** - Landing page hero section (edit only, cannot delete)
- **About** - About page content (edit only, cannot delete)

---

## How It Works

### Data Storage
1. **Load**: Admin panel fetches JSON files from `/data/` folder
2. **Cache**: Data loaded into memory
3. **Edit**: Changes made in browser
4. **Persist**: Changes auto-saved to browser localStorage
5. **Export**: Download changes as JSON when ready

### Publishing Flow
1. Edit content in admin panel
2. Export changes as JSON
3. Copy JSON to `/data/` folder manually
4. Commit and push to GitHub
5. GitHub Pages automatically rebuilds

---

## Technical Stack

- **No Backend**: Runs entirely in the browser
- **No Database**: Uses JSON files for data
- **No Build Tool**: Plain HTML/CSS/JavaScript ES6 modules
- **Storage**: Browser localStorage for auto-save
- **Browser Support**: Chrome, Firefox, Safari, Edge (modern versions)

---

## Security Notes

⚠️ **Important**:
- No authentication - keep admin.html private/local only
- No access control - anyone with access can edit all data
- Data in plain text - consider password protection if publishing

---

## Getting Started

### 1. Open Admin Panel
```
Open admin.html in your web browser
```

### 2. Edit Content
```
Click any section in the sidebar to view content
Click "+ Add New" to create items
Click "✏️ Edit" to modify items
Click "🗑️ Delete" to remove items (not available for Hero/About)
```

### 3. Save Changes
```
Changes auto-save to browser storage
Click "💾 Save All" to download as JSON
```

### 4. Export & Publish
```
Download JSON file from admin panel
Copy to /data/ folder
Commit and push to GitHub
```

---

## Troubleshooting

### Changes Lost After Refresh?
- Check browser localStorage is enabled
- Check that auto-save messages appear in console
- Clear browser cache and try again

### Can't Edit Hero/About?
- Open browser console (F12) for error messages
- Check that hero.json and about.json exist in /data/
- Try resetting data and re-importing

### Forms Won't Submit?
- Check all required fields are filled
- Look for validation errors in console
- Ensure JSON fields have valid format

### Export/Import Not Working?
- Check browser console for error messages
- Verify JSON file format is valid
- Try a smaller dataset first

---

## Future Enhancements

- [ ] Rich text editor for long-form content
- [ ] Image upload instead of URL input
- [ ] Drag-and-drop reordering
- [ ] Undo/redo functionality
- [ ] Multi-user support with authentication
- [ ] Direct GitHub API integration
- [ ] Preview mode to see live changes
- [ ] Version history and rollback

---

## Files

| File | Purpose |
|------|---------|
| `admin.html` | Main admin panel page |
| `js/modules/admin-manager.js` | Data management logic |
| `js/modules/admin-ui.js` | UI rendering functions |
| `css/admin.css` | Admin panel styling |
| `ADMIN_PANEL_DEVELOPMENT.md` | Detailed developer documentation |
| `ADMIN_PANEL_UPDATES.md` | Recent changes and improvements |
| `ADMIN_PANEL_TEST_GUIDE.md` | Comprehensive testing instructions |

---

## Help & Support

For detailed information:
- **Development**: See [ADMIN_PANEL_DEVELOPMENT.md](ADMIN_PANEL_DEVELOPMENT.md)
- **Testing**: See [ADMIN_PANEL_TEST_GUIDE.md](ADMIN_PANEL_TEST_GUIDE.md)
- **Updates**: See [ADMIN_PANEL_UPDATES.md](ADMIN_PANEL_UPDATES.md)

---

**Last Updated**: December 4, 2025
