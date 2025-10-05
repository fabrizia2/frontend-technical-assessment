/**
 * @fileoverview Blog List Component
 * Completes: sorting, filtering, search, robust rendering, and control flow.
 */
export class BlogList {
    /**
     * @param {HTMLElement} container The main container element for the blog list.
     */
    constructor(container) {
        this.container = container;
        this.listContainer = container.querySelector('.blog-list-content');
        this.loadingIndicator = container.querySelector('.loading-indicator');
        this.errorContainer = container.querySelector('.error-container');

        this.sortSelect = container.querySelector('.sort-select');
        this.filterSelect = container.querySelector('.filter-select');
        this.searchInput = container.querySelector('.search-input');

        this.apiUrl = 'https://frontend-blog-lyart.vercel.app/blogsData.json';
        this.items = []; // Master list of all blogs
        this.filteredItems = []; // List after filtering/sorting
        this.page = 1;
        this.perPage = 10; // Required to display exactly 10 blogs

        // Bind handlers to ensure 'this' refers to the BlogList instance
        this.onControlChange = this.onControlChange.bind(this);
    }

    /**
     * Initializes the component by fetching data, setting listeners, and rendering.
     */
    async init() {
        try {
            this.showLoading();
            await this.fetchData();
            this.setupEventListeners();
            this.applyFiltersAndSorting(); // Initial render
        } catch (err) {
            this.showError(err);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Fetches blog data from the external API.
     */
    async fetchData() {
        try {
            const res = await fetch(this.apiUrl);
            if (!res.ok) throw new Error(`Failed to fetch blogs (Status: ${res.status})`);
            const data = await res.json();
            if (!Array.isArray(data)) throw new Error('Unexpected API response structure');
            this.items = data;
        } catch (error) {
            // Re-throw to be caught by the init() block
            throw new Error(`Data loading failed: ${error.message}`);
        }
    }

    /**
     * Sets up change and input listeners for all controls.
     */
    setupEventListeners() {
        this.sortSelect?.addEventListener('change', this.onControlChange);
        this.filterSelect?.addEventListener('change', this.onControlChange);
        
        // Debounced search input handler to prevent excessive function calls
        let searchTimer;
        this.searchInput?.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(this.onControlChange, 250);
        });
    }

    /**
     * Central handler for all control changes (sort, filter, search).
     */
    onControlChange() {
        // Reset pagination before applying new logic
        this.page = 1;
        this.applyFiltersAndSorting();
    }

    /**
     * Orchestrates and applies search, category filter, and sorting logic.
     */
    applyFiltersAndSorting() {
        let workingList = [...this.items];
        
        // 1. Apply Search Filter (by title)
        const searchTerm = (this.searchInput.value || '').toLowerCase();
        if (searchTerm) {
            workingList = workingList.filter(blog =>
                (blog.title || '').toLowerCase().includes(searchTerm)
            );
        }

        // 2. Apply Category Filter (Second Dropdown: Gadgets, Startups, Writing)
        const categoryFilter = this.filterSelect.value;
        if (categoryFilter) {
            // Note: The structure assumes 'category' is the property to filter
            workingList = workingList.filter(blog =>
                (blog.category === categoryFilter)
            );
        }

        // 3. Apply Sorting (First Dropdown: Date, Reading Time, Category)
        const sortType = this.sortSelect.value;
        if (sortType) {
            workingList.sort((a, b) => {
                switch (sortType) {
                    case 'date':
                        // Sort descending (newest first)
                        return new Date(b.published_date) - new Date(a.published_date);
                    case 'reading_time':
                        // Sort ascending (shortest time first), ensure values are treated as numbers
                        return (a.reading_time || 0) - (b.reading_time || 0);
                    case 'category':
                        // Sort alphabetically
                        return (a.category || '').localeCompare(b.category || '');
                    default:
                        return 0;
                }
            });
        }

        // Update the filtered list and render the first 10 items
        this.filteredItems = workingList;
        this.render();
    }

    /**
     * Clears and renders the current slice of blogs into the DOM, 
     * using all required fields from the assessment structure.
     */
    render() {
        const end = this.page * this.perPage;
        // Limit to 10 blogs as required at every given render
        const slice = this.filteredItems.slice(0, end); 
        this.listContainer.innerHTML = ''; // Clear previous content

        if (slice.length === 0) {
            this.listContainer.innerHTML = '<p class="no-results">No blogs found matching your criteria.</p>';
            return;
        }

        // Use array map and join to create the HTML string
        const html = slice.map(item => `
            <article class="blog-card">
                ${item.image ? `<img src="${item.image}" alt="${item.title}" class="blog-image" loading="lazy" />` : ''}
                <div class="blog-content">
                    <h3 class="blog-title">${item.title}</h3>
                    <p class="blog-excerpt">${(item.content || '').substring(0, 150)}...</p>
                    <div class="blog-meta">
                        <span class="blog-author">By ${item.author || 'Unknown'}</span>
                        <span class="blog-category">${item.category || 'General'}</span>
                        <span class="blog-reading-time">${item.reading_time || 5} min read</span>
                        <time class="blog-date">${new Date(item.published_date).toLocaleDateString()}</time>
                    </div>
                </div>
            </article>
        `).join('');

        this.listContainer.innerHTML = html;
    }

    /**
     * @private Helper to show loading state.
     */
    showLoading() {
        this.loadingIndicator?.classList.remove('hidden');
    }
    
    /**
     * @private Helper to hide loading state.
     */
    hideLoading() {
        this.loadingIndicator?.classList.add('hidden');
    }
    
    /**
     * @private Helper to display errors gracefully.
     * @param {Error} err The error object.
     */
    showError(err) {
        if (!this.errorContainer) return;
        this.errorContainer.classList.remove('hidden');
        this.errorContainer.textContent = `Error: ${err.message}. Please check the console for details.`;
        this.listContainer.innerHTML = ''; // Clear existing blogs
        this.hideLoading();
    }
}