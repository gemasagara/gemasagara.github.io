# GitHub Integration Setup Guide

This guide walks you through setting up GitHub OAuth integration for your portfolio admin panel, allowing you to push changes directly to your GitHub repository.

## Overview

The GitHub integration allows you to:
1. Authenticate with GitHub using OAuth (no passwords stored)
2. Push modified portfolio data (JSON, markdown) directly to your GitHub repo
3. Let GitHub Pages automatically deploy your changes
4. All changes are tracked in your repository history

## Prerequisites

- GitHub account with an existing repository for your portfolio
- Node.js and npm installed
- A server to run `server.js` (Render, Railway, Replit, or localhost for development)

## Step 1: Create GitHub OAuth Application

1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: "Portfolio Admin Panel"
   - **Homepage URL**: `https://yoursite.com` (your portfolio URL)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback` (for development)
     - For production: `https://your-server-domain.com/api/auth/github/callback`
4. Click "Register application"
5. You'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Generate and copy this (keep it secret!)

## Step 2: Get GitHub Repository Details

You need:
- **GITHUB_REPO_OWNER**: Your GitHub username
- **GITHUB_REPO_NAME**: Your portfolio repository name

For example:
- If your repo is `https://github.com/gemasagara/gemasagara.github.io`
- GITHUB_REPO_OWNER = `gemasagara`
- GITHUB_REPO_NAME = `gemasagara.github.io`

## Step 3: Setup Environment Variables

### For Local Development

1. Create a `.env` file in your portfolio root directory (copy from `.env.example`)
2. Fill in the values:
```bash
GITHUB_CLIENT_ID=<your_client_id>
GITHUB_CLIENT_SECRET=<your_client_secret>
GITHUB_REPO_OWNER=<your_username>
GITHUB_REPO_NAME=<your_repo_name>
GITHUB_TOKEN=<optional_personal_access_token>
PORT=3000
```

### For Production (Render, Railway, etc.)

Add the same environment variables in your hosting platform's settings:
- Render: Project Settings → Environment
- Railway: Variables
- Replit: Secrets

**IMPORTANT**: Never commit `.env` to git. Use `.gitignore` to exclude it.

## Step 4: Update admin.html with Client ID

You have two options to provide the GitHub Client ID to the frontend:

### Option A: Meta Tag (Recommended for Production)
In `admin.html`, add before the closing `</head>` tag:
```html
<meta name="github-client-id" content="YOUR_CLIENT_ID_HERE">
```

### Option B: Window Variable
Add before `<script type="module" src="js/admin-panel.js"></script>`:
```html
<script>
  window.GITHUB_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
</script>
```

**Note**: The Client ID is not sensitive (it's public), so it's safe to include in HTML.

## Step 5: Run the Server

### Local Development
```bash
npm install express
npm run dev
# or: node --watch server.js
```

Then navigate to `http://localhost:3000/admin.html`

### Production Deployment

**Option 1: Render (Recommended - Free tier available)**
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Fill in settings:
   - **Name**: portfolio-admin
   - **Environment**: Node
   - **Build command**: `npm install`
   - **Start command**: `npm start`
6. Add environment variables in "Environment" tab
7. Deploy

**Option 2: Railway**
1. Go to [Railway.app](https://railway.app)
2. Create new project → Import from GitHub
3. Select your repository
4. Add environment variables
5. Deploy

**Option 3: Replit**
1. Import your GitHub repo to Replit
2. Add secrets for environment variables
3. Configure run command: `npm start`

## Step 6: Test the Integration

1. Navigate to `https://yourdomain.com/admin.html` (or `http://localhost:3000/admin.html` locally)
2. You should see a "Login with GitHub" button in the sidebar
3. Click it and authorize your app
4. You should see your GitHub username and avatar
5. Make some changes in the admin panel
6. Click "Push Changes to GitHub"
7. Confirm the push
8. Check your GitHub repository - you should see new commits

## How It Works

### Flow Diagram
```
1. User makes changes in admin panel
   ↓
2. Changes saved to localStorage (local only)
   ↓
3. User clicks "Push Changes to GitHub"
   ↓
4. Admin panel collects all JSON and markdown files from localStorage
   ↓
5. Sends to server via `/api/github/push` endpoint
   ↓
6. Server uses GitHub API to create a commit with the files
   ↓
7. Server commits and pushes to main branch
   ↓
8. GitHub Actions/Pages automatically deploys
   ↓
9. Changes live on your portfolio (within 5-10 minutes)
```

### Files Pushed
The following files are automatically collected and pushed:
- `data/hero.json`
- `data/about.json`
- `data/projects.json`
- `data/awards.json`
- `data/leadership.json`
- `data/experiences.json`
- `data/teams.json`
- `data/blogs.json`
- `data/blogs/posts/*.md` (all blog markdown files)

## Security Notes

### What's Secure
- GitHub Client Secret is kept on the server (never exposed to client)
- OAuth tokens are temporary (expires after request)
- User authentication is via GitHub (no password storage)
- All communication is HTTPS (on production)

### What to Be Careful About
- Never commit `.env` to git
- Never expose `GITHUB_CLIENT_SECRET` in frontend code
- Use HTTPS in production
- Regularly rotate Personal Access Tokens if used
- Only grant necessary OAuth scopes (`repo` for private repos)

## Troubleshooting

### "GitHub Client ID not configured"
- Ensure meta tag or window variable is set with correct Client ID
- Check that your GitHub OAuth app exists and has correct Client ID

### "Failed to push changes: Invalid token"
- Your OAuth token may have expired
- Try logging out and logging back in
- Check that your GitHub account has write access to the repository

### "Failed to push changes: Failed to get repository reference"
- Verify GITHUB_REPO_OWNER and GITHUB_REPO_NAME are correct
- Check that repository exists and is accessible
- Ensure you have push permissions to the repository

### "401 Unauthorized" errors
- Your OAuth token is invalid or expired
- Your GitHub app Client Secret might be wrong
- Try authenticating again

### Changes not appearing on website
- GitHub Pages might take 5-10 minutes to deploy
- Check your repository's GitHub Actions tab to see if deployment succeeded
- Verify the commits were pushed to the `main` branch
- Clear browser cache and hard-refresh the portfolio site

## API Endpoints

### GitHub Authentication

**POST** `/api/auth/github/callback`
```json
{
  "code": "oauth_code_from_github",
  "state": "csrf_state_token"
}
```

**POST** `/api/auth/verify`
```json
{
  "access_token": "github_oauth_token"
}
```

### Push Changes

**POST** `/api/github/push`
```json
{
  "access_token": "github_oauth_token",
  "files": [
    {
      "path": "data/projects.json",
      "content": "json content as string"
    }
  ],
  "message": "Custom commit message (optional)"
}
```

## Next Steps

1. Test locally first with `npm run dev`
2. Deploy your server to production (Render/Railway/Replit)
3. Update the Authorization callback URL in GitHub OAuth app settings to your production domain
4. Test pushing changes in production
5. Set up GitHub Pages if not already done

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| GITHUB_CLIENT_ID | Yes | OAuth app Client ID |
| GITHUB_CLIENT_SECRET | Yes | OAuth app Client Secret |
| GITHUB_REPO_OWNER | Yes | GitHub username/organization |
| GITHUB_REPO_NAME | Yes | Repository name |
| GITHUB_TOKEN | No | Personal access token (for fallback) |
| PORT | No | Server port (default: 3000) |

---

For questions or issues, check the GitHub API documentation:
https://docs.github.com/en/rest/git/trees
