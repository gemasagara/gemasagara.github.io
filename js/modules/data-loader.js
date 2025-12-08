// js/modules/data-loader.js
import { CONFIG } from "../config.js";
import { logError, logInfo } from "../utils/helpers.js";

class DataLoader {
  constructor() {
    this.cache = new Map();
    this.loadingStates = new Map();
  }

  /**
   * Fetch JSON data with caching
   * @param {string} endpoint - URL to fetch from
   * @param {boolean} forceRefresh - Skip cache if true
   * @returns {Promise<any>} Parsed JSON data
   */
  async fetchJSON(endpoint, forceRefresh = false) {
    // Check admin panel localStorage first
    const adminData = this.getFromAdminPanel(endpoint);
    if (adminData && !forceRefresh) {
      logInfo(`Using admin panel data for: ${endpoint}`);
      return adminData;
    }

    // Check cache second
    if (!forceRefresh && CONFIG.FEATURES.enableCache) {
      const cached = this.getFromCache(endpoint);
      if (cached) {
        logInfo(`Using cached data for: ${endpoint}`);
        return cached;
      }
    }

    // Check if already loading this endpoint
    if (this.loadingStates.has(endpoint)) {
      logInfo(`Already loading: ${endpoint}, waiting...`);
      return this.loadingStates.get(endpoint);
    }

    // Create loading promise
    const loadingPromise = this._fetchWithRetry(endpoint)
      .then((data) => {
        // Apply migrations (including WebP conversion) to freshly fetched data
        const dataType = this._getDataTypeFromEndpoint(endpoint);
        if (dataType) {
          data = this.migrateDataIfNeeded(dataType, data);
        }
        this.saveToCache(endpoint, data);
        this.loadingStates.delete(endpoint);
        return data;
      })
      .catch((error) => {
        this.loadingStates.delete(endpoint);
        throw error;
      });

    this.loadingStates.set(endpoint, loadingPromise);
    return loadingPromise;
  }

  /**
   * Fetch with retry logic
   * @private
   */
  async _fetchWithRetry(endpoint, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        logInfo(
          `Fetching data from: ${endpoint} (attempt ${i + 1}/${retries})`
        );

        const response = await fetch(endpoint);

        if (!response.ok) {
          // If 404, return empty array/object gracefully
          if (response.status === 404) {
            logInfo(
              `Data file not found (404): ${endpoint} - returning empty array`
            );
            return [];
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        logInfo(`Successfully loaded: ${endpoint}`);
        return data;
      } catch (error) {
        // If JSON parse error or 404, fail gracefully
        if (error instanceof SyntaxError || error.message.includes("404")) {
          logInfo(
            `Gracefully handling missing or invalid data from: ${endpoint}`
          );
          return [];
        }

        logError(`Fetch attempt ${i + 1} failed for ${endpoint}:`, error);

        // If last retry, return empty array instead of throwing
        if (i === retries - 1) {
          logError(
            `Failed to load ${endpoint} after ${retries} attempts - returning empty array`
          );
          return [];
        }

        // Wait before retry (exponential backoff)
        await this._delay(Math.pow(2, i) * 1000);
      }
    }

    // Fallback
    return [];
  }

  /**
   * Load all site data
   * @returns {Promise<Object>} All site data
   */
  async loadAllData() {
    try {
      logInfo("Loading all site data...");

      const [
        siteConfig,
        navigation,
        hero,
        about,
        projects,
        experiences,
        leadership,
        teams,
        awards,
        blogMetadata,
      ] = await Promise.all([
        this.fetchJSON(CONFIG.ENDPOINTS.siteConfig),
        this.fetchJSON(CONFIG.ENDPOINTS.navigation),
        this.fetchJSON(CONFIG.ENDPOINTS.hero),
        this.fetchJSON(CONFIG.ENDPOINTS.about),
        this.fetchJSON(CONFIG.ENDPOINTS.projects),
        this.fetchJSON(CONFIG.ENDPOINTS.experiences),
        this.fetchJSON(CONFIG.ENDPOINTS.leadership),
        this.fetchJSON(CONFIG.ENDPOINTS.teams),
        this.fetchJSON(CONFIG.ENDPOINTS.awards),
        this.fetchJSON(CONFIG.ENDPOINTS.blogMetadata),
      ]);

      logInfo("All site data loaded successfully");

      return {
        siteConfig,
        navigation,
        hero,
        about,
        projects,
        experiences,
        leadership,
        teams,
        awards,
        blogMetadata,
      };
    } catch (error) {
      logError("Failed to load site data:", error);
      throw error;
    }
  }

  /**
   * Load specific data type
   * @param {string} dataType - Key from CONFIG.ENDPOINTS
   * @returns {Promise<any>}
   */
  async loadData(dataType) {
    const endpoint = CONFIG.ENDPOINTS[dataType];
    if (!endpoint) {
      throw new Error(`Unknown data type: ${dataType}`);
    }
    return this.fetchJSON(endpoint);
  }

  /**
   * Save data to cache
   * @private
   */
  saveToCache(key, data) {
    if (!CONFIG.FEATURES.enableCache) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get data from cache
   * @private
   */
  getFromCache(key) {
    if (!CONFIG.FEATURES.enableCache) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is expired
    const age = Date.now() - cached.timestamp;
    if (age > CONFIG.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Migrate old data structures to new ones
   * @private
   */
  migrateDataIfNeeded(dataType, data) {
    // Helper function to convert image paths to WebP
    const convertToWebP = (obj) => {
      if (typeof obj === 'string' && /\.(jpg|jpeg|png)$/i.test(obj)) {
        const webpPath = obj.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        if (obj !== webpPath) {
          logInfo(`Migrated image path: ${obj} → ${webpPath}`);
        }
        return webpPath;
      }
      return obj;
    };

    // Recursively convert image paths in an object
    const migrateImages = (obj) => {
      if (typeof obj === 'string') {
        return convertToWebP(obj);
      } else if (Array.isArray(obj)) {
        return obj.map(migrateImages);
      } else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
          newObj[key] = migrateImages(obj[key]);
        }
        return newObj;
      }
      return obj;
    };

    // Apply WebP migration to all data (works for both arrays and objects)
    if (Array.isArray(data)) {
      data = data.map(migrateImages);
    } else if (data !== null && typeof data === 'object') {
      data = migrateImages(data);
    }

    if (dataType === "projects") {
      return data.map((project) => {
        // Migrate detailsPage to linkedBlog
        if (project.detailsPage && !project.linkedBlog) {
          const match = project.detailsPage.match(/[?&]project=([^&]+)/);
          if (match) {
            project.linkedBlog = match[1];
            logInfo(`Migrated project ${project.id}: linkedBlog = ${match[1]}`);
          }
        }
        // Clean up old field
        if (project.detailsPage) {
          delete project.detailsPage;
        }
        return project;
      });
    }

    if (dataType === "awards") {
      return data.map((award) => {
        // Migrate link to linkedBlog for blog links
        if (award.link && !award.linkedBlog) {
          const match = award.link.match(/[?&]project=([^&]+)/);
          if (match) {
            award.linkedBlog = match[1];
            logInfo(`Migrated award ${award.id}: linkedBlog = ${match[1]}`);
          } else if (!award.externalLink) {
            // If link doesn't match pattern and no externalLink, migrate it
            award.externalLink = award.link;
          }
        }
        return award;
      });
    }

    return data;
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
    logInfo("Cache cleared");
  }

  /**
   * Clear specific cached data
   */
  clearCacheFor(key) {
    this.cache.delete(key);
    logInfo(`Cache cleared for: ${key}`);
  }

  /**
   * Get data from admin panel localStorage
   * Maps JSON endpoints to admin panel data types
   * @private
   */
  getFromAdminPanel(endpoint) {
    try {
      const adminData = localStorage.getItem("portfolio_admin_data");
      if (!adminData) return null;

      const allData = JSON.parse(adminData);

      // Map endpoints to data types
      const typeMap = {
        "/data/hero.json": "hero",
        "/data/about.json": "about",
        "/data/projects.json": "projects",
        "/data/awards.json": "awards",
        "/data/experiences.json": "experiences",
        "/data/leadership.json": "leadership",
        "/data/teams.json": "teams",
      };

      const dataType = typeMap[endpoint];
      if (!dataType) return null;

      let data = allData[dataType];
      if (data) {
        // Apply migrations before returning
        data = this.migrateDataIfNeeded(dataType, data);
        logInfo(`Loaded ${dataType} from admin panel`);
        return data;
      }

      return null;
    } catch (error) {
      logError("Error reading admin panel data:", error);
      return null;
    }
  }

  /**
    * Map endpoint URL to data type
    * @private
    */
  _getDataTypeFromEndpoint(endpoint) {
    const typeMap = {
      "/data/hero.json": "hero",
      "/data/about.json": "about",
      "/data/projects.json": "projects",
      "/data/awards.json": "awards",
      "/data/experiences.json": "experiences",
      "/data/leadership.json": "leadership",
      "/data/teams.json": "teams",
    };
    return typeMap[endpoint] || null;
  }

  /**
    * Utility: delay function
    * @private
    */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      details: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        size: JSON.stringify(value.data).length,
      })),
    };
  }
}

// Create singleton instance
const dataLoader = new DataLoader();

// Export singleton
export default dataLoader;

// Also export class for testing
export { DataLoader };
