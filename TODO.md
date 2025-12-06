## ADMIN PANEL TODO LIST

### Things To Add :
- [x] Add a new page to the admin panel to manage (add, edit, and delete) blogs content, and also the relation between blogs, and match the blogs to the corresponding root action, either from projects, or awards, etc.
  - [x] Auto-discover blogs from markdown files (project-*.md pattern)
  - [x] Parse markdown frontmatter (YAML) for blog metadata
  - [x] Remove non-matching markdown files from blogs table
  - [x] Add blogs management UI (CRUD operations)
  - [x] Add linkedBlog and externalLink fields to projects and awards
  - [x] Handle blog-to-action relationships via linkedBlog field
  - [x] Fix duplicate blogs in table (deduplication)
  - [x] Allow empty markdown files
  - [x] Auto-migrate detailsPage URLs to linkedBlog
  - [x] Fix hasUnsavedChanges error
  - [x] Fix thumbnail serialization (File to string)
  - [x] Integrate linkedBlog with portfolio templates
  - [x] Add data migration layer in DataLoader

### Things To Test :
- [x] LinkedBlog feature end-to-end (admin → portfolio → view-details)

### Future Plan :
- [x] Integrate the dashboard to github api, so the admin panel can direcly update the site without having to manually push the changes to the server
  - [x] GitHub OAuth authentication
  - [x] Push changes endpoint
  - [x] File collection from localStorage
  - [x] Commit and push to main branch
  - [x] UI with login/logout and push buttonfrom the portfolio site
- [x] Add a security measure / authentication to access the admin panel (GitHub OAuth)
- [ ] remove amp contribution from the github