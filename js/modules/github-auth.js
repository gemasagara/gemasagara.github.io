/**
 * GitHub Authentication Module
 * Handles OAuth flow and token management
 */

class GitHubAuth {
  constructor() {
    this.accessToken = null;
    this.user = null;
    this.githubClientId = ""; // Will be set via data attribute or config
    this.redirectUri = `${window.location.origin}/api/auth/github/callback`;
    this.init();
  }

  init() {
    // Check if we have a token in sessionStorage
    this.accessToken = sessionStorage.getItem("github_access_token");
    const userJson = sessionStorage.getItem("github_user");
    if (userJson) {
      try {
        this.user = JSON.parse(userJson);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }

    // Check for OAuth callback (code in URL)
    this.handleOAuthCallback();
  }

  setClientId(clientId) {
    this.githubClientId = clientId;
  }

  startLogin() {
    if (!this.githubClientId) {
      this.showAlert("GitHub Client ID not configured");
      return;
    }

    // Generate random state for CSRF protection
    const state = this.generateRandomState();
    sessionStorage.setItem("oauth_state", state);

    // Redirect to GitHub OAuth
    const params = new URLSearchParams({
      client_id: this.githubClientId,
      redirect_uri: this.redirectUri,
      scope: "repo",
      state: state,
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  }

  async checkAccess() {
  if (!this.accessToken) return false;

  try {
    const response = await fetch("/api/auth/check-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: this.accessToken }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.access === true;
    }

    return false;
  } catch (error) {
    console.error("Access check error:", error);
    return false;
  }
}

  async handleOAuthCallback() {
  // Check for token in URL hash
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const token = params.get("token");

  if (!token) return; // Not a callback

  try {
    // Store token
    this.accessToken = token;
    sessionStorage.setItem("github_access_token", this.accessToken);

    // Verify token and get user info
    await this.verifyToken();

    // Clean up URL
    window.history.replaceState({}, document.title, "/admin.html");

    // Reload to show authenticated state and reinitialize the admin panel
    window.location.reload();
  } catch (error) {
    console.error("OAuth callback error:", error);
    console.error("Authentication failed, showing alert...");
  }
}

  async verifyToken() {
    if (!this.accessToken) return false;

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: this.accessToken }),
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      const data = await response.json();
      this.user = data.user;
      sessionStorage.setItem("github_user", JSON.stringify(this.user));
      return true;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  }

  isAuthenticated() {
    return !!this.accessToken && !!this.user;
  }

  getToken() {
    return this.accessToken;
  }

  getUser() {
    return this.user;
  }

  logout() {
    this.accessToken = null;
    this.user = null;
    sessionStorage.removeItem("github_access_token");
    sessionStorage.removeItem("github_user");
    sessionStorage.removeItem("oauth_state");
  }

  generateRandomState() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}

export default new GitHubAuth();
