# Blog System Workflow Diagrams

Visual representation of how the blog management system works.

## Creating a New Blog

```
┌──────────────────┐
│   User opens     │
│  admin.html      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Navigate to              │
│ Blogs → Add New          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│         Blog Creation Form Displays                  │
│ ┌────────────────────────────────────────────────┐  │
│ │ ID:          [my-first-blog]                  │  │
│ │ Title:       [Blog Title]                     │  │
│ │ Date:        [2024-12-15]                     │  │
│ │ Category:    [Development]                    │  │
│ │ Tags:        [tag1, tag2]                     │  │
│ │ Author:      [Gema Sagara]                    │  │
│ │ Thumbnail:   [Choose Image]                   │  │
│ │ Excerpt:     [Short summary]                  │  │
│ │ Featured:    [☑ Checked]                      │  │
│ │ Published:   [☑ Checked]                      │  │
│ │                                               │  │
│ │ Blog Content (Markdown):                      │  │
│ │ ┌──────────────────────────────────────────┐ │  │
│ │ │ [B] [I] [Heading] ... [Preview]          │ │  │
│ │ │                                           │ │  │
│ │ │ # Your blog content here                │ │  │
│ │ │                                           │ │  │
│ │ │ Use markdown to format your post...      │ │  │
│ │ │                                           │ │  │
│ │ └──────────────────────────────────────────┘ │  │
│ │                                               │  │
│ │ [Create]  [Cancel]                           │  │
│ └────────────────────────────────────────────────┘  │
└────────┬──────────────────────────────────────────┘
         │ User fills form and writes markdown content
         │
         ▼
┌──────────────────────────────────────────────────┐
│        User clicks "Create" button               │
└────────┬───────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│  admin.html saveItem() method is triggered              │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 1. Extract form data                            │   │
│  │ 2. Extract markdown content separately          │   │
│  │ 3. Generate filename: {id}.md                   │   │
│  │ 4. Parse tags (CSV → array)                     │   │
│  │ 5. Calculate read time (word count / 200)       │   │
│  │ 6. Prepare blog data object                     │   │
│  │ 7. Call BlogAPI.saveBlogMarkdown()              │   │
│  └──────────────────────────────────────────────────┘   │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
        ╱┴╲ Is server running?
       ╱   ╲
      ╱     ╲
    YES      NO
    ║        ║
    ▼        ▼
 ┌──────┐  ┌─────────────────────┐
 │POST  │  │ Save to localStorage│
 │API   │  │ browser_markdown_{} │
 │      │  │ Show warning in     │
 │      │  │ console             │
 └───┬──┘  └────────┬────────────┘
     │               │
     │               ▼
     │          ┌──────────────────┐
     │          │ Data saved to    │
     │          │ browser memory   │
     │          └────────┬─────────┘
     │                   │
     ▼                   ▼
┌──────────────────────────────────────────────────────┐
│  Server (server.js) receives POST request           │
│  ┌──────────────────────────────────────────────┐   │
│  │ /api/blogs/save-markdown                    │   │
│  │                                             │   │
│  │ 1. Validate request data                    │   │
│  │ 2. Create YAML frontmatter:                 │   │
│  │    ---                                      │   │
│  │    title: Blog Title                        │   │
│  │    date: 2024-12-15                         │   │
│  │    category: Development                    │   │
│  │    tags: [tag1, tag2]                       │   │
│  │    ...                                      │   │
│  │    ---                                      │   │
│  │                                             │   │
│  │ 3. Combine frontmatter + content            │   │
│  │ 4. Write to file:                           │   │
│  │    data/blogs/posts/my-first-blog.md        │   │
│  │ 5. Update metadata.json with new blog       │   │
│  │ 6. Return success response                  │   │
│  └──────────────────────────────────────────────┘   │
└──────────┬───────────────────────────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Success response │
    │ returned to      │
    │ admin.html       │
    └────────┬─────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Show success alert:     │
    │ "✅ Item created!"      │
    │                         │
    │ Close form modal        │
    │                         │
    │ Refresh blogs table     │
    │                         │
    │ New blog appears!       │
    └─────────────────────────┘
```

## Editing an Existing Blog

```
┌──────────────────────┐
│  User sees blogs     │
│  table with Edit     │
│  buttons             │
└────────┬─────────────┘
         │
         ▼
┌────────────────────────┐
│ User clicks "Edit"     │
│ button on a blog       │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│  admin.html showEditForm() is async        │
│  For blogs type:                           │
│  1. Call BlogAPI.loadBlogMarkdown(id)      │
│  2. Wait for server response               │
│  3. Store content in item.markdownContent  │
│  4. Render form with markdown pre-filled   │
└────────┬─────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────┐
│ Server returns markdown file content       │
│ (with frontmatter + content)               │
└────────┬────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  admin.html AdminUI extracts:             │
│  - Frontmatter (metadata)                 │
│  - Content (markdown)                     │
│                                           │
│  Fill form fields with metadata:          │
│  ID, Title, Date, Category, Tags, etc.    │
│                                           │
│  Pre-fill markdown editor with content    │
└────────┬─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  Edit Form Displays (Populated)                │
│  ┌──────────────────────────────────────────┐  │
│  │ ID:     [my-first-blog]  ← Pre-filled    │  │
│  │ Title:  [Blog Title]     ← Pre-filled    │  │
│  │ Date:   [2024-12-15]     ← Pre-filled    │  │
│  │ ...                                      │  │
│  │                                          │  │
│  │ Blog Content (Markdown):                 │  │
│  │ ┌────────────────────────────────────┐  │  │
│  │ │ # Your existing content here      │  │  │
│  │ │                                    │  │  │
│  │ │ With all the markdown you wrote   │  │  │
│  │ │ before...                         │  │  │
│  │ └────────────────────────────────────┘  │  │
│  │                                          │  │
│  │ [Update] [Cancel]                       │  │
│  └──────────────────────────────────────────┘  │
└────────┬──────────────────────────────────────┘
         │
         ▼
      ┌──────────────────────────────────┐
      │ User modifies:                   │
      │ - Form fields (title, date, etc)│
      │ - Markdown content              │
      │ - Can preview changes           │
      └───────────┬──────────────────────┘
                  │
                  ▼
      ┌──────────────────────────┐
      │ User clicks "Update"     │
      └───────────┬──────────────┘
                  │
                  ▼
      ┌────────────────────────────────────────────┐
      │ saveItem() updates both:                   │
      │ 1. Metadata (title, date, category, etc)   │
      │ 2. Markdown file (new content)             │
      │ 3. Read time recalculated                  │
      │ 4. Calls BlogAPI.saveBlogMarkdown()        │
      └────────────┬─────────────────────────────┘
                   │
                   ▼
      ┌──────────────────────────────────────┐
      │ Server updates:                      │
      │ - Overwrites markdown file           │
      │ - Updates metadata.json              │
      │ - Returns success response           │
      └────────────┬─────────────────────────┘
                   │
                   ▼
      ┌──────────────────────────────┐
      │ Form closes                  │
      │ Success message shown        │
      │ Table refreshes              │
      │ Updated blog appears         │
      └──────────────────────────────┘
```

## Data Flow: Creating Blog File

```
┌─────────────────────────┐
│ Admin Form Data:        │
│ {                       │
│  id: "my-blog"         │
│  title: "My Blog"      │
│  date: "2024-12-15"    │
│  category: "Dev"       │
│  tags: "tag1, tag2"    │
│  author: "Me"          │
│  excerpt: "Short"      │
│  content: "..."        │
│ }                       │
└──────────┬──────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ BlogManager.createFrontmatter()  │
│                                  │
│ Input: Blog metadata             │
│ Output: YAML string              │
└──────────┬───────────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ ---              │
    │ title: My Blog   │
    │ date: 2024-12-15│
    │ category: Dev   │
    │ tags: [tag1,...]│
    │ author: Me      │
    │ tagline: Short  │
    │ ---              │
    └────────┬─────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ BlogManager.generateMarkdownContent()│
│ Frontmatter + Content               │
└─────────────┬───────────────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │ ---                      │
    │ title: My Blog           │
    │ date: 2024-12-15        │
    │ category: Dev            │
    │ tags: [tag1, tag2]      │
    │ author: Me               │
    │ tagline: Short          │
    │ ---                      │
    │                          │
    │ # Blog Content           │
    │                          │
    │ Your markdown here...   │
    │ More content...         │
    └──────────┬───────────────┘
               │
               ▼
    ┌───────────────────────────────┐
    │ Server writes to:             │
    │ data/blogs/posts/my-blog.md   │
    └───────────┬───────────────────┘
                │
                ▼
    ┌─────────────────────────────────┐
    │ Server updates metadata.json:    │
    │ [                               │
    │   {...existing blogs...}        │
    │   {                             │
    │     "id": "my-blog"             │
    │     "title": "My Blog"          │
    │     "date": "2024-12-15"        │
    │     "category": "Dev"           │
    │     "tags": ["tag1", "tag2"]    │
    │     "author": "Me"              │
    │     "excerpt": "Short"          │
    │     "readTime": "5 min read"    │
    │     "featured": false           │
    │     "published": true           │
    │     "markdownFile":             │
    │       "posts/my-blog.md"        │
    │   }                             │
    │ ]                               │
    └──────────────────────────────────┘
```

## Read Time Calculation

```
┌──────────────────────────┐
│ Markdown content:        │
│                          │
│ # My Blog                │
│                          │
│ Lorem ipsum dolor        │
│ sit amet consectetur     │
│ adipiscing elit...       │
│ [200 more words]         │
│ [Total: 207 words]       │
└──────────┬───────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Count words in content         │
│ ~Split by whitespace           │
│ wordCount = 207                │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Calculate read time:           │
│ readingSpeed = 200 words/min   │
│ minutes = ceil(207 / 200)      │
│ minutes = ceil(1.035)          │
│ minutes = 2                    │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────┐
│ Result: "2 min read"   │
│                        │
│ Stored in metadata     │
│ and saved with blog    │
└────────────────────────┘
```

## Tag Parsing

```
┌──────────────────────┐
│ User input: Tags     │
│                      │
│ Option A:            │
│ "tag1, tag2, tag3"   │
│                      │
│ Option B:            │
│ ["tag1","tag2","t3"] │
└──────────┬───────────┘
           │
           ▼
┌────────────────────────────────────┐
│ Check if JSON array                │
└─┬───────────────┬──────────────────┘
  │               │
  │ YES           │ NO
  ▼               ▼
┌──────────┐  ┌──────────────────────────┐
│ Parse    │  │ Split by comma:          │
│ as JSON  │  │ "tag1, tag2, tag3"       │
│          │  │  ↓                       │
│Result:   │  │ ["tag1", "tag2", "tag3"]│
│["t1","t2"]  │ Trim whitespace          │
└─────┬────┘  │ Filter empty strings     │
      │       └────────┬─────────────────┘
      │                │
      └────────┬───────┘
               │
               ▼
    ┌──────────────────────┐
    │ Tags as array:       │
    │ ["tag1", "tag2", ...]│
    │                      │
    │ Stored in metadata   │
    │ Used for filtering   │
    └──────────────────────┘
```

## Storage Decision Tree

```
           User creates/edits blog
                   │
                   ▼
         Is server running?
            ╱        ╲
           ╱          ╲
        YES           NO
         │             │
         ▼             ▼
    ┌────────┐    ┌──────────────┐
    │ POST   │    │ localStorage │
    │ to API │    │ (browser)    │
    └───┬────┘    └──────┬───────┘
        │                │
        ▼                ▼
   ┌─────────┐    ┌──────────────┐
   │ Success?│    │ Data stored  │
   └──┬──┬───┘    │ in browser   │
      │ │         │ memory       │
    YES NO        │ Persists if  │
      │ │         │ don't clear  │
      │ │         │ browser data │
      │ │         └──────────────┘
      │ │
      │ ▼
      │ ┌──────────────────────┐
      │ │ Save to localStorage │
      │ │ as fallback          │
      │ │ Show warning in      │
      │ │ console              │
      │ └──────────────────────┘
      │
      ▼
┌──────────────────────┐
│ Data successfully    │
│ saved and persisted  │
│                      │
│ When server comes    │
│ back online,         │
│ user can sync        │
└──────────────────────┘
```

## File Organization After Multiple Blogs

```
Portfolio/
│
├── data/
│   └── blogs/
│       ├── posts/
│       │   ├── my-first-blog.md
│       │   ├── project-robot.md
│       │   ├── web-dev-tips.md
│       │   ├── robotics-guide.md
│       │   └── ... (more blogs)
│       │
│       └── metadata.json
│           [
│             { id: "my-first-blog", ... },
│             { id: "project-robot", ... },
│             { id: "web-dev-tips", ... },
│             { id: "robotics-guide", ... },
│             ...
│           ]
│
├── admin.html ──────────────────┐
                                 │ (opens blog form)
                                 │
                    ┌────────────▼──────────┐
                    │  Blog Editor Modal    │
                    │                       │
                    │  Form + Markdown      │
                    │  Editor               │
                    └───────────────────────┘
```

## Component Interaction

```
┌────────────────────────────────────────────────────┐
│                    Browser                          │
│  ┌───────────────┐         ┌────────────────────┐  │
│  │  admin.html   │◄────────│ admin-manager.js   │  │
│  │  UI & Form    │         │ Data management    │  │
│  └───────────────┘         └────────────────────┘  │
│         │                           ▲               │
│         │                           │               │
│         ▼                           │               │
│  ┌──────────────┐          ┌────────────────────┐  │
│  │ admin-ui.js  │          │ admin-manager.js   │  │
│  │ Rendering    │          │ getItemById() ◄───┐│  │
│  └──────────────┘          └────────────────────┘  │
│         │                                │          │
│         │ Markdown                       │          │
│         │ editor                    Async│ load     │
│         │                                │ blog     │
│         ▼                                │          │
│  ┌──────────────┐                       ▼          │
│  │ blog-api.js  │◄────────────► POST /api/blogs.. │
│  │ Client API   │    HTTP/JSON                    │
│  └──────────────┘                                 │
│         │                                          │
│         │                                          │
│         ▼                                          │
│  ┌──────────────────────┐                         │
│  │  LocalStorage        │                         │
│  │  (fallback)          │                         │
│  │  blog_markdown_{id}  │                         │
│  └──────────────────────┘                         │
└────────────────────────────────────────────────────┘
          │                    │
          │                    │
          ▼                    ▼
   ┌─────────────┐      ┌──────────────────┐
   │  Browser    │      │   Server (Node)  │
   │ localStorage│      │                  │
   │   Data      │      │ data/blogs/posts/│
   │             │      │   {id}.md files  │
   │             │      │                  │
   │             │      │ metadata.json    │
   └─────────────┘      └──────────────────┘
```

---

This visual representation should help you understand how the blog system works! 📊

