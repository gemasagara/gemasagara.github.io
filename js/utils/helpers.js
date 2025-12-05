// js/utils/helpers.js

/**
 * Console logging with timestamp (only in development)
 */
export function logInfo(message, ...args) {
  if (isDevelopment()) {
    console.log(`[${getTimestamp()}] ℹ️ ${message}`, ...args);
  }
}

export function logError(message, ...args) {
  console.error(`[${getTimestamp()}] ❌ ${message}`, ...args);
}

export function logWarning(message, ...args) {
  if (isDevelopment()) {
    console.warn(`[${getTimestamp()}] ⚠️ ${message}`, ...args);
  }
}

/**
 * Check if running in development mode
 */
export function isDevelopment() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
}

/**
 * Get formatted timestamp
 */
export function getTimestamp() {
  return new Date().toLocaleTimeString();
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Safely parse HTML (allows some tags)
 */
export function parseHTML(str) {
  // Allow only specific safe tags
  const allowedTags = ['b', 'i', 'em', 'strong', 'a', 'br', 'p'];
  const temp = document.createElement('div');
  temp.innerHTML = str;
  
  // Remove script tags and event handlers
  const scripts = temp.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  return temp.innerHTML;
}

/**
 * Format date
 */
export function formatDate(dateString, format = 'short') {
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  return dateString;
}

/**
 * Truncate text
 */
export function truncate(str, maxLength, suffix = '...') {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Generate unique ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element, offset = 0) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 - offset &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Wait for element to exist in DOM
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Show loading indicator
 */
export function showLoading(container) {
  const loader = document.createElement('div');
  loader.className = 'loading-indicator';
  loader.innerHTML = `
    <div class="spinner"></div>
    <p>Loading...</p>
  `;
  container.innerHTML = '';
  container.appendChild(loader);
}

/**
 * Show error message
 */
export function showError(container, message) {
  container.innerHTML = `
    <div class="error-message">
      <p>❌ ${message}</p>
      <button onclick="location.reload()" class="btn">Retry</button>
    </div>
  `;
}

/**
 * Lazy load images
 */
export function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(element, offset = 70) {
  const targetPosition = element.offsetTop - offset;
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

/**
 * Get query parameter from URL
 */
export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Set query parameter in URL
 */
export function setQueryParam(param, value) {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.pushState({}, '', url);
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Group array by key
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

/**
 * Sort array by key
 */
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    }
    return a[key] < b[key] ? 1 : -1;
  });
}

/**
 * Filter array by search term
 */
export function searchFilter(array, searchTerm, keys) {
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return keys.some(key => {
      const value = item[key];
      if (Array.isArray(value)) {
        return value.some(v => v.toLowerCase().includes(term));
      }
      return String(value).toLowerCase().includes(term);
    });
  });
}