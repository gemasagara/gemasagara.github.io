// js/modules/renderer.js
import { logInfo, logError, showLoading, showError } from '../utils/helpers.js';
import { loadingTemplate, errorTemplate } from '../utils/templates.js';

class Renderer {
  /**
   * Render content to a container
   * @param {HTMLElement|string} container - DOM element or selector
   * @param {string} html - HTML string to render
   * @param {boolean} append - Append instead of replace
   */
  render(container, html, append = false) {
    const element = this.getElement(container);
    if (!element) {
      logError(`Container not found: ${container}`);
      return;
    }

    if (append) {
      element.insertAdjacentHTML('beforeend', html);
    } else {
      element.innerHTML = html;
    }
  }

  /**
   * Render array of items using template function
   * @param {HTMLElement|string} container
   * @param {Array} items
   * @param {Function} templateFn
   * @param {boolean} append
   */
  renderList(container, items, templateFn, append = false) {
    if (!Array.isArray(items) || items.length === 0) {
      logError('renderList: items must be a non-empty array');
      return;
    }

    const html = items.map(item => templateFn(item)).join('');
    this.render(container, html, append);
  }

  /**
   * Show loading state
   */
  showLoading(container) {
    this.render(container, loadingTemplate());
  }

  /**
   * Show error state
   */
  showError(container, message) {
    this.render(container, errorTemplate(message));
  }

  /**
   * Clear container
   */
  clear(container) {
    const element = this.getElement(container);
    if (element) {
      element.innerHTML = '';
    }
  }

  /**
   * Get DOM element from selector or element
   * @private
   */
  getElement(container) {
    if (typeof container === 'string') {
      return document.querySelector(container);
    }
    return container;
  }

  /**
   * Batch render with loading state
   */
  async renderWithLoading(container, fetchFn, renderFn) {
    const element = this.getElement(container);
    if (!element) {
      logError(`Container not found: ${container}`);
      return;
    }

    try {
      this.showLoading(element);
      const data = await fetchFn();
      renderFn(data);
      logInfo('Render complete');
    } catch (error) {
      logError('Render failed:', error);
      this.showError(element, 'Failed to load content. Please try again.');
    }
  }

  /**
   * Update single element's content
   */
  updateElement(selector, content) {
    const element = document.querySelector(selector);
    if (element) {
      if (element.tagName === 'IMG') {
        element.src = content;
      } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = content;
      } else {
        element.textContent = content;
      }
    }
  }

  /**
   * Update element attribute
   */
  updateAttribute(selector, attribute, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute(attribute, value);
    }
  }

  /**
   * Toggle class on element
   */
  toggleClass(selector, className) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.toggle(className);
    }
  }

  /**
   * Add class to element
   */
  addClass(selector, className) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add(className);
    }
  }

  /**
   * Remove class from element
   */
  removeClass(selector, className) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.remove(className);
    }
  }
}

// Create singleton instance
const renderer = new Renderer();

export default renderer;
export { Renderer };