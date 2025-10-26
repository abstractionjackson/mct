// Page definitions
const Pages = {
    landing() {
        return `
            <div class="onboarding">
                <div class="onboarding-content">
                    <h1>Media & Happiness Tracker</h1>
                    <p class="onboarding-description">
                        Track your daily media consumption and happiness levels to discover patterns and insights about how what you watch, read, and listen to affects your well-being.
                    </p>
                    <div class="onboarding-buttons">
                        <button onclick="Router.navigate('/dashboard')" class="action-button">Get Started</button>
                        <button onclick="Router.navigate('/example')" class="action-button secondary-button">See an Example</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    dashboard() {
        return `
            <div class="container">
                <div class="nav-buttons">
                    <button onclick="Router.navigate('/example')" class="action-button secondary-button">View Example</button>
                </div>
                
                <h1>Media & Happiness Tracker</h1>
                
                <div class="action-buttons">
                    <button id="openHappinessModal" class="action-button">Add Happiness Entry</button>
                    <button id="openMediaModal" class="action-button">Add Media Entry</button>
                </div>

                ${this._modals()}
                ${this._visualization()}
                ${this._entries()}
            </div>
        `;
    },
    
    example() {
        return `
            <div class="container">
                <div class="nav-buttons">
                    <button onclick="Router.navigate('/dashboard')" class="action-button secondary-button">← Back to Dashboard</button>
                </div>
                
                <h1>Media & Happiness Tracker <span class="demo-badge">(Example)</span></h1>
                
                <div class="action-buttons">
                    <button id="openHappinessModal" class="action-button">Add Happiness Entry</button>
                    <button id="openMediaModal" class="action-button">Add Media Entry</button>
                </div>

                ${this._modals()}
                ${this._visualization()}
                ${this._entries()}
            </div>
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
                        
                        <div id="suggestedSources"></div>
                        
                        <label>
                            Search Media:
                            <input type="text" id="mediaSearch" placeholder="Search existing media...">
                        </label>
                        
                        <div id="searchResults"></div>
                        
                        <div class="form-divider">OR</div>
                        
                        <label>
                            Media Name:
                            <input type="text" id="mediaName" required>
                        </label>
                        
                        <label>
                            Type:
                            <select id="mediaType" required>
                                <option value="">Select type</option>
                                <option value="Movie">Movie</option>
                                <option value="TV Show">TV Show</option>
                                <option value="Book">Book</option>
                                <option value="Podcast">Podcast</option>
                                <option value="Music">Music</option>
                                <option value="Video Game">Video Game</option>
                                <option value="Article">Article</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>
                        
                        <label>
                            Duration (minutes):
                            <input type="number" id="duration" min="1" required>
                        </label>
                        
                        <label>
                            Date:
                            <input type="date" id="mediaDate" required>
                        </label>
                        
                        <button type="submit">Add Media</button>
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
            <div id="visualization">
                <h2>Average Media Duration by Happiness Level</h2>
                <canvas id="chart"></canvas>
                <div id="stats"></div>
            </div>
        `;
    },
    
    _entries() {
        return `
            <div id="entries">
                <h2>Recent Data</h2>
                <div id="entriesList"></div>
            </div>
        `;
    }
};
