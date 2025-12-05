# Blogs Admin Panel Implementation - Complete

## What Was Implemented

### 1. Auto-Discovery of Blog Posts from Markdown Files
- The admin panel now automatically scans for markdown files matching the pattern `project-*.md` in `/data/blogs/posts/`
- Extracted files: project-cherapace.md, project-example.md, project-ftc2425.md, project-ftcworlds.md, project-gamedev.md, project-natech.md, project-robot.md, project-rocket.md, project-rover.md
- Each markdown file must have frontmatter (YAML between `---` markers) with metadata
- Only markdown files matching `project-*.md` pattern are included in the blogs table

### 2. Auto-Parsing of Markdown Frontmatter
The admin manager extracts the following from markdown frontmatter:
- `title`: Blog post title
- `date`: Publication date (YYYY-MM-DD)
- `category`: Blog category
- `tags`: Tags array
- `author`: Author name (defaults to "Gema Sagara")
- `media` (or `thumbnail`): Featured image
- `tagline` (or `excerpt`): Short excerpt
- `link` (or `externalLink`): External link to related content
- `readTime`: Automatically calculated from word count (200 words/minute)

### 3. Blogs Management Page in Admin Panel
- New "Blogs" navigation item in admin sidebar
- Blog list table showing: ID, Title, Category, Author, Featured, Published
- Add New Blog button (creates new markdown-based blog)
- Edit/Delete functionality for each blog
- Full CRUD operations stored in localStorage

### 4. Linking Blogs to Projects and Awards
Projects and Awards now have:
- **linkedBlog** field: Dropdown to select which blog post to show when clicked
- **externalLink** field: URL to external content (Instagram, news outlets, etc.)
- These fields appear in edit forms when creating or modifying projects/awards

### 5. Backward Compatibility
- If `/data/blogs/metadata.json` exists, its data is merged with auto-discovered blogs
- Manual metadata overrides auto-discovered values
- Only metadata entries matching auto-discovered markdown files are preserved

## Markdown File Format

Example frontmatter:
```yaml
---
title: International Robotics Competition Entry
date: 2025-03-15
category: Robotics
media: /images/robot-competition-main.jpg
gallery_1: /images/robot-design-process.jpg
gallery_2: /images/robot-testing-phase.jpg
tagline: Building an autonomous robot that navigated complex obstacle courses...
link: ../resources/SCN_W8.pdf
---

## Your Markdown Content Here
...
```

## Files Modified

1. **js/modules/admin-manager.js**
   - Added `discoverBlogsFromMarkdown()` method
   - Added `parseMarkdownFrontmatter()` method
   - Added `parseYAML()` method for YAML parsing
   - Added `estimateReadTime()` method
   - Updated `loadData()` to use auto-discovery
   - Updated `getStats()` to include blogs count

2. **js/modules/admin-ui.js**
   - Added blogs stats card to dashboard
   - Added blogs table headers
   - Added blogs form schema with all fields
   - Added blogs empty template
   - Added `linkedBlog` and `externalLink` fields to projects schema
   - Added `linkedBlog` and `externalLink` fields to awards schema
   - Added `getBlogOptions()` method to generate dropdown options

3. **admin.html**
   - Added "Blogs" navigation item to sidebar
   - Updated `openSection()` method to handle blogs generically
   - Updated JSON parsing in `saveItem()` to handle blog fields

4. **TODO.md**
   - Marked task as complete with subtasks listed

## How to Use

### Creating a New Blog
1. Create a markdown file named `project-*.md` in `/data/blogs/posts/`
2. Add YAML frontmatter with required fields (title, date, category, etc.)
3. The blog will auto-appear in the admin panel on next refresh
4. Edit via admin panel to adjust metadata and set featured/published status

### Linking Blogs to Projects/Awards
1. Open Projects or Awards section in admin panel
2. Edit a project or award
3. Select from "Linked Blog Post ID" dropdown to associate a blog
4. Add external link if needed (Instagram, news outlet, etc.)
5. Save changes

### Removing Blogs
- Only markdown files with `project-*.md` pattern are included
- Delete the markdown file from `/data/blogs/posts/` to remove from blogs table
- Files with other naming patterns are automatically excluded

## Data Structure

Each blog object now contains:
```javascript
{
  id: "project-rover",                    // from filename
  title: "String",
  date: "2025-03-15",
  category: "String",
  tags: ["Array", "of", "tags"],
  author: "String",
  thumbnail: "URL or base64 image",
  excerpt: "String",
  readTime: "X min read",
  featured: boolean,
  published: boolean,
  markdownFile: "posts/project-rover.md",
  externalLink: "Optional URL"
}
```

Projects/Awards now also contain:
```javascript
{
  ...existing fields...
  linkedBlog: "project-id-or-empty-string",
  externalLink: "Optional URL"
}
```

## Notes
- Blog discovery is automatic on admin panel load
- Changes made in admin panel are saved to localStorage
- Markdown files are read-only through the admin UI
- To edit markdown content, edit the file directly in your editor
- The metadata.json file is now optional and only used for overrides
