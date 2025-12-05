# JSON-Based Content System - Implementation Guide

## Overview

Your portfolio has been refactored to use a JSON-based content system. This allows you to manage all portfolio content (projects, awards, leadership, etc.) in simple JSON files instead of hardcoding everything in HTML.

## What Changed

### ✅ Core Architecture
- **Data Layer**: All content stored in `/data/*.json` files
- **Rendering Layer**: JavaScript modules render templates from JSON data
- **Error Handling**: Graceful fallbacks if JSON files are missing or invalid

### 📁 Data Files Structure

```
data/
├── projects.json          # All projects with metadata
├── awards.json            # All awards and recognition
├── leadership.json        # Leadership roles and activities
├── experiences.json       # Skills and experience cards
├── teams.json             # Teams and organizations
├── navigation.json        # Navigation configuration
├── hero.json              # Hero section content
├── about.json             # About section content
├── site-config.json       # Site-wide configuration
└── blogs/
    └── metadata.json      # Blog post metadata
```

### 🔧 JavaScript Modules

#### Data Management
- **`js/modules/data-loader.js`**
  - Fetches JSON files with caching
  - Retry logic with exponential backoff
  - Graceful fallback to empty arrays if files missing
  - Singleton instance exported

#### Renderers (Convert JSON → HTML)
- **`js/modules/projects-renderer.js`** - Projects grid with load more
- **`js/modules/awards-renderer.js`** - Awards section
- **`js/modules/leadership-renderer.js`** - Leadership cards
- **`js/modules/experiences-renderer.js`** - Skills & experience
- **`js/modules/teams-renderer.js`** - Team carousel
- **`js/modules/navigation-renderer.js`** - Navigation items

#### Utilities
- **`js/utils/templates.js`** - HTML template functions
- **`js/utils/helpers.js`** - Logging, HTML sanitization, utilities
- **`js/config.js`** - Global configuration and selectors

#### Application
- **`js/main.js`** - App initialization and orchestration
- **`js/legacy/interactions.js`** - DOM-based interactions (mobile menu, carousel)

## How It Works

### 1. Page Load Flow

```
index.html loads → main.js initializes
    ↓
App.init() runs
    ↓
Show loading overlay
    ↓
All renderers init in parallel:
  - projectsRenderer.init()
  - awardsRenderer.init()
  - experiencesRenderer.init()
  - leadershipRenderer.init()
  - teamsRenderer.init()
  - navigationRenderer.init()
    ↓
Each renderer:
  1. Calls dataLoader.loadData()
  2. Validates data (empty check)
  3. Sorts by 'order' field
  4. Renders using templates
    ↓
Hide loading overlay
    ↓
Initialize scroll animations
```

### 2. Data Flow Example (Projects)

```json
// data/projects.json
[
  {
    "id": "autonomous-rover-2025",
    "title": "Autonomous Farming Rover",
    "category": "Robotics & Research",
    "year": "2025",
    "thumbnail": "./images/rover2.png",
    "tagline": "ML-powered, with a dedicated mobile app.",
    "featured": true,
    "order": 1,
    ...
  }
]
```

↓ Loaded by data-loader.js ↓

```javascript
// js/modules/projects-renderer.js
this.projects = await dataLoader.loadData('projects');
this.projects = sortBy(this.projects, 'order', 'asc');
this.render();
```

↓ Rendered using template ↓

```javascript
// js/utils/templates.js - projectCardTemplate()
<div class="project-card fade-in" data-project-id="${project.id}">
  <div class="project-img" style="background-image: url('${project.thumbnail}');"></div>
  <div class="project-info">
    <div class="project-category">${project.category} | ${project.year}</div>
    <h3 class="project-title">${project.title}</h3>
    <p>${project.tagline}</p>
    <a href="${project.detailsPage}" class="btn">View Details</a>
  </div>
</div>
```

↓ Inserted into DOM ↓

```html
<!-- Rendered HTML in #projects-grid -->
<div class="project-card fade-in" data-project-id="autonomous-rover-2025">
  <!-- ... -->
</div>
```

## Adding New Content

### Adding a New Project

1. Open `/data/projects.json`
2. Add new object to the array:

```json
{
  "id": "my-new-project",
  "title": "My New Project",
  "category": "Robotics",
  "year": "2025",
  "thumbnail": "./images/my-image.png",
  "tagline": "Short description here",
  "featured": false,
  "tags": ["tag1", "tag2"],
  "detailsPage": "view-details.html?project=my-project",
  "order": 26,
  "visibility": "published",
  "createdAt": "2025-01-15T10:30:00Z",
  "lastModified": "2025-01-15T10:30:00Z"
}
```

3. **Important**: Update `order` field to place it correctly in the list
4. Save the file
5. Refresh the page - it will load automatically!

### Adding a New Award

1. Open `/data/awards.json`
2. Add new award object:

```json
{
  "id": "award-2025-myaward",
  "year": "2025",
  "backgroundImage": "./images/award-image.jpeg",
  "title": "My Award Title",
  "description": "Award description with <b>HTML</b> allowed",
  "link": "https://example.com",
  "external": true,
  "order": 6,
  "visibility": "published",
  "createdAt": "2025-01-20T00:00:00Z",
  "lastModified": "2025-01-20T00:00:00Z"
}
```

Same process - update `order` and refresh!

### Same Pattern for Other Content

- **Leadership**: Edit `/data/leadership.json`
- **Experiences/Skills**: Edit `/data/experiences.json`
- **Teams**: Edit `/data/teams.json`

## JSON Metadata Schema

Every content item includes these fields:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique identifier (kebab-case) |
| `createdAt` | ISO 8601 | Creation timestamp |
| `lastModified` | ISO 8601 | Last update timestamp |
| `visibility` | enum | `published`, `draft`, or `hidden` |
| `order` | integer | Sort order (ascending) |

**Visibility Levels:**
- `published` - Shown on live site
- `draft` - Hidden from live site (for admin panel)
- `hidden` - Archived (for admin panel)

## Error Handling

The system gracefully handles errors:

### Missing JSON File
- Returns empty array `[]`
- Section doesn't render
- No errors in console

### Invalid JSON
- Treated as missing file
- Empty array returned
- Section skips gracefully

### Network Error
- Retries up to 3 times with exponential backoff
- Falls back to empty data if all retries fail

### Empty Data
- Renderers detect `[]` and return early
- No rendering = no content shown
- Logging confirms it handled gracefully

## Development Tips

### Enable Debug Mode

Open browser console:

```javascript
window.portfolioApp.getAppState()
// Returns:
// {
//   initialized: true,
//   projects: 25,
//   awards: 5,
//   leadership: 8,
//   teams: 7,
//   experiences: 7,
//   cacheStats: { ... }
// }
```

### Clear Cache and Reload

```javascript
window.portfolioApp.refreshAll()
```

### Check Console Logs

Development mode (localhost) shows detailed logs:

```
[14:30:45] ℹ️ Initializing projects...
[14:30:45] ℹ️ Fetching data from: /data/projects.json
[14:30:45] ℹ️ Successfully loaded: /data/projects.json
[14:30:45] ℹ️ Projects initialized successfully
```

## Admin Panel Preparation

This JSON structure is ready for an admin panel that can:

1. **Display**: Render JSON as editable tables
2. **Create**: Add new items with auto-generated IDs
3. **Update**: Modify existing items and timestamps
4. **Delete**: Mark as `hidden` or remove from array
5. **Publish**: Change `visibility` status
6. **Validate**: Check required fields

The `id`, `createdAt`, `lastModified`, and `visibility` fields support all admin panel workflows.

## Differences from Original

### Before (Hardcoded HTML)
```html
<div class="project-card">
  <div class="project-img" style="background-image: url('./images/rover2.png');"></div>
  <h3 class="project-title">Autonomous Farming Rover</h3>
  <!-- ... more hardcoded HTML ... -->
</div>
```

**Drawback**: To add a project, you had to edit `index.html`, find the right section, add HTML

### After (JSON-Based)
```json
{
  "id": "autonomous-rover-2025",
  "title": "Autonomous Farming Rover",
  ...
}
```

**Benefit**: To add a project, just add JSON object. No HTML editing needed!

## Files Modified

### New Files
- `DATA_SCHEMA.md` - Comprehensive schema documentation
- `JSON_IMPLEMENTATION.md` - This file

### Updated Files
- `js/main.js` - Better error handling
- `js/modules/data-loader.js` - Graceful fallbacks for missing files
- `js/modules/*-renderer.js` - All 6 renderers now handle empty data gracefully
- `js/legacy/interactions.js` - Removed duplicate code
- `data/*.json` - All JSON files now include metadata fields

### Preserved
- All HTML structure in `index.html` - Unchanged
- All CSS styling - Unchanged
- All interactive features - Working as before

## Testing Checklist

- [ ] Page loads without errors
- [ ] All sections render correctly (projects, awards, leadership, teams, experiences)
- [ ] "Load More" projects button works
- [ ] Mobile menu toggles correctly
- [ ] Smooth scrolling works
- [ ] Back to top button appears/disappears
- [ ] Featured cards carousel auto-scrolls
- [ ] Fade-in animations work on scroll
- [ ] Console has no errors (dev mode logs are OK)
- [ ] Page works offline (cached data)

## Next Steps

1. **Test everything** - Verify all sections load correctly
2. **Add metadata** - Consider adding author, tags, categories to other data types
3. **Admin Panel** - Build the admin UI to edit these JSON files
4. **API Backend** - Optional: create a backend API to persist changes
5. **Versioning** - Consider git-based versioning or database

## Questions?

Refer to:
- `DATA_SCHEMA.md` - Full schema documentation
- `js/config.js` - All configuration and selectors
- `js/modules/data-loader.js` - Data fetching logic
- Individual renderer files for implementation patterns
