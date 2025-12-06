// Dark mode toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const body = document.body;

const moonIcon = './data/images/moon_stars_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';
const sunIcon = './data/images/light_mode_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';

// Check for saved theme preference, otherwise use system preference
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}

function enableDarkMode() {
    body.classList.add('dark-mode');
    themeIcon.src = sunIcon;
    localStorage.setItem('theme', 'dark');
}

function disableDarkMode() {
    body.classList.remove('dark-mode');
    themeIcon.src = moonIcon;
    localStorage.setItem('theme', 'light');
}

function toggleTheme() {
    if (body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// Initialize theme on page load
initTheme();

// Add click listener to toggle button
themeToggle.addEventListener('click', toggleTheme);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        e.matches ? enableDarkMode() : disableDarkMode();
    }
});
