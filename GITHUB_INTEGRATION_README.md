# GitHub Integration for Portfolio Admin Panel

Push changes from your admin panel directly to GitHub - no manual git commands needed!

## What This Does

Instead of manually editing files and pushing to GitHub, you now can:

1. **Make changes** in the admin panel (just like before)
2. **Click "Push Changes"** button
3. **Your changes automatically appear** on your portfolio website (within 5-10 minutes)

All changes are securely pushed to your GitHub repository via OAuth.

## Quick Example

```
Before: Edit file → git add . → git commit → git push → wait for deploy

After:  Make change in admin → Click "Push Changes" → Done!
```

## Features

- ✅ **GitHub OAuth Login** - Secure authentication, no passwords
- ✅ **One-Click Push** - Push all changes with one button
- ✅ **Automatic File Collection** - Gathers JSON and markdown files
- ✅ **Git Commits** - Creates proper commits with messages
- ✅ **User Display** - Shows GitHub username and avatar
- ✅ **Error Handling** - Clear error messages and recovery
- ✅ **Loading Feedback** - Visual indicator while pushing

## Getting Started

### 1️⃣ Create GitHub OAuth App (5 minutes)

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. OAuth Apps → New OAuth App
3. Fill in:
   - Application name: "Portfolio Admin"
   - Homepage URL: Your portfolio URL
   - Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy **Client ID** and **Client Secret**

### 2️⃣ Setup Environment (2 minutes)

```bash
# Create .env file
cp .env.example .env

# Edit .env with your values
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_secret
GITHUB_REPO_OWNER=your_username
GITHUB_REPO_NAME=your_repo_name
```

### 3️⃣ Run Locally (1 minute)

```bash
npm install express
npm run dev
```

Then go to `http://localhost:3000/admin.html`

### 4️⃣ Test Push Feature (5 minutes)

1. Click "Login with GitHub" button
2. Authorize the app
3. Make a test change
4. Click "Push Changes to GitHub"
5. Check your GitHub repository for the commit

### 5️⃣ Deploy to Production (10 minutes)

Use **Render** (recommended, free tier):

1. Push code to GitHub
2. Go to [dashboard.render.com](https://dashboard.render.com)
3. New Web Service → Select your repo
4. Build: `npm install`
5. Start: `npm start`
6. Add environment variables
7. Deploy

Then update GitHub OAuth app callback URL to your production domain.

## Documentation

Depending on what you need:

| Guide | When to Use |
|-------|------------|
| **QUICK_START_GITHUB.md** | 5-minute setup (impatient? start here!) |
| **GITHUB_INTEGRATION_SETUP.md** | Detailed setup with explanations |
| **DEPLOYMENT_CHECKLIST.md** | Step-by-step deployment checklist |
| **GITHUB_INTEGRATION_ARCHITECTURE.md** | Technical deep dive (for developers) |
| **GITHUB_INTEGRATION_SUMMARY.md** | Overview of what was built |

## How It Works (Simple Version)

```
1. You make changes in admin panel → Saved to browser (localStorage)

2. You click "Push Changes" → Asks which files to push

3. Your server collects all changed files → Sends to GitHub

4. GitHub receives files → Creates a commit → Updates the repository

5. GitHub Pages automatically deploys → Website updated!
```

## Security

### What's Protected
- Your Client Secret stays on your server (never shown to users)
- OAuth tokens are temporary (cleared when you logout)
- No passwords are stored anywhere
- GitHub handles user authentication

### What You Should Protect
- Never share your `.env` file
- Keep Client Secret secret
- Use HTTPS in production
- Don't commit `.env` to git

## Troubleshooting

### "Login with GitHub" button doesn't work
- Check that Client ID is set correctly
- Verify OAuth app is created at github.com/settings/developers
- Check browser console (F12) for errors

### Changes don't appear after pushing
- GitHub Pages takes 5-10 minutes to deploy
- Refresh your portfolio website (clear cache with Ctrl+Shift+R)
- Check GitHub repository for commits
- Check GitHub Actions for deployment status

### "Failed to push" error
- Try logging out and back in
- Verify repository name is correct
- Check that you have push access to the repository
- Check server logs for detailed error

### Server won't start
```bash
# Try this:
npm install
npm run dev

# Check that .env file exists and is readable
ls -la .env
```

## Files Modified

**New Files:**
- `js/modules/github-auth.js` - OAuth authentication
- `js/modules/github-push.js` - Push to GitHub
- `.env.example` - Environment template
- Various documentation files

**Modified Files:**
- `server.js` - Added GitHub endpoints
- `admin.html` - Added login UI and push button
- `js/admin-panel.js` - Integrated GitHub modules
- `css/admin.css` - Added styles
- `package.json` - Cleaned up

## Environment Variables

```bash
GITHUB_CLIENT_ID          # From your OAuth app
GITHUB_CLIENT_SECRET      # From your OAuth app  
GITHUB_REPO_OWNER         # Your GitHub username
GITHUB_REPO_NAME          # Your repository name
PORT                      # Server port (optional, default 3000)
```

## Deployment Platforms

**Recommended: Render** (free tier available)
- Easiest setup
- Automatic deploys on git push
- Free tier works great
- https://render.com

**Also Works: Railway**
- Very similar to Render
- Good documentation
- https://railway.app

**Also Works: Replit**
- Easy for beginners
- Good learning resource
- https://replit.com

## What Gets Pushed

When you click "Push Changes", these files are pushed to GitHub:

```
data/hero.json
data/about.json
data/projects.json
data/awards.json
data/leadership.json
data/experiences.json
data/teams.json
data/blogs.json
data/blogs/posts/*.md (all blog markdown files)
```

## FAQ

**Q: Is this secure?**
A: Yes! Your Client Secret stays on your server, and OAuth tokens are temporary.

**Q: Do I need a backend?**
A: Yes, you need to run `npm start` on a server. Free tier on Render works great.

**Q: What if I'm not logged in?**
A: The "Push Changes" button is hidden. You must login first.

**Q: Can multiple people use this?**
A: Yes, but they'll each need their own GitHub account and OAuth login.

**Q: What if GitHub is down?**
A: Your changes are still saved locally. Try pushing again when GitHub is back.

**Q: How long until changes appear?**
A: Usually 5-10 minutes (GitHub Pages deployment time). Sometimes 1-2 minutes.

**Q: Can I push just some files?**
A: Currently all changed files are pushed together. Partial pushes can be added later.

**Q: What if I make a mistake?**
A: Just git revert the commit in your repository. This is why using GitHub is great!

## Next Steps

1. **Read**: QUICK_START_GITHUB.md (5 min)
2. **Create**: GitHub OAuth app (5 min)
3. **Setup**: .env file (2 min)
4. **Test**: Locally with `npm run dev` (5 min)
5. **Deploy**: To Render/Railway/Replit (10 min)
6. **Celebrate**: Your admin panel works! 🎉

## Support

- Check **GITHUB_INTEGRATION_SETUP.md** for detailed help
- Check **DEPLOYMENT_CHECKLIST.md** for step-by-step guide
- GitHub Issues: Report bugs on your repository
- GitHub API Docs: https://docs.github.com/en/rest

---

## Before You Start

```
✅ You have:
   - Admin panel working locally
   - Portfolio repo on GitHub
   - GitHub account

❌ You don't have:
   - Server running (we'll set it up!)
   - OAuth app (we'll create it!)
   - Environment variables (we'll configure them!)
```

**Ready?** → Start with **QUICK_START_GITHUB.md** (5 minutes!)

---

**Status**: ✅ Production Ready
**Version**: 1.0
**Last Updated**: December 2025
