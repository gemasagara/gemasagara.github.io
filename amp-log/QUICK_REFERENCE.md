# LinkedBlog Feature - Quick Reference

## What Changed

### Admin Panel
- ✅ New "Blogs" section with auto-discovery
- ✅ Projects: `detailsPage` → `linkedBlog` dropdown
- ✅ Awards: `link` → `linkedBlog` dropdown
- ✅ New `externalLink` field for both

### Portfolio Site
- ✅ Project cards use linkedBlog for navigation
- ✅ Award cards use linkedBlog for navigation
- ✅ Automatic migration from old format
- ✅ View-Details page loads blog markdown

---

## Creating a Blog Post

```markdown
<!-- /data/blogs/posts/project-name.md -->
---
title: "Project Title"
date: 2025-03-15
category: "Robotics"
media: "/images/thumbnail.jpg"
tagline: "Short description"
link: "https://instagram.com/..."
author: "Name"
featured: true
published: true
---

# Your Markdown Content Here

## Section 1
Content...

## Section 2
Content...
```

Save file → Admin panel auto-discovers it → Can link projects/awards to it

---

## Admin Panel Usage

### Link a Project to a Blog
```
Projects → Edit Project → Linked Blog Post ID → Select blog → Update
```

### Link an Award to a Blog
```
Awards → Edit Award → Linked Blog Post ID → Select blog → Update
```

### Add External Link (Optional)
```
Projects/Awards → External Link field → Enter URL (Instagram, news, etc.)
```

---

## Data Structure

### Blog (Auto-discovered from markdown)
```javascript
{
  id: "project-rover",
  title: "Project Name",
  date: "2025-03-15",
  category: "Category",
  thumbnail: "/images/pic.jpg",
  excerpt: "Description",
  readTime: "5 min read",
  featured: true,
  published: true
}
```

### Project/Award (With linkedBlog)
```javascript
{
  id: "project-id",
  title: "Title",
  linkedBlog: "project-rover",    // Links to blog
  externalLink: "https://...",    // Optional external link
  // ... other fields
}
```

---

## How It Works

```
1. User edits project in admin
   ↓
2. Selects blog from linkedBlog dropdown
   ↓
3. Data saved to localStorage
   ↓
4. Portfolio site loads projects
   ↓
5. Data loader auto-migrates if needed
   ↓
6. Template generates: view-details.html?project=blog-id
   ↓
7. User clicks "View Details"
   ↓
8. Page fetches: /data/blogs/posts/blog-id.md
   ↓
9. Blog content renders
```

---

## Files Modified

| File | Change |
|------|--------|
| `js/modules/admin-manager.js` | Added blog discovery & migration |
| `js/modules/admin-ui.js` | Added linkedBlog field |
| `admin.html` | Fixed file upload handling |
| `js/modules/data-loader.js` | Added migration logic |
| `js/utils/templates.js` | Updated project/award templates |

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Blog not in dropdown | Check filename: `project-*.md` |
| Thumbnail is Object | Already fixed in saveItem() |
| Undefined URL | Ensure linkedBlog is set |
| Page blank | Check markdown file exists |
| No image on portfolio | Check thumbnail path in frontmatter |

---

## Console Check

Expected output when working correctly:
```
✅ Discovered 9 blog posts
✅ Migrated project X: linkedBlog = project-Y
```

---

## Backward Compatibility

- ✅ Old projects still work
- ✅ Old awards still work
- ✅ Automatic migration on load
- ✅ No data loss

---

## Key Features

| Feature | Status |
|---------|--------|
| Auto-discover blogs | ✅ |
| CRUD blogs in admin | ✅ |
| Link projects to blogs | ✅ |
| Link awards to blogs | ✅ |
| Automatic migration | ✅ |
| External links support | ✅ |
| Empty file support | ✅ |
| Deduplication | ✅ |

---

## Testing

Run these checks:
- [ ] Blog appears in admin dropdown
- [ ] Project links to blog, saves correctly
- [ ] Portfolio shows correct image
- [ ] "View Details" navigates to blog
- [ ] Blog page loads and displays markdown
- [ ] Works for awards too

All systems go! 🚀
