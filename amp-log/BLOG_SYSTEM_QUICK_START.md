# Blog System - Quick Start Guide

Get the blog management system up and running in minutes.

## Option 1: Use With Server (Recommended)

### Setup (First Time Only)

```bash
# Navigate to project directory
cd ~/Programming/Portfolio

# Install dependencies
npm install

# Install Express for server
npm install --save express
```

### Run Server

```bash
# Start the server
npm start

# Server will output:
# ╔════════════════════════════════════════╗
# ║  Portfolio Admin Server                ║
# ║  Running on http://localhost:3000      ║
# ║  Admin panel: http://localhost:3000/admin.html ║
# ╚════════════════════════════════════════╝
```

### Access Admin Panel

Open in browser: **http://localhost:3000/admin.html**

### Create Your First Blog

1. Click **Blogs** in sidebar
2. Click **Add New**
3. Fill form:
   - **ID**: `my-first-blog`
   - **Title**: `My First Blog Post`
   - **Date**: `2024-12-15`
   - **Category**: `Development`
   - **Tags**: `blog, first-post`
   - **Author**: `Your Name`
   - **Excerpt**: `This is my first blog post`
   - **Featured**: ☑ (checked)
   - **Published**: ☑ (checked)
4. In **Blog Content** section, write your markdown:
   ```markdown
   ## Introduction
   
   This is my first blog post!
   
   ## Key Points
   
   - Point 1
   - Point 2
   - Point 3
   ```
5. Click **Create**

### Check Generated File

The markdown file was created at:
```
data/blogs/posts/my-first-blog.md
```

Content will look like:
```markdown
---
title: My First Blog Post
date: 2024-12-15
category: Development
tags: [blog, first-post]
author: Your Name
tagline: This is my first blog post
featured: true
published: true
---

## Introduction

This is my first blog post!

## Key Points

- Point 1
- Point 2
- Point 3
```

## Option 2: Use Without Server (Quick Test)

No server setup needed, but markdown won't be saved to files.

1. Open **admin.html** directly in browser (or serve with any static server)
2. Go to **Blogs** section
3. Create/edit blogs as normal
4. Data saved in browser localStorage
5. Works until you clear browser data

## Common Tasks

### Edit a Blog

1. Go to **Blogs** section
2. Click **Edit** on desired blog
3. Modify form fields or markdown content
4. Click **Update**

### Add an Image to Blog

In the **Blog Content** markdown editor:

```markdown
![Image Description](/images/my-image.jpg)
```

Or use the toolbar:
- Click the **image icon** in editor
- Paste image URL

### Format Text in Markdown

Use the toolbar or type:

```markdown
**Bold text** - use **double asterisks**
*Italic text* - use *single asterisks*
# Heading 1 - use # symbol
## Heading 2 - use ## symbols
```

### Create a List

```markdown
- Item 1
- Item 2
  - Sub-item
- Item 3

OR

1. First
2. Second
3. Third
```

### Add Code Block

Use triple backticks with language:

````markdown
```javascript
const blog = "example";
console.log(blog);
```
````

### Preview Your Content

In the markdown editor:
- Click **Preview** button to see formatted output
- Click **Side-by-side** to see markdown + preview together
- Click **Fullscreen** for larger workspace

## File Structure Created

After creating blogs, you'll have:

```
Portfolio/
├── data/
│   └── blogs/
│       ├── posts/
│       │   ├── my-first-blog.md        ← Your blog file
│       │   ├── project-robot.md        ← Existing blogs
│       │   └── ...
│       └── metadata.json               ← Blog metadata
├── admin.html                          ← Access here
├── server.js                           ← Run with npm start
└── ...
```

## Troubleshooting

### "Cannot find module 'express'"
```bash
npm install --save express
npm start
```

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill process if needed
kill -9 <PID>
# Then try again
npm start
```

### Markdown editor not showing
- Check browser console for errors
- Verify you're on a blog form (not other content types)
- Try refreshing the page
- Check internet connection (loads from CDN)

### Files not saving
1. Verify server is running: `npm start` in terminal
2. Check server output for errors
3. Try creating a new blog
4. If still fails, use localStorage option

### Can't access http://localhost:3000
- Verify server is running (check terminal output)
- Try `http://127.0.0.1:3000` instead
- Check firewall isn't blocking port 3000
- Try a different port: `PORT=3001 npm start`

## Keyboard Shortcuts (in Markdown Editor)

- **Ctrl/Cmd + B** - Bold
- **Ctrl/Cmd + I** - Italic
- **Ctrl/Cmd + Alt + C** - Code
- **Ctrl/Cmd + P** - Toggle preview

## Tips & Tricks

1. **Draft Blog**: Create blog, uncheck "Published" checkbox
2. **Calculate Read Time**: Auto-calculated (200 words/min), but you can edit manually
3. **Multiple Tags**: Use comma-separated values: `tag1, tag2, tag3`
4. **Featured Posts**: Mark important blogs with the "Featured" checkbox
5. **External Links**: Add optional link to external resource
6. **Date Format**: Always use YYYY-MM-DD format
7. **Unique IDs**: Use lowercase, hyphens only: `my-blog-post`
8. **Save Drafts**: Use Preview button frequently while writing

## Next Steps

1. ✅ Create your first blog post
2. Edit a blog to make sure editing works
3. Check the generated markdown file
4. Copy blog structure to other sections (if needed)
5. Customize admin panel CSS in `css/admin.css`
6. Deploy server to hosting (Heroku, Railway, etc.)

## Full Documentation

For complete details, see:
- **BLOG_MANAGEMENT_GUIDE.md** - Complete user guide
- **BLOG_SYSTEM_IMPLEMENTATION.md** - Technical details

## Need Help?

1. Check browser console for errors: **F12 → Console tab**
2. Check server terminal for output
3. Look at generated markdown file to verify content
4. Verify directory structure matches expected layout

---

**That's it!** Your blog system is ready to use. 🚀

