# Deployment Checklist

Complete this checklist to successfully deploy your GitHub-integrated portfolio admin panel.

## Phase 1: GitHub OAuth App Setup

- [ ] Go to https://github.com/settings/developers
- [ ] Click "OAuth Apps" → "New OAuth App"
- [ ] Fill application details:
  - [ ] Application name: "Portfolio Admin"
  - [ ] Homepage URL: (your portfolio URL)
  - [ ] Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
- [ ] Copy **Client ID** to clipboard
- [ ] Generate **Client Secret** and copy
- [ ] Store both safely (in `.env` next)

## Phase 2: Local Environment Setup

- [ ] Create `.env` file from `.env.example`:
  ```bash
  cp .env.example .env
  ```
- [ ] Edit `.env` with your values:
  - [ ] GITHUB_CLIENT_ID = (from OAuth app)
  - [ ] GITHUB_CLIENT_SECRET = (from OAuth app)
  - [ ] GITHUB_REPO_OWNER = (your GitHub username)
  - [ ] GITHUB_REPO_NAME = (your repo name)
  - [ ] PORT = 3000 (or your preferred port)
- [ ] Verify `.env` is in `.gitignore`:
  ```bash
  grep ".env" .gitignore
  ```
- [ ] Install dependencies:
  ```bash
  npm install express
  ```

## Phase 3: Local Testing

- [ ] Start development server:
  ```bash
  npm run dev
  ```
- [ ] Server should output:
  ```
  ╔════════════════════════════════╗
  ║  Portfolio Admin Server        ║
  ║  Running on http://localhost:3000
  ╚════════════════════════════════╝
  ```
- [ ] Open browser to `http://localhost:3000/admin.html`
- [ ] Check sidebar for "Login with GitHub" button
- [ ] Click button and verify GitHub authorization page appears
- [ ] Authorize the app
- [ ] Verify redirects back to admin panel with your GitHub username visible
- [ ] Make a test change to portfolio data
- [ ] Click "Push Changes to GitHub" button
- [ ] Confirm dialog appears
- [ ] Wait for success message
- [ ] Check your GitHub repository:
  - [ ] New commit should appear
  - [ ] Commit should contain modified files
  - [ ] Files should have your changes

## Phase 4: Production Server Setup

### Option A: Render (Recommended)

- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub account (if not already connected)
- [ ] Select your portfolio repository
- [ ] Fill in configuration:
  - [ ] Name: `portfolio-admin`
  - [ ] Environment: `Node`
  - [ ] Region: (closest to you)
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Instance Type: Free (or Starter)
- [ ] Click "Create Web Service"
- [ ] Wait for initial build (1-2 minutes)
- [ ] Add environment variables:
  - [ ] Go to "Environment"
  - [ ] Add each variable from `.env`:
    - [ ] GITHUB_CLIENT_ID
    - [ ] GITHUB_CLIENT_SECRET
    - [ ] GITHUB_REPO_OWNER
    - [ ] GITHUB_REPO_NAME
  - [ ] Click "Save"
- [ ] Server should redeploy automatically
- [ ] Copy the Render URL (e.g., `https://portfolio-admin.onrender.com`)

### Option B: Railway

- [ ] Go to https://railway.app
- [ ] Click "Create Project" → "Deploy from GitHub"
- [ ] Select your portfolio repository
- [ ] Configure in `railway.toml` or dashboard:
  - [ ] Build: `npm install`
  - [ ] Start: `npm start`
- [ ] Add environment variables in dashboard
- [ ] Deploy
- [ ] Copy the Railway domain

### Option C: Replit

- [ ] Go to https://replit.com
- [ ] Click "Create Repl" → "Import from GitHub"
- [ ] Select your portfolio repository
- [ ] Create `.env` file in Replit with your variables
- [ ] Run: `npm install && npm start`
- [ ] Copy the Replit domain

## Phase 5: GitHub OAuth App Update

- [ ] Go back to https://github.com/settings/developers/oauth-apps
- [ ] Select your "Portfolio Admin" app
- [ ] Update **Authorization callback URL**:
  - [ ] Remove: `http://localhost:3000/api/auth/github/callback`
  - [ ] Add: `https://your-server-domain.com/api/auth/github/callback`
  - [ ] Examples:
    - Render: `https://portfolio-admin.onrender.com/api/auth/github/callback`
    - Railway: `https://your-railway-domain.up.railway.app/api/auth/github/callback`
    - Replit: `https://your-replit.replit.dev/api/auth/github/callback`
- [ ] Save changes

## Phase 6: Production Testing

- [ ] Open your production admin panel:
  - [ ] Render: `https://your-render-app.onrender.com/admin.html`
  - [ ] Railway: `https://your-railway.up.railway.app/admin.html`
  - [ ] Replit: `https://your-replit.replit.dev/admin.html`
- [ ] Verify "Login with GitHub" button appears
- [ ] Click and authenticate with GitHub
- [ ] Verify your username appears in sidebar
- [ ] Make a test change
- [ ] Click "Push Changes to GitHub"
- [ ] Confirm the dialog
- [ ] Wait for success message
- [ ] Check GitHub repository for new commit
- [ ] Wait 5-10 minutes for GitHub Pages to deploy
- [ ] Verify changes appear on your portfolio website

## Phase 7: Security Hardening

- [ ] Verify `.env` is in `.gitignore`:
  ```bash
  cat .gitignore | grep ".env"
  ```
- [ ] Confirm `.env` file is NOT committed:
  ```bash
  git status
  # Should NOT show .env
  ```
- [ ] Never share Client Secret publicly
- [ ] Verify HTTPS is enforced on production
- [ ] Consider adding rate limiting to `/api/github/push`
- [ ] Monitor GitHub token usage

## Phase 8: Documentation

- [ ] Bookmark these guides for reference:
  - [ ] `GITHUB_INTEGRATION_SETUP.md` (detailed setup)
  - [ ] `QUICK_START_GITHUB.md` (quick reference)
  - [ ] `GITHUB_INTEGRATION_SUMMARY.md` (overview)
- [ ] Create internal documentation for team members
- [ ] Share deployment URL with team

## Phase 9: Monitoring

- [ ] Check server logs regularly:
  ```bash
  # For Render: View logs in dashboard
  # For Railway: View logs in dashboard
  # For local: Check console output
  ```
- [ ] Monitor GitHub commits for successful pushes
- [ ] Test push feature weekly
- [ ] Monitor GitHub Actions deployment

## Phase 10: Cleanup

- [ ] Remove any test commits from repository
- [ ] Delete test admin panel entries
- [ ] Archive old server configs if migrating
- [ ] Update README with deployment info

## Rollback Plan

If something goes wrong:

### Server Crashes
```bash
# Check logs for errors
# If on Render/Railway: Check dashboard
# Local: npm run dev will show errors
```

### GitHub Push Fails
- [ ] Verify GitHub token is valid
- [ ] Check repository access permissions
- [ ] Verify GITHUB_REPO_OWNER and GITHUB_REPO_NAME are correct
- [ ] Try logging out and logging back in

### OAuth Not Working
- [ ] Verify Client ID and Secret are correct
- [ ] Check Authorization callback URL matches exactly
- [ ] Try creating a new OAuth app
- [ ] Check browser console for errors (F12)

### Server Won't Deploy
- [ ] Check environment variables are set
- [ ] Verify `npm install` completes without errors
- [ ] Check Node.js version compatibility
- [ ] Look for syntax errors in server.js

## Post-Deployment Verification

Run this checklist weekly to ensure everything is working:

- [ ] Admin panel loads without errors
- [ ] Can authenticate with GitHub
- [ ] Can log out
- [ ] Can push changes to GitHub
- [ ] Changes appear in repository
- [ ] Changes deploy to portfolio website
- [ ] No console errors in browser (F12)
- [ ] No server errors in logs

## Support Resources

- GitHub API Docs: https://docs.github.com/en/rest
- OAuth 2.0 Flow: https://tools.ietf.org/html/rfc6749
- Render Deployment: https://render.com/docs
- Railway Deployment: https://docs.railway.app
- Replit Docs: https://replit.com/docs

---

**Estimated Time**: 30-45 minutes (first time)

**Critical Points**:
1. Never commit `.env` to git
2. Keep Client Secret secure
3. Update OAuth callback URL when moving to production
4. Test thoroughly before marking complete

**When Complete**: ✅ Your admin panel can push changes to GitHub!
