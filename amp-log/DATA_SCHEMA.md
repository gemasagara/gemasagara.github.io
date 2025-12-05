# Portfolio Data Schema Documentation

This document defines the JSON schema for all content data files used in the portfolio. These schemas are designed to support both the frontend rendering and the admin panel for content management.

## Base Metadata Fields (All Content Types)

Every content item includes these base metadata fields for admin panel compatibility:

```json
{
  "id": "string",                      // Unique identifier (kebab-case, e.g., "award-2025-mrc")
  "createdAt": "ISO 8601 string",      // Creation timestamp
  "lastModified": "ISO 8601 string",   // Last modification timestamp
  "visibility": "published|draft|hidden", // Content visibility status
  "order": "integer"                   // Sort order (ascending)
}
```

---

## 1. Projects (`data/projects.json`)

Array of project objects.

### Schema

```json
[
  {
    "id": "string",                    // Unique identifier
    "title": "string",                 // Project title
    "category": "string",              // Category (e.g., "Robotics", "Rocketry")
    "year": "string",                  // Year or date range (e.g., "2025", "24/25")
    "thumbnail": "string",             // Image path
    "tagline": "string",               // Short description (HTML allowed)
    "featured": "boolean",             // Show in initial featured section
    "tags": ["string"],                // Array of tags for filtering/search
    "detailsPage": "string",           // URL to detailed project page
    "order": "integer",
    "visibility": "published|draft|hidden",
    "createdAt": "ISO 8601 string",
    "lastModified": "ISO 8601 string"
  }
]
```

### Example

```json
{
  "id": "autonomous-rover-2025",
  "title": "Autonomous Farming Rover",
  "category": "Robotics & Research",
  "year": "2025",
  "thumbnail": "./images/rover2.png",
  "tagline": "Develop a fully autonomous cropfield monitoring robot for root-vegetables.",
  "featured": true,
  "tags": ["Robotics", "Machine Learning", "Agriculture"],
  "detailsPage": "view-details.html?project=project-rover",
  "order": 1,
  "visibility": "published",
  "createdAt": "2025-01-15T10:30:00Z",
  "lastModified": "2025-01-20T14:45:00Z"
}
```

---

## 2. Awards (`data/awards.json`)

Array of award objects.

### Schema

```json
[
  {
    "id": "string",                    // Unique identifier
    "year": "string",                  // Year or season (e.g., "2025", "24/25")
    "backgroundImage": "string",       // Image path for background
    "title": "string",                 // Award title
    "description": "string",           // Detailed description (HTML allowed)
    "link": "string",                  // URL (internal or external)
    "external": "boolean",             // Open in new tab if true
    "order": "integer",
    "visibility": "published|draft|hidden",
    "createdAt": "ISO 8601 string",
    "lastModified": "ISO 8601 string"
  }
]
```

### Example

```json
{
  "id": "award-mrc-2025",
  "year": "2025",
  "backgroundImage": "./images/mrc.jpeg",
  "title": "3rd Winner Innovative Creation. Madrasah Robotic Competition",
  "description": "Won 3rd place out of 170+ teams in the Innovative Creation category.",
  "link": "view-details.html",
  "external": false,
  "order": 1,
  "visibility": "published",
  "createdAt": "2025-01-10T09:00:00Z",
  "lastModified": "2025-01-10T09:00:00Z"
}
```

---

## 3. Leadership (`data/leadership.json`)

Array of leadership/activity objects.

### Schema

```json
[
  {
    "id": "string",                    // Unique identifier
    "image": "string",                 // Image path
    "title": "string",                 // Position/role title
    "organization": "string",          // Organization or team name
    "year": "string",                  // Time period (e.g., "2024", "2023 - 2024")
    "description": "string",           // Description (HTML allowed)
    "order": "integer",
    "visibility": "published|draft|hidden",
    "createdAt": "ISO 8601 string",
    "lastModified": "ISO 8601 string"
  }
]
```

### Example

```json
{
  "id": "lead-representative",
  "image": "./images/twelve.jpeg",
  "title": "Representative",
  "organization": "Depok City Government @Musrenbangnas",
  "year": "2024",
  "description": "One of the representatives for Depok City Government presence in the 2024 National Development Planning Conference.",
  "order": 1,
  "visibility": "published",
  "createdAt": "2024-12-01T08:00:00Z",
  "lastModified": "2024-12-01T08:00:00Z"
}
```

---

## 4. Experiences (`data/experiences.json`)

Array of skill/experience objects.

### Schema

```json
[
  {
    "id": "string",                    // Unique identifier
    "duration": "string",              // Time duration (e.g., "5+ YEARS")
    "title": "string",                 // Skill/experience title
    "description": "string",           // Description (HTML allowed, <a> tags for links)
    "order": "integer",
    "visibility": "published|draft|hidden",
    "createdAt": "ISO 8601 string",
    "lastModified": "ISO 8601 string"
  }
]
```

### Example

```json
{
  "id": "exp-robotics",
  "duration": "5+ YEARS",
  "title": "Robotics",
  "description": "Design and construction of competitive robots for national and international <a href='https://www.firstinspires.org/robotics/ftc' target='_blank'>FIRST Tech Challenge</a> championships.",
  "order": 1,
  "visibility": "published",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastModified": "2024-01-01T00:00:00Z"
}
```

---

## 5. Teams (`data/teams.json`)

Array of team/organization objects.

### Schema

```json
[
  {
    "id": "string",                    // Unique identifier
    "name": "string",                  // Team/organization name
    "logo": "string",                  // Logo image path
    "description": "string",           // Short description
    "order": "integer",
    "visibility": "published|draft|hidden",
    "createdAt": "ISO 8601 string",
    "lastModified": "ISO 8601 string"
  }
]
```

### Example

```json
{
  "id": "team-tecrabot",
  "name": "#21573 Tecra Bot",
  "logo": "./images/tbt.png",
  "description": "Robotics Team",
  "order": 1,
  "visibility": "published",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastModified": "2024-01-01T00:00:00Z"
}
```

---

## 6. Navigation (`data/navigation.json`)

Navigation configuration object (not an array).

### Schema

```json
{
  "logo": {
    "image": "string",                 // Logo image path
    "text": "string"                   // Logo text
  },
  "items": [
    {
      "href": "string",                // Hash link (e.g., "#projects")
      "label": "string"                // Display label
    }
  ]
}
```

### Example

```json
{
  "logo": {
    "image": "./images/favicon_io/android-chrome-192x192.png",
    "text": "Gema Sagara"
  },
  "items": [
    { "href": "#home", "label": "Home" },
    { "href": "#about", "label": "About" },
    { "href": "#projects", "label": "Projects" }
  ]
}
```

---

## 7. Hero Section (`data/hero.json`)

Hero section configuration object.

### Schema

```json
{
  "name": "string",                    // Full name
  "subtitle": "string",                // Subtitle/tagline
  "description": "string",             // Hero description
  "cta": {
    "text": "string",                  // Call-to-action button text
    "href": "string"                   // Target link
  }
}
```

---

## 8. About Section (`data/about.json`)

About section configuration object.

### Schema

```json
{
  "image": "string",                   // Profile image path
  "name": "string",                    // Person's name
  "bio": ["string"],                   // Array of paragraphs
  "skills": [
    {
      "name": "string",                // Skill name
      "level": "integer"               // Proficiency level (0-100)
    }
  ]
}
```

---

## Data Validation Rules

### For Admin Panel Developers:

1. **Required Fields**: `id`, `title` (or `name`), `order`, `visibility`, `createdAt`
2. **ID Format**: kebab-case (e.g., "award-2025-mrc", "exp-robotics")
3. **Order**: Must be unique within the same data type
4. **Visibility**: Only "published" items are rendered on the frontend
5. **Timestamps**: ISO 8601 format (UTC preferred)
6. **HTML Content**: 
   - Safe tags: `<b>`, `<i>`, `<em>`, `<strong>`, `<a>`, `<br>`, `<p>`
   - Remove `<script>` tags
   - Use `parseHTML()` for rendering
7. **Image Paths**: Relative paths (e.g., "./images/...") or absolute URLs

---

## Notes for Development

- The frontend uses `sortBy()` helper to sort items by `order` field
- Missing metadata fields will be added with default values by the admin panel
- The `visibility` field allows drafting content without affecting the live site
- All timestamps are automatically managed by the admin panel
- HTML sanitization is handled by `sanitizeHTML()` and `parseHTML()` helpers
