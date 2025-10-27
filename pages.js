// Page definitions
const Pages = {
    landing() {
        // Check if user has data to determine CTA text
        const hasData = localStorage.getItem('happinessRatings') || localStorage.getItem('mediaEntries');
        const ctaText = hasData ? 'Dashboard' : 'Get Started';
        
        return `
            <div class="onboarding">
                <div class="onboarding-content">
                    <h1>Media & Happiness Tracker</h1>
                    <p class="onboarding-description">
                        Track your daily media consumption and happiness levels to discover patterns and insights about how what you watch, read, and listen to affects your well-being.
                    </p>
                    <div class="onboarding-buttons">
                        <button onclick="Router.navigate('/dashboard')" class="action-button">${ctaText}</button>
                        <button onclick="Router.navigate('/example')" class="action-button secondary-button">See an Example</button>
                    </div>
                </div>
                ${this._footer()}
            </div>
        `;
    },
    
    dashboard() {
        return `
            ${this._navbar(false, true)}
            <div class="container">
                <div class="action-buttons">
                    <button id="openHappinessModal" class="action-button">Add Happiness Entry</button>
                    <button id="openMediaModal" class="action-button">Add Media Entry</button>
                    <button id="openSourceModal" class="action-button secondary-button">Add New Source</button>
                </div>

                ${this._modals()}
                ${this._visualization()}
                ${this._entries()}
            </div>
            ${this._footer()}
        `;
    },
    
    example() {
        return `
            ${this._navbar(true, false)}
            <div class="container">
                <h1>Media & Happiness Tracker <span class="demo-badge">(Example)</span></h1>
                
                <div class="action-buttons">
                    <button id="openHappinessModal" class="action-button">Add Happiness Entry</button>
                    <button id="openMediaModal" class="action-button">Add Media Entry</button>
                </div>

                ${this._modals()}
                ${this._visualization()}
                ${this._entries()}
            </div>
            ${this._footer()}
        `;
    },
    
    admin() {
        return `
            ${this._navbar(false, true)}
            <div class="container">
                <h1>Integrations</h1>
                <p>Connect your accounts to automatically import media data.</p>
                
                <div class="integrations-list">
                    <div class="integration-card">
                        <h3>IMDb</h3>
                        <p>Import your ratings and watchlist from IMDb.</p>
                        <button class="action-button secondary" disabled>Coming Soon</button>
                    </div>
                    
                    <div class="integration-card">
                        <h3>Goodreads</h3>
                        <p>Import your reading list from Goodreads.</p>
                        <button class="action-button" disabled>Coming Soon</button>
                    </div>
                </div>
            </div>
            ${this._footer()}
        `;
    },
    
    _navbar(showCTA = false, showAdmin = false) {
        let ctaHTML = '';
        if (showCTA) {
            // Check if user has data to determine CTA text
            const hasData = localStorage.getItem('happinessRatings') || localStorage.getItem('mediaEntries');
            const ctaText = hasData ? 'Dashboard' : 'Get Started';
            ctaHTML = `<a href="#/dashboard" class="navbar-cta">${ctaText}</a>`;
        }
        
        let adminHTML = '';
        if (showAdmin) {
            adminHTML = `<a href="#/admin" class="navbar-link">Integrations</a>`;
        }
        
        return `
            <nav class="navbar">
                <a href="#/dashboard" class="navbar-brand">Media & Happiness Tracker</a>
                <div class="navbar-right">
                    ${adminHTML}
                    ${ctaHTML}
                </div>
            </nav>
        `;
    },
    
    _footer() {
        return `
            <footer class="footer">
                <div class="sitemap">
                    <a href="#/landing?force=true">Home</a>
                    <a href="#/dashboard">Dashboard</a>
                    <a href="#/example">Example</a>
                    <a href="#/admin">Integrations</a>
                </div>
                <div class="copyright">
                    © ${new Date().getFullYear()} abstractionjackson
                </div>
            </footer>
        `;
    },
    
    _modals() {
        return `
            <div id="happinessModal" class="modal">
                <div class="modal-content">
                    <span class="close" data-modal="happinessModal">&times;</span>
                    <form id="happinessForm">
                        <h2>Daily Happiness Rating</h2>
                        <label>
                            Date:
                            <input type="date" id="happinessDate" required>
                        </label>
                        
                        <label>
                            Happiness:
                            <div class="happiness-slider-container">
                                <div class="happiness-scale">
                                    <span>2 (Very Happy)</span>
                                    <span>1</span>
                                    <span>0 (Neutral)</span>
                                    <span>-1</span>
                                    <span>-2 (Very Unhappy)</span>
                                </div>
                                <input type="range" id="happiness" min="-2" max="2" step="1" value="0" orient="vertical" required>
                                <div id="happinessValue">0</div>
                            </div>
                        </label>
                        
                        <button type="submit">Save Happiness</button>
                        <div id="happinessMessage"></div>
                    </form>
                </div>
            </div>

            <div id="mediaModal" class="modal">
                <div class="modal-content">
                    <span class="close" data-modal="mediaModal">&times;</span>
                    <form id="mediaForm">
                        <h2>Add Media Entry</h2>
                        
                        <label>
                            Select Source:
                            <input type="text" id="sourceSearch" placeholder="Search your media sources...">
                        </label>
                        
                        <div id="recentSources" class="recent-sources"></div>
                        <div id="sourceSearchResults" class="source-search-results"></div>
                        
                        <div class="form-divider">
                            <span>Don't see your source?</span>
                            <button type="button" class="action-button secondary-button" onclick="openAddSourceModal()">Add New Source</button>
                        </div>
                        
                        <input type="hidden" id="selectedSourceName">
                        <input type="hidden" id="selectedSourceType">
                        
                        <label>
                            Duration (minutes):
                            <input type="number" id="duration" min="1" required>
                        </label>
                        
                        <label>
                            Date:
                            <input type="date" id="mediaDate" required>
                        </label>
                        
                        <button type="submit">Add Entry</button>
                    </form>
                </div>
            </div>

            <div id="sourceModal" class="modal">
                <div class="modal-content">
                    <span class="close" data-modal="sourceModal">&times;</span>
                    <form id="sourceForm">
                        <h2>Add New Media Source</h2>
                        
                        <label>
                            Format:
                            <select id="sourceFormat" required>
                                <option value="">Select format</option>
                                <option value="Book">Book</option>
                                <option value="Movie">Movie</option>
                                <option value="TV Show">TV Show</option>
                                <option value="Music">Music</option>
                                <option value="Video">Video</option>
                                <option value="Podcast">Podcast</option>
                                <option value="Video Game">Video Game</option>
                                <option value="Article">Article</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>
                        
                        <label>
                            Search:
                            <input type="text" id="sourceAPISearch" placeholder="Search for book, movie, etc..." disabled>
                        </label>
                        
                        <div id="apiSearchResults"></div>
                        
                        <div class="form-divider">OR enter manually</div>
                        
                        <label>
                            Name:
                            <input type="text" id="sourceName" required>
                        </label>
                        
                        <div class="image-input-group">
                            <label>
                                Image URL:
                                <input type="url" id="sourceImageUrl" placeholder="https://example.com/image.jpg">
                            </label>
                            <span class="input-separator">OR</span>
                            <label class="file-upload-label">
                                <input type="file" id="sourceImageFile" accept="image/*" onchange="handleSourceImageUpload(event)">
                                <span class="file-upload-text">Choose Image</span>
                            </label>
                            <input type="hidden" id="sourceImageData">
                            <input type="hidden" id="sourceReference">
                        </div>
                        
                        <div class="modal-actions">
                            <button type="submit" name="action" value="saveAndAdd" class="action-button">Save and Add Entry</button>
                            <button type="submit" name="action" value="save" class="action-button secondary-button">Save</button>
                        </div>
                    </form>
                </div>
            </div>

            <div id="deleteModal" class="modal">
                <div class="modal-content delete-modal-content">
                    <h2 id="deleteModalMessage">Delete this item?</h2>
                    <div class="delete-modal-actions">
                        <button id="confirmDelete" class="action-button">Delete</button>
                        <button id="cancelDelete" class="action-button cancel-button">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    _visualization() {
        return `
            <div id="data-section">
                <div class="tab-switcher">
                    <button class="tab-button active" onclick="switchTab('entries')">Recent Data</button>
                    <button class="tab-button" onclick="switchTab('chart')">Chart</button>
                </div>
                
                <div id="entries-tab" class="tab-content active">
                    <div id="entriesList"></div>
                </div>
                
                <div id="chart-tab" class="tab-content">
                    <canvas id="chart"></canvas>
                    <div id="stats"></div>
                </div>
            </div>
        `;
    },
    
    _entries() {
        return '';
    }
};
