# Blog Management System Guide

Complete guide for managing blog posts in the portfolio admin panel.

## Overview

The blog management system allows you to:
- Create new blog posts with a form and markdown editor
- Edit existing blog posts and their markdown content
- Automatically generate markdown files from form data
- Auto-calculate read time based on content length
- Manage blog metadata (title, date, category, tags, etc.)

## Setup

### 1. Install Dependencies

```bash
npm install
# If you need the server for saving markdown files:
npm install --save express
```

### 2. Start the Server (Optional but Recommended)

The server is needed to save markdown files to disk. Without it, markdown is stored in localStorage only.

```bash
npm start
# Or for development with auto-reload:
npm run dev
```

The admin panel will be available at `http://localhost:3000/admin.html`

## Creating a New Blog Post

1. Go to Admin Panel → Blogs section
2. Click "Add New" button
3. Fill out the form fields:
   - **ID**: Unique identifier (used for filename, e.g., `my-first-blog`)
   - **Title**: Blog post title
   - **Date**: Publication date (YYYY-MM-DD format)
   - **Category**: Blog category (e.g., "Robotics", "Development")
   - **Tags**: Comma-separated tags or JSON array
   - **Author**: Author name (defaults to "Gema Sagara")
   - **Thumbnail Image**: Featured image for the blog
   - **Excerpt**: Short summary of the blog post
   - **Featured**: Check to mark as featured
   - **Published**: Check to publish (uncheck for draft)
   - **Blog Content (Markdown)**: Write your blog content here

4. Use the markdown editor toolbar for:
   - **Bold/Italic**: Text formatting
   - **Heading**: Create headers (H1, H2, H3)
   - **Quote**: Add blockquotes
   - **Lists**: Create ordered/unordered lists
   - **Links/Images**: Add links and images
   - **Table**: Insert tables
   - **Preview**: See formatted output
   - **Side-by-side**: View markdown and preview together
   - **Fullscreen**: Edit in fullscreen mode

5. Click "Create" to save

### System Behavior When Creating:

- **Filename**: Automatically set to `posts/{id}.md`
- **Read Time**: Auto-calculated from word count (200 words/minute)
- **Metadata**: Stored in `data/blogs/metadata.json`
- **Markdown File**: Saved to `data/blogs/posts/{id}.md` (via server or localStorage)

## Editing an Existing Blog Post

1. Go to Admin Panel → Blogs section
2. Click "Edit" on the blog post you want to modify
3. Update any fields:
   - Form fields update metadata
   - Markdown editor updates the content
4. Click "Update" to save

### System Behavior When Editing:

- **Frontmatter**: Automatically updated with form data
- **Content**: Updated from the markdown editor
- **Read Time**: Recalculated if content changes
- **File**: Overwrites existing markdown file

## Markdown Format Reference

### Headers
```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Text Formatting
```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
```

### Lists
```markdown
- Item 1
- Item 2
  - Nested item

1. First
2. Second
3. Third
```

### Links and Images
```markdown
[Link text](https://example.com)
![Alt text](image-url.jpg)
```

### Code Blocks
```markdown
```javascript
const code = "example";
```
```

### Blockquotes
```markdown
> This is a quote
> It can span multiple lines
```

### Tables
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

## File Structure

```
Portfolio/
├── data/
│   └── blogs/
│       ├── posts/
│       │   ├── my-first-blog.md
│       │   ├── project-robot.md
│       │   └── ... (other blog files)
│       └── metadata.json
├── admin.html
├── server.js
└── js/
    └── modules/
        ├── admin-manager.js
        ├── admin-ui.js
        ├── blog-manager.js
        ├── blog-api.js
        └── ... (other modules)
```

## Markdown File Format

Each markdown file has frontmatter (metadata) followed by content:

```markdown
---
title: My Blog Post
date: 2024-12-15
category: Development
media: /images/thumbnail.jpg
tags: [javascript, web development]
author: Gema Sagara
tagline: A short excerpt about this post
featured: true
published: true
link: https://external-link.com
---

## Content starts here

Your blog content in markdown format...
```

### Frontmatter Fields:
- **title**: Blog post title
- **date**: Publication date (YYYY-MM-DD)
- **category**: Blog category
- **media**: Featured image URL
- **tags**: Array of tags
- **author**: Author name
- **tagline**: Short excerpt (shown as "excerpt" in admin)
- **featured**: Boolean - is this a featured post
- **published**: Boolean - is this published
- **link**: External link (optional)

## Data Storage

### localStorage

When the server is not available, blog markdown data is stored in localStorage with keys like:
```
blog_markdown_{id}
```

This contains the complete blog data including metadata and content.

### Server Storage

When the server is running, markdown files are saved to:
- **Directory**: `data/blogs/posts/`
- **Filename**: `{id}.md`
- **Metadata**: Also updated in `data/blogs/metadata.json`

## Syncing Data

### From localStorage to Server

If you've been working without a server and want to migrate to using one:

1. Start the server
2. Go to each blog in the admin panel
3. Click "Edit"
4. Click "Update" - this will save the markdown to the server
5. The localStorage copy will be kept as backup

### Automatic Read Time Calculation

Read time is automatically calculated when:
- Creating a new blog post
- Updating a blog post with new content

Formula: `Math.ceil(word_count / 200) + " min read"`

## Troubleshooting

### Server is not saving files

1. Make sure Node.js is installed
2. Run `npm install` to install Express
3. Start the server: `npm start`
4. Check the terminal for error messages
5. Verify the `data/blogs/posts/` directory exists

### Markdown content not appearing in preview

1. Check that the markdown syntax is correct
2. Use the "Preview" button in the editor
3. Click "Side-by-side" to see markdown and preview together

### Images not displaying

1. Make sure the image path is correct (relative or absolute URL)
2. Use the "Image" button in the markdown editor toolbar
3. The image must be accessible at that URL

### Tags not saving properly

1. You can use comma-separated values: `tag1, tag2, tag3`
2. Or JSON array format: `["tag1", "tag2", "tag3"]`
3. Both formats are automatically converted to arrays

## Best Practices

1. **Use consistent date format**: YYYY-MM-DD (e.g., 2024-12-15)
2. **Use kebab-case for IDs**: my-blog-post (lowercase with hyphens)
3. **Write descriptive excerpts**: Should be 50-150 characters
4. **Tag your posts**: Makes them easier to find and organize
5. **Mark featured posts**: Important posts should be marked as featured
6. **Preview before publishing**: Use the Preview button to check formatting
7. **Use meaningful headers**: H2 and H3 for content structure
8. **Add alt text to images**: `![description](image-url.jpg)`

## API Endpoints (Server)

If you're running the server, these endpoints are available:

### Save Blog Markdown
```
POST /api/blogs/save-markdown
Content-Type: application/json

{
  "blogId": "my-blog",
  "title": "My Blog",
  "date": "2024-12-15",
  "category": "Development",
  "author": "Gema Sagara",
  "tags": ["tag1", "tag2"],
  "thumbnail": "/images/thumb.jpg",
  "excerpt": "Short excerpt",
  "featured": true,
  "published": true,
  "externalLink": "https://...",
  "markdownFile": "posts/my-blog.md",
  "content": "# Markdown content..."
}
```

### Load Blog Markdown
```
GET /api/blogs/{blogId}/markdown
```

Returns the full markdown content (with frontmatter)

### Get Blog Metadata
```
GET /api/blogs/metadata
```

Returns array of all blog metadata from metadata.json

### Delete Blog
```
DELETE /api/blogs/{blogId}
```

Deletes the markdown file and removes from metadata

### Health Check
```
GET /api/health
```

Returns server status

## Export/Backup

To backup your blog posts:

1. The `data/blogs/posts/` directory contains all markdown files
2. The `data/blogs/metadata.json` contains all metadata
3. localStorage stores blog data if you haven't synced to server

Simply copy these files/directories to backup them.

## Next Steps

- Customize the admin panel CSS in `css/admin.css`
- Add additional metadata fields by editing schemas in `admin-ui.js`
- Set up the server on a hosting platform (Heroku, Vercel, etc.)
- Integrate with a blog display system on your main site
