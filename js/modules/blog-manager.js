/**
 * Blog Manager - Handles markdown file operations for blog posts
 */

class BlogManager {
  constructor() {
    this.basePath = "./data/blogs/posts/";
  }

  /**
   * Generate slug from blog title
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  /**
   * Create markdown frontmatter from blog metadata
   */
  createFrontmatter(blogData) {
    const frontmatter = [
      "---",
      `title: ${blogData.title}`,
      `date: ${blogData.date}`,
      `category: ${blogData.category}`,
    ];

    if (blogData.thumbnail) {
      frontmatter.push(`media: ${blogData.thumbnail}`);
    }

    if (blogData.tags && Array.isArray(blogData.tags)) {
      const tagsStr = blogData.tags.join(", ");
      frontmatter.push(`tags: [${tagsStr}]`);
    }

    if (blogData.author) {
      frontmatter.push(`author: ${blogData.author}`);
    }

    if (blogData.excerpt) {
      frontmatter.push(`tagline: ${blogData.excerpt}`);
    }

    if (blogData.featured) {
      frontmatter.push(`featured: ${blogData.featured}`);
    }

    if (blogData.published !== undefined) {
      frontmatter.push(`published: ${blogData.published}`);
    }

    if (blogData.externalLink) {
      frontmatter.push(`link: ${blogData.externalLink}`);
    }

    frontmatter.push("---");

    return frontmatter.join("\n");
  }

  /**
   * Generate complete markdown content
   */
  generateMarkdownContent(blogData, markdownContent) {
    const frontmatter = this.createFrontmatter(blogData);
    return `${frontmatter}\n\n${markdownContent}`;
  }

  /**
   * Extract frontmatter and content from markdown
   */
  parseMarkdownContent(markdown) {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!match) {
      return {
        frontmatter: {},
        content: markdown,
      };
    }

    const [, frontmatterStr, content] = match;

    // Parse YAML frontmatter
    const frontmatter = this.parseYAML(frontmatterStr);

    return {
      frontmatter,
      content: content.trim(),
    };
  }

  /**
   * Simple YAML parser for frontmatter
   */
  parseYAML(yaml) {
    const obj = {};
    const lines = yaml.split("\n");

    lines.forEach((line) => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // Parse arrays
        if (value.startsWith("[") && value.endsWith("]")) {
          value = value
            .slice(1, -1)
            .split(",")
            .map((v) => v.trim());
        }

        // Parse booleans
        if (value === "true") value = true;
        if (value === "false") value = false;

        obj[key] = value;
      }
    });

    return obj;
  }

  /**
   * Generate filename from blog ID
   */
  generateFilename(blogId) {
    return `${blogId}.md`;
  }

  /**
   * Save markdown content to simulated file (requires backend)
   * Note: Direct file writing from browser is not possible
   * This prepares data to be sent to a backend API
   */
  prepareBlogForSave(blogData, markdownContent) {
    const filename = this.generateFilename(blogData.id);
    const fullContent = this.generateMarkdownContent(blogData, markdownContent);

    return {
      filename: filename,
      filepath: `data/blogs/posts/${filename}`,
      content: fullContent,
      metadata: {
        id: blogData.id,
        title: blogData.title,
        date: blogData.date,
        category: blogData.category,
        excerpt: blogData.excerpt,
        readTime: blogData.readTime,
        featured: blogData.featured,
        published: blogData.published,
      },
    };
  }

  /**
   * Extract content from markdown (everything after frontmatter)
   */
  extractContent(markdown) {
    const parsed = this.parseMarkdownContent(markdown);
    return parsed.content;
  }

  /**
   * Estimate read time based on word count
   */
  estimateReadTime(content) {
    const wordCount = content.split(/\s+/).length;
    const readingSpeed = 200; // words per minute
    const minutes = Math.ceil(wordCount / readingSpeed);
    return `${minutes} min read`;
  }
}

export default new BlogManager();
