// Fetch and render blog gallery
async function loadBlogGallery() {
    try {
        const response = await fetch('./data/blogs.json');
        const blogs = await response.json();

        // Filter published blogs only
        const publishedBlogs = blogs.filter(blog => blog.published);

        // Separate featured and regular blogs
        const featuredBlogs = publishedBlogs.filter(blog => blog.featured);
        const regularBlogs = publishedBlogs.filter(blog => !blog.featured);

        // Sort regular blogs by date (newest first)
        regularBlogs.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render featured blogs
        const featuredSection = document.querySelector('.featured-posts-section');
        const featuredGrid = document.getElementById('featured-posts-grid');
        
        if (featuredBlogs.length > 0) {
            featuredGrid.innerHTML = featuredBlogs.map(blog => createBlogCard(blog, true)).join('');
            featuredSection.style.display = 'block';
        } else {
            featuredSection.style.display = 'none';
        }

        // Render all other blogs
        const postsGrid = document.getElementById('posts-grid');
        if (regularBlogs.length > 0) {
            postsGrid.innerHTML = regularBlogs.map(blog => createBlogCard(blog, false)).join('');
        } else {
            postsGrid.innerHTML = '<div class="loading-placeholder">No posts available</div>';
        }

        // Add click event listeners to cards
        document.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking on the direct link
                if (e.target.closest('.blog-card-link')) {
                    return;
                }
                const blogId = card.getAttribute('data-blog-id');
                navigateToBlog(blogId);
            });
        });

    } catch (error) {
        console.error('Error loading blog gallery:', error);
        document.getElementById('featured-posts-grid').innerHTML = '<div class="loading-placeholder">Error loading featured posts</div>';
        document.getElementById('posts-grid').innerHTML = '<div class="loading-placeholder">Error loading posts</div>';
    }
}

function createBlogCard(blog, isFeatured = false) {
    const hasThumbnail = blog.thumbnail && blog.thumbnail.trim() !== '';
    const thumbnail = hasThumbnail ? `./data/images${blog.thumbnail}` : '';
    const cardClass = isFeatured ? 'blog-card featured-card' : 'blog-card';
    const featuredBadge = isFeatured ? '<div class="featured-badge">Featured</div>' : '';
    const imageHTML = hasThumbnail ? `<img src="${thumbnail}" alt="${blog.title}">` : '<div class="blog-card-no-image"><span>📸</span></div>';
    
    // Truncate excerpt if too long
    const excerpt = blog.excerpt ? blog.excerpt.substring(0, 120) + (blog.excerpt.length > 120 ? '...' : '') : 'No description available';
    
    return `
        <div class="${cardClass}" data-blog-id="${blog.id}">
            ${featuredBadge}
            <div class="blog-card-image">
                ${imageHTML}
            </div>
            <div class="blog-card-content">
                <div class="blog-card-category">${blog.category}</div>
                <h3 class="blog-card-title">${blog.title}</h3>
                <p class="blog-card-excerpt">${excerpt}</p>
                <div class="blog-card-meta">
                    <span class="blog-card-date">
                        📅 ${formatDate(blog.date)}
                    </span>
                    <span class="blog-card-read-time">⏱️ ${blog.readTime}</span>
                </div>
                <a href="blog.html?project=${blog.id}" class="blog-card-link" data-link-type="blog-detail">Read More →</a>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function navigateToBlog(blogId) {
    window.location.href = `blog.html?project=${blogId}`;
}

// Load blog gallery when page is ready
document.addEventListener('DOMContentLoaded', loadBlogGallery);
