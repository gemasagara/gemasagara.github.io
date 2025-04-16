// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
});

// Scroll Animation
const fadeElements = document.querySelectorAll('.fade-in');

const fadeInOnScroll = () => {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
        
        if (isVisible) {
            element.classList.add('appear');
        }
    });
};

// Get URL parameters
function getProjectParam() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('project');
}

// Parse YAML frontmatter from markdown
function parseFrontMatter(markdown) {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = markdown.match(frontMatterRegex);
    
    if (!match) return { content: markdown, metadata: {} };
    
    const frontMatter = match[1];
    const content = markdown.replace(frontMatterRegex, '').trim();
    
    // Parse YAML into object
    const metadata = {};
    frontMatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            const value = valueParts.join(':').trim();
            metadata[key.trim()] = value;
        }
    });
    
    return { content, metadata };
}

// Load the markdown file and render it
async function loadProject() {
    const projectName = getProjectParam();
    
    if (!projectName) {
        displayError("No project specified");
        return;
    }
    
    try {
        const response = await fetch(`./content/${projectName}.md`);
        
        if (!response.ok) {
            throw new Error(`Failed to load project: ${response.statusText}`);
        }
        
        const markdown = await response.text();
        const { content, metadata } = parseFrontMatter(markdown);
        
        // Update page with metadata
        document.title = `${metadata.title || projectName} - Gema Sagara`;
        document.getElementById('project-title').textContent = metadata.title || projectName;
        document.getElementById('project-date').textContent = metadata.date || '';
        document.getElementById('project-category').textContent = metadata.category || '';
        document.getElementById('project-tagline').textContent = metadata.tagline || '';
        
        // Update main media
        if (metadata.media) {
            const mediaImg = document.getElementById('project-media');
            mediaImg.src = metadata.media;
            mediaImg.alt = metadata.title || projectName;
        }
        
        // Render content
        const contentHTML = marked.parse(content);
        document.getElementById('project-content').innerHTML = contentHTML;
        
        // Handle gallery if present
        const gallery = document.getElementById('project-gallery');
        gallery.innerHTML = ''; // Clear loading placeholder
        
        const galleryImages = [];
        for (let i = 1; i <= 10; i++) { // Support up to 10 gallery images
            const galleryKey = `gallery_${i}`;
            if (metadata[galleryKey]) {
                galleryImages.push(metadata[galleryKey]);
            }
        }
        
        if (galleryImages.length > 0) {
            galleryImages.forEach(imgSrc => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = `${metadata.title || projectName} Gallery Image`;
                
                galleryItem.appendChild(img);
                gallery.appendChild(galleryItem);
            });
        } else {
            // If no gallery images, hide the gallery section
            gallery.style.display = 'none';
        }
        
        // Load related projects (in a real implementation, you might want to fetch these separately)
        loadRelatedProjects(metadata.category);
        
    } catch (error) {
        console.error("Error loading project:", error);
        displayError("Failed to load project");
    }
}

// Display error message
function displayError(message) {
    document.getElementById('project-title').textContent = 'Error';
    document.getElementById('project-content').innerHTML = `<p class="error-message">${message}</p>`;
}

// Load related projects
async function loadRelatedProjects(category) {
    try {
        const currentProjectId = getProjectParam();
        const response = await fetch('./content/projects.json');
        
        if (!response.ok) {
            throw new Error('Failed to load projects');
        }
        
        const projects = await response.json();
        const relatedProjects = projects
            .filter(p => p.category === category && p.id !== currentProjectId)
            .slice(0, 2); // Get up to 2 related projects
        
        const relatedGrid = document.getElementById('related-grid');
        
        if (relatedProjects.length > 0) {
            relatedGrid.innerHTML = '';
            relatedProjects.forEach(project => {
                relatedGrid.innerHTML += `
                    <div class="related-card">
                        <div class="related-img" style="background-image: url('${project.media}');"></div>
                        <div class="related-info">
                            <div class="related-category">${project.category}</div>
                            <h3 class="related-title">${project.title}</h3>
                            <p>${project.summary}</p>
                            <a href="view-details.html?project=${project.id}" class="btn">View Details</a>
                        </div>
                    </div>
                `;
            });
        } else {
            document.getElementById('related-projects').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading related projects:', error);
        document.getElementById('related-projects').style.display = 'none';
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', () => {
    fadeInOnScroll();
    loadProject();
});

// Run on scroll
window.addEventListener('scroll', fadeInOnScroll);