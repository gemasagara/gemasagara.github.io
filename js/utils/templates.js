// js/utils/templates.js
import { parseHTML, sanitizeHTML } from './helpers.js';

/**
 * Project card template
 */
export function projectCardTemplate(project) {
  const isHidden = !project.featured ? 'hidden' : '';
  
  // Determine the details page URL - use linkedBlog if set, otherwise fallback to detailsPage
  let detailsUrl = '';
  if (project.linkedBlog) {
    detailsUrl = `view-details.html?project=${project.linkedBlog}`;
  } else if (project.detailsPage) {
    detailsUrl = project.detailsPage;
  }
  
  return `
    <div class="project-card fade-in ${isHidden}" data-project-id="${project.id}">
      <div class="project-img" style="background-image: url('${project.thumbnail}');"></div>
      <div class="project-info">
        <div class="project-category">${sanitizeHTML(project.category)} | ${project.year}</div>
        <h3 class="project-title">${sanitizeHTML(project.title)}</h3>
        <p>${parseHTML(project.tagline)}</p>
        <a href="${detailsUrl}" class="btn">View Details</a>
      </div>
    </div>
  `;
}

/**
 * Experience card template
 */
export function experienceCardTemplate(exp) {
  return `
    <div class="exp-card fade-in" data-exp-id="${exp.id}">
      <div class="exp-year">${sanitizeHTML(exp.duration)}</div>
      <div class="exp-info">
        <h3>${sanitizeHTML(exp.title)}</h3>
        <p>${parseHTML(exp.description)}</p>
      </div>
    </div>
  `;
}

/**
 * Leadership card template
 */
export function leadershipCardTemplate(leadership) {
  return `
    <div class="exp-card fade-in" data-leadership-id="${leadership.id}">
      <div class="exp-img" style="background-image: url('${leadership.image}');"></div>
      <div class="leadership-info">
        <h3>${sanitizeHTML(leadership.title)}</h3>
        <p class="leadership-tag">${sanitizeHTML(leadership.year)} | ${sanitizeHTML(leadership.organization)}</p>
        <p>${parseHTML(leadership.description)}</p>
      </div>
    </div>
  `;
}

/**
 * Team/Organization card template
 */
export function teamCardTemplate(team) {
  return `
    <div class="featured-card fade-in" data-team-id="${team.id}">
      <div class="featured-img-wrapper">
        <img src="${team.logo}" alt="${sanitizeHTML(team.name)}" class="featured-img" />
        <div class="color-overlay"></div>
      </div>
      <div class="featured-info">
        <p class="featured-name">${sanitizeHTML(team.name)}</p>
        <p>${sanitizeHTML(team.description)}</p>
      </div>
    </div>
  `;
}

/**
 * Award item template
 */
export function awardItemTemplate(award) {
  // Determine the link URL - use linkedBlog if set, otherwise fallback to link/externalLink
  let linkUrl = '';
  let linkTarget = '_self';
  
  if (award.linkedBlog) {
    linkUrl = `view-details.html?project=${award.linkedBlog}`;
  } else if (award.externalLink) {
    linkUrl = award.externalLink;
    linkTarget = '_blank';
  } else if (award.link) {
    linkUrl = award.link;
    linkTarget = award.external ? '_blank' : '_self';
  }
  
  return `
    <a href="${linkUrl}" target="${linkTarget}">
      <div class="award-item fade-in" data-award-id="${award.id}">
        <div class="award-year">
          <img src="${award.backgroundImage}" alt="Award decoration" class="award-year-image">
          <div class="award-year-overlay">${sanitizeHTML(award.year)}</div>
        </div>
        <div class="award-details">
          <h3 class="award-title">${sanitizeHTML(award.title)}</h3>
          <p class="award-description">${parseHTML(award.description)}</p>
        </div>
      </div>
    </a>
  `;
}

/**
 * Navigation item template
 */
export function navItemTemplate(item) {
  return `<li><a href="${item.href}">${sanitizeHTML(item.label)}</a></li>`;
}

/**
 * Skill bar template
 */
export function skillBarTemplate(skill) {
  return `
    <div class="skill">
      <div class="skill-name">${sanitizeHTML(skill.name)}</div>
      <div class="skill-bar">
        <div class="skill-level" style="width: ${skill.level}%;"></div>
      </div>
    </div>
  `;
}

/**
 * Loading spinner template
 */
export function loadingTemplate() {
  return `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading content...</p>
    </div>
  `;
}

/**
 * Error message template
 */
export function errorTemplate(message) {
  return `
    <div class="error-container">
      <p class="error-message">❌ ${sanitizeHTML(message)}</p>
      <button onclick="location.reload()" class="btn">Retry</button>
    </div>
  `;
}

/**
 * Empty state template
 */
export function emptyStateTemplate(message) {
  return `
    <div class="empty-state">
      <p>${sanitizeHTML(message)}</p>
    </div>
  `;
}

/**
 * Hero section template
 */
export function heroTemplate(hero) {
  return `
    <div class="hero-content">
      <div class="hero-image">
        <img src="./data/images/two.webp" alt="Profile Picture" class="hero-profile-img">
      </div>
      <div class="hero-text">
        <h1>${sanitizeHTML(hero.title)}</h1>
        <b>
          <p class="hero-subtitle">${sanitizeHTML(hero.subtitle)}</p>
        </b>
        <p class="hero-description">${parseHTML(hero.description)}</p>
        <a href="${hero.cta.link}" class="btn">${sanitizeHTML(hero.cta.text)}</a>
      </div>
    </div>
  `;
}

/**
 * About section content template
 */
export function aboutTemplate(about) {
  const bioHtml = about.bio.map(paragraph => `<p>${parseHTML(paragraph)}</p>`).join('');
  const skillsHtml = about.skills.map(skill => `
    <div class="skill">
      <div class="skill-name">${sanitizeHTML(skill.name)}</div>
      <div class="skill-bar">
        <div class="skill-level" style="width: ${skill.level}%;"></div>
      </div>
    </div>
  `).join('');

  return `
    <div class="about-content">
      <div class="about-image">
        <img src="${about.image}" alt="Profile Picture">
      </div>
      <div class="about-text">
        <h3>${sanitizeHTML(about.greeting)}</h3>
        ${bioHtml}
        <div class="skill-bars">
          ${skillsHtml}
        </div>
      </div>
    </div>
  `;
}