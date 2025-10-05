// Your implementation code will go here
import { DragDrop } from './dragDrop.js';
import { BlogList } from './BlogList.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Drag & Drop
    const dragDropContainer = document.querySelector('.drag-drop-container');
    if (dragDropContainer) {
        const dragDrop = new DragDrop();
        dragDrop.init();
    }

    // Initialize Blog List (partial)
    const blogListContainer = document.querySelector('.blog-list-container');
    if (blogListContainer) {
        const blogList = new BlogList(blogListContainer);
        blogList.init();
    }

    // 1. Mobile Menu Setup
    const toggleButton = document.getElementById('menu-toggle');
    const navList = document.getElementById('nav-list');

    if (toggleButton && navList) {
        toggleButton.addEventListener('click', () => {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            
            // Toggle visibility classes and ARIA attribute
            navList.classList.toggle('is-open');
            toggleButton.setAttribute('aria-expanded', !isExpanded);
        });

        // Close menu when a link is clicked on mobile (optional but good UX)
        navList.querySelectorAll('.nav-tab').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navList.classList.remove('is-open');
                    toggleButton.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // 2. Dynamic Highlighting (Intersection Observer)
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.nav-tab');

    if (sections.length > 0 && navLinks.length > 0) {
        // Observer options: A rootMargin ensures the element is visible enough 
        // to be considered "in view" before highlighting
        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px 0px -50% 0px', // Highlight when section passes middle of viewport
            threshold: 0 // Observe as soon as any part is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const targetId = `#${entry.target.id}`;
                const correspondingLink = document.querySelector(`a[href="${targetId}"]`);

                if (correspondingLink) {
                    if (entry.isIntersecting) {
                        // Activate the link when the section enters the target zone
                        navLinks.forEach(link => link.classList.remove('active'));
                        correspondingLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        // Attach the observer to each section
        sections.forEach(section => {
            observer.observe(section);
        });
    }
});
