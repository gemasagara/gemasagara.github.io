# Quick Restart & Test Guide

After fixing the form and editor issues, use this guide to verify everything works.

## Quick Restart (Copy & Paste)

```bash
# 1. Kill the running server
# Press Ctrl+C in the terminal running "npm start"

# 2. Start server fresh
cd ~/Programming/Portfolio
npm start

# Server output should show:
# ✅ Admin Manager initialized
# ╔════════════════════════════════════════╗
# ║  Portfolio Admin Server                ║
# ║  Running on http://localhost:3000      ║
# ╚════════════════════════════════════════╝

# 3. In browser, open:
http://localhost:3000/admin.html

# 4. Hard refresh cache:
Ctrl+Shift+R  (or Cmd+Shift+R on Mac)

# Done! Admin panel should now work correctly
```

## Test 1: Edit Form Shows Data ✅

**What to test**: When you click "Edit", the form should pre-fill with existing data.

**Steps**:
1. Open admin panel: `http://localhost:3000/admin.html`
2. Click "Projects" (or any section in sidebar)
3. You should see a table with project data
4. Click the **Edit** button on any row

**Expected Result**:
- ✅ Form modal opens
- ✅ All fields are filled with current data (ID, Title, Category, Year, etc.)
- ✅ No empty fields
- ✅ Data matches what was shown in the table

**If you see empty forms**: 
- Check browser console (F12) for errors
- Hard refresh: Ctrl+Shift+R
- Restart server: Ctrl+C then `npm start`

---

## Test 2: Markdown Editor Shows WYSIWYG ✅

**What to test**: When editing/creating blogs, the markdown editor should have a toolbar.

**Steps**:
1. Click **Blogs** in sidebar
2. Click **Add New** (or Edit on existing blog)
3. Scroll down to **Blog Content (Markdown)** section

**Expected Result**:
- ✅ Textarea displays with formatting toolbar above it
- ✅ Toolbar has buttons: **B** (bold), *I* (italic), **H** (heading), etc.
- ✅ Toolbar has: Quote, Lists, Links, Images, Table icons
- ✅ Preview/Side-by-side/Fullscreen buttons on right
- ✅ When editing existing blog, markdown content is pre-filled

**If you see empty textarea without toolbar**:
- Check Network tab (F12 → Network):
  - Look for `easymde.min.css` and `easymde.min.js`
  - Both should have status `200` (not 404 or red)
- If they show 404: CDN issue, try reloading
- If loaded but no toolbar: Check console for JS errors
- Hard refresh and try again

---

## Test 3: Create a Blog ✅

**What to test**: Can you create a blog and see the markdown editor working?

**Steps**:
1. Click **Blogs** → **Add New**
2. Fill the form:
   ```
   ID:          test-blog
   Title:       My Test Blog
   Date:        2024-12-15
   Category:    Testing
   Tags:        test, markdown
   Author:      Your Name
   Excerpt:     This is a test blog post
   Featured:    ☑ (checked)
   Published:   ☑ (checked)
   ```
3. In **Blog Content (Markdown)**, write:
   ```markdown
   # My Test Blog

   This is a test blog post.

   ## Features

   - Feature 1
   - Feature 2
   - Feature 3

   ## Conclusion

   Testing the markdown editor.
   ```
4. Click **Create** button

**Expected Result**:
- ✅ Form submits successfully
- ✅ See alert: "✅ Item created successfully!"
- ✅ Modal closes
- ✅ New blog appears in the Blogs table
- ✅ File created at: `data/blogs/posts/test-blog.md`

**To verify file was created**:
```bash
# In a new terminal (keep server running)
cat ~/Programming/Portfolio/data/blogs/posts/test-blog.md

# You should see the YAML frontmatter and your markdown content
```

---

## Test 4: Edit the Blog ✅

**What to test**: Can you edit the blog you just created?

**Steps**:
1. Still in **Blogs** section
2. Find "test-blog" in the table (might need to scroll)
3. Click **Edit** button

**Expected Result**:
- ✅ Form opens with all data pre-filled
- ✅ Blog content shows in markdown editor
- ✅ Can modify title or content
- ✅ Markdown editor shows toolbar
- ✅ Click **Update** and it saves

---

## Verification Checklist

Go through each item and check them off:

### Server
- [ ] Server starts without errors
- [ ] Shows "✅ Admin Manager initialized"
- [ ] Shows port 3000 message
- [ ] Listens on http://localhost:3000

### Admin Panel
- [ ] Opens at http://localhost:3000/admin.html
- [ ] Sidebar visible with all sections
- [ ] Can navigate between sections
- [ ] Tables show data for each section
- [ ] No blank/empty page

### Edit Forms
- [ ] Click Edit on any row
- [ ] Form opens with data pre-filled
- [ ] No empty fields
- [ ] All data matches what's in table
- [ ] Can modify and save

### Blog Creation
- [ ] Go to Blogs section
- [ ] Click "Add New"
- [ ] Form displays completely
- [ ] Markdown editor shows toolbar
- [ ] Can type in editor
- [ ] Can see bold/italic buttons
- [ ] Can use preview mode

### Blog Markdown Editor
- [ ] Editor has WYSIWYG toolbar
- [ ] Can click Bold, Italic, Heading buttons
- [ ] Can create lists and quotes
- [ ] Can add links and images
- [ ] Preview button works
- [ ] Side-by-side view works
- [ ] Fullscreen mode works

### Data Saving
- [ ] Create blog: See success message
- [ ] Edit blog: See success message
- [ ] File created: Check `data/blogs/posts/`
- [ ] Metadata updated: Check `data/blogs/metadata.json`
- [ ] localStorage has blog data

### Browser Console (F12)
- [ ] No "process is not defined" error
- [ ] Shows "BlogAPI initialized with baseUrl..."
- [ ] Shows "✅ EasyMDE initialized successfully"
- [ ] No other red errors

---

## Common Issues & Quick Fixes

### Issue: Forms Still Show Empty
```bash
# Solution 1: Hard refresh
Ctrl+Shift+R (or Cmd+Shift+R on Mac)

# Solution 2: Restart server
Ctrl+C                    # Stop server
npm start                 # Start again
```

### Issue: Markdown Editor Not Showing
```bash
# Solution 1: Check CDN loaded
# F12 → Network tab → Search for "easymde"
# Should see both .css and .js with status 200

# Solution 2: Clear cache
Ctrl+Shift+Delete
Select "All time"
Clear all
Refresh page

# Solution 3: Restart
Ctrl+C
npm start
```

### Issue: WebSocket Error About ws://127.0.0.1:3001
- **This is NOT our problem** - it's VS Code's Live Preview
- You can safely ignore it
- Our server works fine at http://localhost:3000
- To fix: Disable VS Code's Live Preview extension

### Issue: "NetworkError when attempting to fetch"
```bash
# Make sure:
# 1. Server is running (check terminal)
# 2. Using http://localhost:3000 (not 127.0.0.1)
# 3. Port 3000 is not used by something else

lsof -i :3000              # Check what's using port 3000
PORT=3001 npm start        # Use different port if needed
```

---

## Success Indicators

When everything is fixed and working, you'll see:

**Server Terminal**:
```
✅ Admin Manager initialized
Discovered 2 blog posts
```

**Browser Console (F12)**:
```
BlogAPI initialized with baseUrl: http://localhost:3000/api
✅ Admin Manager initialized
✅ EasyMDE initialized successfully
```

**Admin Panel**:
- Fully loaded with content
- Sidebar navigation works
- Tables show data
- Edit forms pre-fill
- Markdown editor has toolbar
- Can create and edit blogs

---

## If Everything Still Doesn't Work

**Complete Nuclear Reset**:

```bash
# 1. Stop server (Ctrl+C)

# 2. Remove everything
cd ~/Programming/Portfolio
rm -rf node_modules
rm package-lock.json

# 3. Fresh install
npm install
npm install --save express

# 4. Start fresh
npm start

# 5. In browser:
# - Clear cache: Ctrl+Shift+Delete
# - Go to: http://localhost:3000/admin.html
# - Refresh hard: Ctrl+Shift+R
```

If that still doesn't work:

1. Check browser console (F12 → Console tab) - what errors?
2. Check server terminal - what errors?
3. Look at specific error messages
4. Search FIXES_FORM_EDITOR.md for that error

---

## Next Steps

Once everything is working:

1. ✅ Create a few test blogs
2. ✅ Edit them to make sure editing works
3. ✅ Check the generated markdown files
4. ✅ Read BLOG_MANAGEMENT_GUIDE.md for full features
5. ✅ Start creating real blog posts!

---

**You're almost there!** This guide should get everything working properly. 🚀

