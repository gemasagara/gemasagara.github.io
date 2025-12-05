# Quick Start: GitHub Integration for Portfolio Admin

## In 5 Minutes

### 1. Create GitHub OAuth App
- Go to https://github.com/settings/developers → OAuth Apps → New OAuth App
- Application name: "Portfolio Admin"
- Homepage URL: `https://yoursite.com`
- Authorization callback URL: `http://localhost:3000/api/auth/github/callback` (or your server URL)
- Copy: **Client ID** and **Client Secret**

### 2. Create .env File
```bash
cp .env.example .env
```

Edit `.env`:
```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REPO_OWNER=your_github_username
GITHUB_REPO_NAME=your_repo_name
PORT=3000
```

### 3. Install & Run
```bash
npm install express
npm run dev
```

### 4. Test Locally
1. Go to `http://localhost:3000/admin.html`
2. Click "Login with GitHub"
3. Authorize the app
4. Make changes → Click "Push Changes to GitHub"

### 5. Deploy to Production

**Using Render (recommended, free tier):**
1. Push code to GitHub
2. Go to https://dashboard.render.com
3. New Web Service → Connect GitHub repo
4. Build: `npm install`
5. Start: `npm start`
6. Add env vars
7. Deploy

**Update GitHub OAuth App:**
- Change Authorization callback URL to: `https://your-render-domain.com/api/auth/github/callback`

## That's It!

Your portfolio admin panel can now push changes directly to GitHub. Changes appear on your site within 5-10 minutes.

---

For detailed setup: See `GITHUB_INTEGRATION_SETUP.md`
