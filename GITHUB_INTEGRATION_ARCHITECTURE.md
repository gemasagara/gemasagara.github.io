# GitHub Integration Architecture

Technical documentation of the GitHub OAuth and Git API integration.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PORTFOLIO WEBSITE                           │
│  (Static HTML/CSS/JS served by GitHub Pages)                   │
│  Loads data from: data/heroes.json, data/projects.json, etc.  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┴────────────────┐
                │                                │
                ▼                                ▼
        ┌──────────────────┐         ┌──────────────────────┐
        │ GitHub Pages     │         │ Admin Panel          │
        │ Deployment       │         │ (SPA)                │
        │                  │         │                      │
        │ Auto-deploys     │         │ - React/Vue-like     │
        │ on main branch   │         │ - Runs in browser    │
        │ updates          │         │ - Static files       │
        └────────┬─────────┘         └──────────┬───────────┘
                 ▲                              │
                 │                              │
                 └──────────────┬───────────────┘
                                │
                ┌───────────────┴────────────────┐
                │                                │
                ▼                                ▼
        ┌──────────────────┐         ┌──────────────────────┐
        │ GitHub REST API  │         │ Backend Server       │
        │                  │         │ (Node.js/Express)    │
        │ - Git API        │◄────────│                      │
        │ - OAuth API      │         │ - GitHub Auth        │
        │ - Repo access    │         │ - OAuth callback     │
        │                  │         │ - Push to GitHub     │
        └──────────────────┘         └──────────────────────┘
```

## Component Architecture

### Frontend Components

#### 1. github-auth.js
**Purpose**: Handle OAuth authentication flow

**Key Methods**:
- `init()` - Initialize auth state from sessionStorage
- `startLogin()` - Redirect to GitHub OAuth
- `handleOAuthCallback()` - Process OAuth callback and exchange code for token
- `verifyToken()` - Validate token and fetch user info
- `isAuthenticated()` - Check if user is logged in
- `logout()` - Clear tokens and user data

**Data Storage**:
- `github_access_token` - OAuth access token (sessionStorage)
- `github_user` - User info {login, name, avatar_url} (sessionStorage)
- `oauth_state` - CSRF protection token (sessionStorage)

**OAuth Flow**:
```
User clicks "Login"
    │
    ├─ Generate random state (CSRF protection)
    ├─ Redirect to GitHub authorize URL
    │
User authorizes app on GitHub
    │
    ├─ GitHub redirects to /admin.html?code=xxx&state=xxx
    ├─ handleOAuthCallback() processes this
    ├─ Calls /api/auth/github/callback?code=xxx&state=xxx
    ├─ Server exchanges code for token
    ├─ Returns access_token to client
    ├─ Client stores token in sessionStorage
    ├─ Client verifies token via /api/auth/verify
    ├─ Stores user info in sessionStorage
    │
User is now authenticated
```

#### 2. github-push.js
**Purpose**: Collect changes and push to GitHub

**Key Methods**:
- `getModifiedFiles()` - Collect all JSON and markdown from localStorage
- `pushChanges()` - Orchestrate the push process
- `createMarkdownWithFrontmatter()` - Format blog markdown
- `generateCommitMessage()` - Create commit message
- `showLoadingIndicator()` / `hideLoadingIndicator()` - UI feedback

**File Collection**:
```javascript
// Collects these files from localStorage:
data/hero.json
data/about.json
data/projects.json
data/awards.json
data/leadership.json
data/experiences.json
data/teams.json
data/blogs.json
data/blogs/posts/<blogId>.md (for each blog)
```

**Push Flow**:
```
User clicks "Push Changes"
    │
    ├─ Check if authenticated
    ├─ getModifiedFiles() collects data from localStorage
    ├─ Show confirmation dialog
    │
User confirms
    │
    ├─ Show loading indicator
    ├─ POST /api/github/push with:
    │   - access_token
    │   - files array with path and content
    │   - commit message
    │
Server pushes to GitHub
    │
    ├─ Hide loading indicator
    ├─ Show success message with commit SHA
    │
User sees "Changes pushed successfully"
```

#### 3. admin-panel.js Integration
**Methods Added**:
- `getGitHubClientId()` - Read Client ID from meta tag or window variable
- `login()` - Call githubAuth.startLogin()
- `logout()` - Clear auth and update UI
- `updateAuthUI()` - Toggle login button vs auth info display
- `pushChangesToGitHub()` - Call githubPush.pushChanges()

**UI Updates**:
- Show/hide login button based on auth state
- Show user avatar and name when logged in
- Show/hide push button based on auth state

### Backend Components

#### 1. Express Server (server.js)

**New Endpoints**:

##### GET /api/auth/github/callback
Handles GitHub OAuth callback

**Query Parameters**:
- `code` - Authorization code from GitHub
- `state` - CSRF state token

**Process**:
1. Verify state matches sessionStorage
2. Exchange code for token via GitHub API
3. Return access_token to client

**Response**:
```json
{
  "success": true,
  "access_token": "ghu_xxxxx",
  "token_type": "bearer"
}
```

##### POST /api/auth/verify
Verify OAuth token and get user info

**Request Body**:
```json
{
  "access_token": "ghu_xxxxx"
}
```

**Process**:
1. Call GitHub API: `GET /user` with Bearer token
2. Extract user info (login, name, avatar_url)

**Response**:
```json
{
  "success": true,
  "user": {
    "login": "username",
    "name": "User Name",
    "avatar_url": "https://avatars.githubusercontent.com/u/123..."
  }
}
```

##### POST /api/github/push
Push files to GitHub repository

**Request Body**:
```json
{
  "access_token": "ghu_xxxxx",
  "files": [
    {
      "path": "data/projects.json",
      "content": "{...json content...}"
    },
    {
      "path": "data/blogs/posts/blog-1.md",
      "content": "---\ntitle: Blog\n---\n\n..."
    }
  ],
  "message": "Update portfolio data - 2024-01-01..."
}
```

**Process** (Git API workflow):
1. Get current branch reference (main)
   - `GET /repos/{owner}/{repo}/git/refs/heads/main`
2. Get current tree
   - `GET /repos/{owner}/{repo}/git/trees/{sha}`
3. Create new tree with file changes
   - `POST /repos/{owner}/{repo}/git/trees`
   - Includes all files with mode `100644` (regular file)
4. Create new commit
   - `POST /repos/{owner}/{repo}/git/commits`
   - Links new tree to current HEAD
5. Update branch reference
   - `PATCH /repos/{owner}/{repo}/git/refs/heads/main`
   - Points to new commit

**Response**:
```json
{
  "success": true,
  "message": "Changes pushed to GitHub successfully",
  "commit_sha": "abc1234567890",
  "files_pushed": 5
}
```

## Data Flow Diagram

### Save Flow (Existing)
```
User edits admin panel
    ↓
Form submitted
    ↓
Data converted to object
    ↓
AdminManager.updateItem()
    ↓
Data stored in localStorage
    ↓
✓ Changes saved locally
```

### Push Flow (New)
```
User clicks "Push Changes"
    ↓
githubPush.pushChanges()
    ↓
getModifiedFiles()
    ├─ Iterate localStorage keys
    ├─ Parse portfolio_* JSON
    ├─ Parse blog_markdown_* files
    └─ Return array of {path, content}
    ↓
Show confirmation dialog
    ↓
POST /api/github/push
    ├─ Token
    ├─ Files array
    └─ Message
    ↓
Server: GitHub OAuth token is valid
    ↓
Server: Create Git tree
    ├─ Get current branch HEAD
    ├─ Get current tree
    ├─ Create new tree with changes
    └─ Store SHA
    ↓
Server: Create Git commit
    ├─ Link to new tree
    ├─ Link to parent commit
    └─ Store commit SHA
    ↓
Server: Update branch reference
    ├─ Point main to new commit
    └─ Complete!
    ↓
GitHub Pages detects change
    ↓
GitHub Actions deploys site
    ↓
5-10 minutes later
    ↓
✓ Changes live on portfolio
```

## Security Architecture

### Token Security

```
┌─────────────────────────────────────────────────────────┐
│ Browser (Admin Panel)                                   │
│                                                         │
│ - sessionStorage: github_access_token                   │
│   (Temporary, cleared on page close/logout)            │
│                                                         │
│ - sessionStorage: github_user                           │
│   (Non-sensitive info: username, avatar)              │
│                                                         │
│ - NEVER stores: Client Secret                          │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS only
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Backend Server                                          │
│ (Node.js - Your Server)                                │
│                                                         │
│ - Environment Variables: Client Secret                  │
│   (Protected, only on server)                          │
│                                                         │
│ - Receives OAuth code from GitHub                      │
│ - Exchanges for token (uses Client Secret)             │
│ - Sends token to GitHub API                            │
│ - Returns only access_token to client                  │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS + Auth header
                       ▼
┌─────────────────────────────────────────────────────────┐
│ GitHub API                                              │
│ (https://api.github.com)                               │
│                                                         │
│ - Receives: Bearer {access_token}                      │
│ - Performs: Commit, push, create files                 │
│ - Returns: Commit SHA, status                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### CSRF Protection
- Client generates random `state` value
- Stores in sessionStorage
- Sends with OAuth request
- Verifies on callback
- Prevents token hijacking

### OAuth Scope
- Requested: `repo` (full control)
- Grants: Push to repository
- Token expires: On logout or session end
- No refresh tokens: Each login gets new token

## Error Handling

### Frontend Error Handling
```javascript
try {
  await githubPush.pushChanges()
} catch (error) {
  // Show user-friendly error message
  // Include error details from server
  alert("Failed to push: " + error.message)
}
```

### Server Error Handling
```javascript
try {
  // GitHub API calls
} catch (error) {
  // Log full error internally
  console.error("Error:", error)
  // Return sanitized error to client
  res.status(500).json({
    error: "Failed to push changes",
    details: error.message // Safe message
  })
}
```

### Common Errors & Recovery

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid token` | Token expired | Logout and re-login |
| `Invalid state` | CSRF mismatch | Refresh page and retry |
| `Failed to get repo reference` | Wrong repo name | Check GITHUB_REPO_OWNER/NAME |
| `401 Unauthorized` | Bad credentials | Check Client Secret |
| `Failed to create commit` | No write access | Check repo permissions |

## Performance Considerations

### File Size
- `github-auth.js`: ~4 KB uncompressed
- `github-push.js`: ~5 KB uncompressed
- Server code: ~8 KB
- CSS additions: ~2 KB
- **Total**: ~19 KB overhead

### Network
- OAuth callback: 1 request
- Token verification: 1 request
- Git tree creation: 1 request
- Commit creation: 1 request
- Branch update: 1 request
- **Total**: ~5 requests to push

### Caching
- OAuth tokens: 1-hour typical (GitHub default)
- User info: Stored in sessionStorage
- No file caching (always fresh from localStorage)

## Scalability

### Current Limitations
- Max file size per API call: ~1 MB (GitHub API limit)
- Max total request: ~50 MB (Express limit)
- No batch processing implemented
- Pushes are sequential (one at a time)

### Future Optimizations
- Implement delta detection (push only changed files)
- Add batch push queue
- Implement retry logic
- Add progress tracking

## Monitoring & Logging

### Client-Side Logs
```javascript
// In browser console (F12):
// - OAuth flow
// - Token verification
// - File collection
// - Push status
console.log() at key points
```

### Server-Side Logs
```javascript
// In server console:
console.log("[OK] Blog markdown saved: /path")
console.error("Error pushing to GitHub:", error)
// Timestamp, method, status codes
```

### GitHub Monitoring
- Check repository commits
- Check GitHub Actions logs
- Monitor deployment status
- Review webhook deliveries (if configured)

## Testing

### Unit Tests (Frontend)
```javascript
// Test OAuth flow
// Test file collection
// Test error handling
```

### Integration Tests (Server)
```javascript
// Test GitHub API endpoints
// Test token validation
// Test commit creation
```

### E2E Tests
1. Create test admin account
2. Make changes
3. Push to test repository
4. Verify files in repo
5. Verify deploy

---

**Architecture Version**: 1.0
**Last Updated**: December 2025
**Status**: Production Ready
