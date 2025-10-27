// Data management
const HAPPINESS_KEY = 'happinessRatings';
const MEDIA_KEY = 'mediaEntries';
const SOURCES_KEY = 'mediaSources';

function loadHappiness() {
    const data = localStorage.getItem(HAPPINESS_KEY);
    return data ? JSON.parse(data) : [];
}

function saveHappiness(ratings) {
    localStorage.setItem(HAPPINESS_KEY, JSON.stringify(ratings));
}

function loadMedia() {
    const data = localStorage.getItem(MEDIA_KEY);
    return data ? JSON.parse(data) : [];
}

function saveMedia(entries) {
    localStorage.setItem(MEDIA_KEY, JSON.stringify(entries));
}

function loadSources() {
    const data = localStorage.getItem(SOURCES_KEY);
    return data ? JSON.parse(data) : [];
}

function saveSources(sources) {
    localStorage.setItem(SOURCES_KEY, JSON.stringify(sources));
}

function clearAllData() {
    localStorage.removeItem(HAPPINESS_KEY);
    localStorage.removeItem(MEDIA_KEY);
    localStorage.removeItem(SOURCES_KEY);
}

function addOrUpdateSource(name, type, imageUrl = null, reference = null) {
    const sources = loadSources();
    const existing = sources.find(s => s.name === name && s.type === type);
    
    if (existing) {
        existing.lastUsed = new Date().toISOString();
        existing.useCount = (existing.useCount || 0) + 1;
        if (imageUrl) existing.imageUrl = imageUrl;
        if (reference) {
            try {
                existing.reference = typeof reference === 'string' ? JSON.parse(reference) : reference;
            } catch (e) {
                console.error('Failed to parse reference:', e);
            }
        }
    } else {
        const newSource = {
            name: name,
            type: type,
            imageUrl: imageUrl,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            useCount: 1
        };
        
        if (reference) {
            try {
                newSource.reference = typeof reference === 'string' ? JSON.parse(reference) : reference;
            } catch (e) {
                console.error('Failed to parse reference:', e);
            }
        }
        
        sources.push(newSource);
    }
    
    saveSources(sources);
}

function getRecentSources(limit = 5) {
    const sources = loadSources();
    return sources
        .filter(s => s.lastUsed != null) // Only include sources that have been used
        .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
        .slice(0, limit);
}

function deleteSource(name, type) {
    const sources = loadSources();
    const filtered = sources.filter(s => !(s.name === name && s.type === type));
    saveSources(filtered);
}

function removeSourceFromRecents(name, type) {
    const sources = loadSources();
    const source = sources.find(s => s.name === name && s.type === type);
    if (source) {
        source.useCount = 0;
        source.lastUsed = null;
        saveSources(sources);
    }
}

function clearAllSources() {
    saveSources([]);
}

function clearRecentSourcesUsage() {
    const sources = loadSources();
    // Reset usage count and lastUsed for all sources, but keep the sources themselves
    sources.forEach(s => {
        s.useCount = 0;
        s.lastUsed = null;
    });
    saveSources(sources);
}

function searchSources(query) {
    const sources = loadSources();
    const lowerQuery = query.toLowerCase();
    return sources.filter(s => 
        s.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
}

function getDateString(date) {
    return date.toISOString().split('T')[0];
}

function formatDateHuman(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formatted = date.toLocaleDateString('en-US', options);
    
    // Add ordinal suffix to day
    const day = date.getDate();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';
    
    return formatted.replace(/(\d+),/, `$1${suffix},`);
}

function addHappiness(date, happiness) {
    const ratings = loadHappiness();
    const dateStr = getDateString(new Date(date));
    const existingIndex = ratings.findIndex(r => r.date === dateStr);
    
    if (existingIndex >= 0) {
        ratings[existingIndex].happiness = happiness;
        ratings[existingIndex].updatedAt = new Date().toISOString();
    } else {
        ratings.push({
            date: dateStr,
            happiness: happiness,
            createdAt: new Date().toISOString()
        });
    }
    
    saveHappiness(ratings);
    return existingIndex >= 0 ? 'updated' : 'created';
}

function deleteHappiness(date) {
    const ratings = loadHappiness();
    const filtered = ratings.filter(r => r.date !== date);
    saveHappiness(filtered);
}

function addMedia(entry) {
    const media = loadMedia();
    entry.id = Date.now();
    entry.date = getDateString(new Date(entry.date));
    entry.createdAt = new Date().toISOString();
    media.push(entry);
    saveMedia(media);
    
    // Update source tracking
    addOrUpdateSource(entry.name, entry.type);
    
    return media;
}

function deleteMedia(id) {
    const media = loadMedia();
    const filtered = media.filter(m => m.id !== id);
    saveMedia(filtered);
}

// Form handling
function setupFormHandlers() {
    const happinessForm = document.getElementById('happinessForm');
    const mediaForm = document.getElementById('mediaForm');
    const sourceForm = document.getElementById('sourceForm');
    
    if (!happinessForm || !mediaForm) return;
    
    // Remove old listeners by cloning
    const newHappinessForm = happinessForm.cloneNode(true);
    happinessForm.parentNode.replaceChild(newHappinessForm, happinessForm);
    
    const newMediaForm = mediaForm.cloneNode(true);
    mediaForm.parentNode.replaceChild(newMediaForm, mediaForm);
    
    if (sourceForm) {
        const newSourceForm = sourceForm.cloneNode(true);
        sourceForm.parentNode.replaceChild(newSourceForm, sourceForm);
    }
    
    document.getElementById('happinessForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const date = document.getElementById('happinessDate').value;
        const happiness = parseInt(document.getElementById('happiness').value);
        
        const action = addHappiness(date, happiness);
        
        const message = document.getElementById('happinessMessage');
        message.textContent = action === 'updated' 
            ? 'Happiness rating updated for this date' 
            : 'Happiness rating saved';
        message.className = 'success';
        
        setTimeout(() => {
            message.textContent = '';
            message.className = '';
            
            // Reset date to today for next open
            const today = getDateString(new Date());
            document.getElementById('happinessDate').value = today;
            
            closeModal('happinessModal');
        }, 2000);
        
        render();
        updateHappinessButton();
    });

    // Media entry form - simplified to just select source and duration
    document.getElementById('mediaForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const sourceName = document.getElementById('selectedSourceName').value;
        const sourceType = document.getElementById('selectedSourceType').value;
        
        if (!sourceName || !sourceType) {
            alert('Please select a media source');
            return;
        }
        
        const entry = {
            name: sourceName,
            type: sourceType,
            duration: parseInt(document.getElementById('duration').value),
            date: document.getElementById('mediaDate').value
        };
        
        addMedia(entry);
        
        // Update source last used
        const sources = loadSources();
        const source = sources.find(s => s.name === sourceName && s.type === sourceType);
        if (source) {
            source.lastUsed = new Date().toISOString();
            source.useCount = (source.useCount || 0) + 1;
            saveSources(sources);
        }
        
        e.target.reset();
        document.getElementById('sourceSearchResults').innerHTML = '';
        document.getElementById('recentSources').innerHTML = '';
        
        // Reset date to today for next open
        const today = getDateString(new Date());
        document.getElementById('mediaDate').value = today;
        
        closeModal('mediaModal');
        render();
    });

    // Source search in media form
    document.getElementById('sourceSearch').addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            document.getElementById('sourceSearchResults').innerHTML = '';
            showRecentSources();
            return;
        }
        
        const results = searchSources(query);
        
        if (results.length === 0) {
            document.getElementById('sourceSearchResults').innerHTML = '<div class="search-result-empty">No matches found. Add a new source below.</div>';
            return;
        }
        
        document.getElementById('sourceSearchResults').innerHTML = results.map(source => `
            <div class="source-result" onclick="selectSourceForEntry('${source.name.replace(/'/g, "\\'")}', '${source.type}')">
                ${source.imageUrl ? `<img src="${source.imageUrl}" alt="${source.name}" class="source-result-image">` : ''}
                <div class="source-result-info">
                    <strong>${source.name}</strong>
                    <div class="source-result-type">${source.type}</div>
                </div>
            </div>
        `).join('');
    });

    // Source form - for adding new sources with API integration
    if (document.getElementById('sourceForm')) {
        document.getElementById('sourceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const action = e.submitter?.value || 'save';
            
            const name = document.getElementById('sourceName').value;
            const format = document.getElementById('sourceFormat').value;
            const imageUrl = document.getElementById('sourceImageUrl')?.value || document.getElementById('sourceImageData')?.value || null;
            const reference = document.getElementById('sourceReference')?.value || null;
            
            addOrUpdateSource(name, format, imageUrl, reference);
            
            e.target.reset();
            document.getElementById('apiSearchResults').innerHTML = '';
            
            closeModal('sourceModal');
            
            // If "Save and Add Entry" was clicked, open media modal with this source selected
            if (action === 'saveAndAdd') {
                setTimeout(() => {
                    selectSourceForEntry(name, format);
                    openModal('mediaModal');
                }, 100);
            }
        });

        // Format change handler for source form
        document.getElementById('sourceFormat').addEventListener('change', (e) => {
            const format = e.target.value;
            const searchInput = document.getElementById('sourceAPISearch');
            
            if (format && format !== 'Other') {
                searchInput.disabled = false;
                searchInput.placeholder = `Search for ${format.toLowerCase()}...`;
            } else {
                searchInput.disabled = true;
                searchInput.placeholder = 'Select a format to search';
                searchInput.value = '';
                document.getElementById('apiSearchResults').innerHTML = '';
            }
        });

        // API search in source form
        let searchTimeout;
        document.getElementById('sourceAPISearch').addEventListener('input', async (e) => {
            const query = e.target.value.trim();
            const format = document.getElementById('sourceFormat').value;
            
            console.log('Search triggered:', { query, format });
            
            clearTimeout(searchTimeout);
            
            if (query.length < 2 || !format) {
                console.log('Search skipped: query too short or no format selected');
                document.getElementById('apiSearchResults').innerHTML = '';
                return;
            }
            
            document.getElementById('apiSearchResults').innerHTML = '<div class="search-loading">Searching...</div>';
            
            searchTimeout = setTimeout(async () => {
                console.log('Calling searchMediaByFormat:', format, query);
                const results = await searchMediaByFormat(format, query);
                
                console.log('Results returned from searchMediaByFormat:', results);
                
                if (results.length === 0) {
                    document.getElementById('apiSearchResults').innerHTML = '<div class="search-result-empty">No matches found. Enter details manually below.</div>';
                    return;
                }
                
                document.getElementById('apiSearchResults').innerHTML = results.map((result, index) => {
                    let subtitle = '';
                    if (format === 'Book') {
                        subtitle = `${result.author}${result.year ? ` (${result.year})` : ''}`;
                    } else if (format === 'Movie') {
                        subtitle = result.year ? `${result.year}` : '';
                    }
                    
                    return `
                        <div class="search-result" onclick="selectAPIResultForSource(${index})">
                            ${result.coverUrl ? `<img src="${result.coverUrl}" alt="${result.title}" class="search-result-image">` : ''}
                            <div class="search-result-info">
                                <strong>${result.title}</strong>
                                ${subtitle ? `<div class="search-result-subtitle">${subtitle}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                
                console.log('Rendered', results.length, 'results to DOM');
                
                // Store results for selection
                window.currentSourceAPIResults = results;
            }, 500);
        });
    }

    // Set default dates to today
    const today = getDateString(new Date());
    document.getElementById('happinessDate').value = today;
    document.getElementById('mediaDate').value = today;

    // Update happiness value display
    const happinessSlider = document.getElementById('happiness');
    const happinessValue = document.getElementById('happinessValue');

    if (happinessSlider && happinessValue) {
        happinessSlider.addEventListener('input', (e) => {
            happinessValue.textContent = e.target.value;
        });
        happinessValue.textContent = happinessSlider.value;
    }
    
    // Show recent sources when media modal opens
    showRecentSources();
}

function selectAPIResultForSource(index) {
    const result = window.currentSourceAPIResults[index];
    
    document.getElementById('sourceName').value = result.title;
    
    if (result.coverUrl) {
        document.getElementById('sourceImageUrl').value = result.coverUrl;
    }
    
    if (result.reference) {
        document.getElementById('sourceReference').value = JSON.stringify(result.reference);
    }
    
    document.getElementById('sourceAPISearch').value = '';
    document.getElementById('apiSearchResults').innerHTML = '';
    document.getElementById('sourceName').focus();
}

window.selectAPIResultForSource = selectAPIResultForSource;

function selectSourceForEntry(name, type) {
    document.getElementById('selectedSourceName').value = name;
    document.getElementById('selectedSourceType').value = type;
    document.getElementById('sourceSearch').value = '';
    document.getElementById('sourceSearchResults').innerHTML = '';
    
    // Show selected source
    const sources = loadSources();
    const source = sources.find(s => s.name === name && s.type === type);
    
    if (source) {
        const display = `
            <div class="selected-source">
                ${source.imageUrl ? `<img src="${source.imageUrl}" alt="${name}" class="selected-source-image">` : ''}
                <div>
                    <strong>${name}</strong>
                    <div class="source-type">${type}</div>
                </div>
                <button type="button" onclick="clearSelectedSource()" class="clear-selection">×</button>
            </div>
        `;
        document.getElementById('recentSources').innerHTML = display;
    }
    
    document.getElementById('duration').focus();
}

window.selectSourceForEntry = selectSourceForEntry;

function clearSelectedSource() {
    document.getElementById('selectedSourceName').value = '';
    document.getElementById('selectedSourceType').value = '';
    showRecentSources();
}

window.clearSelectedSource = clearSelectedSource;

function showRecentSources() {
    const recent = getRecentSources(10);
    
    if (recent.length === 0) {
        document.getElementById('recentSources').innerHTML = '<p class="no-sources">No media sources yet. Add one to get started!</p>';
        return;
    }
    
    document.getElementById('recentSources').innerHTML = `
        <div class="recent-sources-label">Recent Sources:</div>
        <div class="recent-sources-grid">
            ${recent.map(source => `
                <div class="source-card" onclick="selectSourceForEntry('${source.name.replace(/'/g, "\\'")}', '${source.type}')">
                    ${source.imageUrl ? `<img src="${source.imageUrl}" alt="${source.name}" class="source-card-image">` : '<div class="source-card-placeholder"></div>'}
                    <div class="source-card-name">${source.name}</div>
                    <div class="source-card-type">${source.type}</div>
                </div>
            `).join('')}
        </div>
    `;
}

window.showRecentSources = showRecentSources;

function openAddSourceModal() {
    closeModal('mediaModal');
    openModal('sourceModal');
}

window.openAddSourceModal = openAddSourceModal;

function handleSourceImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 500000) {
        alert('Image too large. Please choose an image under 500KB.');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('sourceImageData').value = e.target.result;
        document.getElementById('sourceImageUrl').value = '';
        
        const label = event.target.parentElement.querySelector('.file-upload-text');
        if (label) label.textContent = file.name;
    };
    reader.readAsDataURL(file);
}

window.handleSourceImageUpload = handleSourceImageUpload;

function selectAPIResult(index) {
    const result = window.currentSearchResults[index];
    const format = document.getElementById('mediaFormat').value;
    
    document.getElementById('mediaName').value = result.title;
    
    if (result.coverUrl) {
        document.getElementById('mediaImageUrl').value = result.coverUrl;
    }
    
    if (result.reference) {
        document.getElementById('mediaReference').value = JSON.stringify(result.reference);
    }
    
    document.getElementById('mediaSearch').value = '';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('duration').focus();
}

window.selectAPIResult = selectAPIResult;

function selectSource(name, type) {
    document.getElementById('mediaName').value = name;
    document.getElementById('mediaFormat').value = type;
    document.getElementById('mediaSearch').value = '';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('duration').focus();
}

window.selectSource = selectSource;

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        // Scroll modal content to top
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) modalContent.scrollTop = 0;
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function renderSuggestedSources() {
    const recent = getRecentSources();
    
    if (recent.length === 0) {
        document.getElementById('suggestedSources').innerHTML = '';
        return;
    }
    
    document.getElementById('suggestedSources').innerHTML = `
        <div class="suggested-sources">
            <div class="suggested-header">
                <label>Recently Used:</label>
                <button type="button" class="clear-sources-btn" onclick="handleClearSources()">Clear All</button>
            </div>
            <div class="suggested-list">
                ${recent.map(source => `
                    <div class="suggested-source-wrapper">
                        <button type="button" class="suggested-source" onclick="selectSource('${source.name.replace(/'/g, "\\'")}', '${source.type}')">
                            ${source.name} <span class="source-type">(${source.type})</span>
                        </button>
                        <button type="button" class="remove-source-btn" onclick="handleRemoveSource('${source.name.replace(/'/g, "\\'")}', '${source.type}')" title="Remove">×</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.handleRemoveSource = function(name, type) {
    removeSourceFromRecents(name, type);
    renderSuggestedSources();
};

window.handleClearSources = function() {
    if (confirm('Clear recent sources list? (Sources will still be available via search)')) {
        clearRecentSourcesUsage();
        renderSuggestedSources();
    }
};

// Modal handling
function setupModalHandlers() {
    const openHappinessBtn = document.getElementById('openHappinessModal');
    const openMediaBtn = document.getElementById('openMediaModal');
    const openSourceBtn = document.getElementById('openSourceModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    
    if (openHappinessBtn) {
        openHappinessBtn.onclick = () => {
            // Reset date to today when opening
            const today = getDateString(new Date());
            document.getElementById('happinessDate').value = today;
            openModal('happinessModal');
        };
    }
    
    if (openMediaBtn) {
        openMediaBtn.onclick = () => {
            // Reset date to today when opening
            const today = getDateString(new Date());
            document.getElementById('mediaDate').value = today;
            document.getElementById('sourceSearch').value = '';
            document.getElementById('sourceSearchResults').innerHTML = '';
            document.getElementById('selectedSourceName').value = '';
            document.getElementById('selectedSourceType').value = '';
            showRecentSources();
            openModal('mediaModal');
        };
    }
    
    if (openSourceBtn) {
        openSourceBtn.onclick = () => {
            openModal('sourceModal');
        };
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.onclick = () => {
            if (deleteAction) {
                deleteAction();
                deleteAction = null;
            }
            closeModal('deleteModal');
        };
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.onclick = () => {
            deleteAction = null;
            closeModal('deleteModal');
        };
    }

    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = (e) => {
            const modalId = e.target.getAttribute('data-modal');
            closeModal(modalId);
        };
    });

    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    };
}

// Update happiness button text based on today's entry
function updateHappinessButton() {
    const today = getDateString(new Date());
    const happiness = loadHappiness();
    const todayEntry = happiness.find(h => h.date === today);
    const button = document.getElementById('openHappinessModal');
    if (button) {
        button.textContent = todayEntry ? 'Update Happiness Entry' : 'Add Happiness Entry';
    }
}

// Visualization
function drawChart(happiness, media) {
    const canvas = document.getElementById('chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    
    if (happiness.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No happiness ratings yet', width / 2, height / 2);
        return;
    }
    
    // Aggregate media duration by date
    const durationByDate = {};
    media.forEach(m => {
        durationByDate[m.date] = (durationByDate[m.date] || 0) + m.duration;
    });
    
    // Calculate average duration for each happiness level (-2 to 2)
    const happinessLevels = [-2, -1, 0, 1, 2];
    const avgDurationByHappiness = {};
    
    happinessLevels.forEach(level => {
        const daysWithLevel = happiness.filter(h => h.happiness === level);
        if (daysWithLevel.length > 0) {
            const totalDuration = daysWithLevel.reduce((sum, h) => {
                return sum + (durationByDate[h.date] || 0);
            }, 0);
            avgDurationByHappiness[level] = totalDuration / daysWithLevel.length;
        } else {
            avgDurationByHappiness[level] = 0;
        }
    });
    
    // Setup chart dimensions
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Find max duration for scaling
    const maxDuration = Math.max(...Object.values(avgDurationByHappiness), 100);
    
    // Draw axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#000';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Average Media Duration (minutes)', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Happiness Level', 0, 0);
    ctx.restore();
    
    // Draw happiness scale (Y axis)
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    
    happinessLevels.forEach((level, index) => {
        const y = height - padding - (index / (happinessLevels.length - 1)) * chartHeight;
        ctx.fillText(level.toString(), padding - 10, y + 3);
        
        // Grid lines
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    });
    
    // Draw duration scale (X axis)
    ctx.textAlign = 'center';
    const durationSteps = 5;
    for (let i = 0; i <= durationSteps; i++) {
        const dur = (maxDuration / durationSteps) * i;
        const x = padding + (i / durationSteps) * chartWidth;
        ctx.fillText(Math.round(dur).toString(), x, height - padding + 20);
    }
    
    // Draw horizontal bars
    const barHeight = chartHeight / (happinessLevels.length * 1.5);
    
    happinessLevels.forEach((level, index) => {
        const duration = avgDurationByHappiness[level];
        const barWidth = (duration / maxDuration) * chartWidth;
        const y = height - padding - (index / (happinessLevels.length - 1)) * chartHeight - barHeight / 2;
        const x = padding;
        
        // Draw bar
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw value at end of bar if there's data
        if (duration > 0) {
            ctx.fillStyle = '#000';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(Math.round(duration).toString(), x + barWidth + 5, y + barHeight / 2 + 3);
        }
    });
}

function calculateStats(happiness, media) {
    if (happiness.length === 0) {
        return '<div class="stat-row">No happiness data yet</div>';
    }
    
    const durationByDate = {};
    media.forEach(m => {
        durationByDate[m.date] = (durationByDate[m.date] || 0) + m.duration;
    });
    
    const dataPoints = happiness.map(h => ({
        happiness: h.happiness,
        duration: durationByDate[h.date] || 0
    }));
    
    const avgHappiness = dataPoints.reduce((sum, d) => sum + d.happiness, 0) / dataPoints.length;
    const avgDuration = dataPoints.reduce((sum, d) => sum + d.duration, 0) / dataPoints.length;
    const totalDuration = media.reduce((sum, m) => sum + m.duration, 0);
    
    // Calculate correlation coefficient
    let sumXY = 0, sumX2 = 0, sumY2 = 0;
    dataPoints.forEach(d => {
        const dx = d.duration - avgDuration;
        const dy = d.happiness - avgHappiness;
        sumXY += dx * dy;
        sumX2 += dx * dx;
        sumY2 += dy * dy;
    });
    
    const correlation = sumX2 * sumY2 === 0 ? 0 : sumXY / Math.sqrt(sumX2 * sumY2);
    
    return `
        <div class="stat-row"><strong>Days Tracked:</strong> ${happiness.length}</div>
        <div class="stat-row"><strong>Total Media Entries:</strong> ${media.length}</div>
        <div class="stat-row"><strong>Total Duration:</strong> ${totalDuration} minutes (${(totalDuration / 60).toFixed(1)} hours)</div>
        <div class="stat-row"><strong>Average Happiness:</strong> ${avgHappiness.toFixed(2)}</div>
        <div class="stat-row"><strong>Average Daily Duration:</strong> ${avgDuration.toFixed(1)} minutes</div>
        <div class="stat-row"><strong>Correlation:</strong> ${correlation.toFixed(3)} ${correlation > 0.3 ? '(positive)' : correlation < -0.3 ? '(negative)' : '(weak)'}</div>
    `;
}

function renderEntries(happiness, media) {
    const list = document.getElementById('entriesList');
    
    if (happiness.length === 0 && media.length === 0) {
        list.innerHTML = '<p>No data yet</p>';
        return;
    }
    
    // Load sources for image lookup
    const sources = loadSources();
    const sourceMap = {};
    sources.forEach(s => {
        const key = `${s.name}-${s.type}`;
        sourceMap[key] = s;
    });
    
    // Group by date
    const dateMap = {};
    
    happiness.forEach(h => {
        if (!dateMap[h.date]) {
            dateMap[h.date] = { happiness: null, media: [] };
        }
        dateMap[h.date].happiness = h.happiness;
    });
    
    media.forEach(m => {
        if (!dateMap[m.date]) {
            dateMap[m.date] = { happiness: null, media: [] };
        }
        dateMap[m.date].media.push(m);
    });
    
    const dates = Object.keys(dateMap).sort().reverse();
    
    list.innerHTML = dates.map(date => {
        const data = dateMap[date];
        const totalDuration = data.media.reduce((sum, m) => sum + m.duration, 0);
        const happinessText = data.happiness !== null 
            ? `Happiness: ${data.happiness}` 
            : 'No happiness rating';
        const happinessButton = data.happiness !== null
            ? `<button class="delete-btn" onclick="handleDeleteHappiness('${date}')">Delete</button>`
            : `<button class="update-btn" onclick="handleUpdateHappiness('${date}')">Update</button>`;
        
        return `
            <div class="day-group">
                <div class="day-header">
                    <span>${formatDateHuman(date)} • ${happinessText} • ${totalDuration} min total</span>
                    ${happinessButton}
                </div>
                ${data.media.length > 0 ? data.media.map(m => {
                    const sourceKey = `${m.name}-${m.type}`;
                    const source = sourceMap[sourceKey];
                    const thumbnail = source?.imageUrl 
                        ? `<img src="${source.imageUrl}" alt="${m.name}" class="media-thumbnail">` 
                        : '';
                    
                    return `
                        <div class="media-item">
                            ${thumbnail}
                            <div class="media-item-content">
                                <strong>${m.name}</strong> (${m.type}, ${m.duration} min)
                            </div>
                            <button class="delete-btn" onclick="handleDeleteMedia(${m.id})">Delete</button>
                        </div>
                    `;
                }).join('') : '<div class="media-item">No media entries</div>'}
            </div>
        `;
    }).join('');
}

// Global handlers for delete buttons
let deleteAction = null;

window.handleDeleteHappiness = function(date) {
    deleteAction = () => {
        deleteHappiness(date);
        render();
        updateHappinessButton();
    };
    document.getElementById('deleteModalMessage').textContent = `Delete happiness rating for ${formatDateHuman(date)}?`;
    openModal('deleteModal');
};

window.handleUpdateHappiness = function(date) {
    document.getElementById('happinessDate').value = date;
    openModal('happinessModal');
};

window.handleDeleteMedia = function(id) {
    deleteAction = () => {
        deleteMedia(id);
        render();
    };
    document.getElementById('deleteModalMessage').textContent = 'Delete this media entry?';
    openModal('deleteModal');
};

function render() {
    const happiness = loadHappiness();
    const media = loadMedia();
    drawChart(happiness, media);
    const statsEl = document.getElementById('stats');
    const entriesEl = document.getElementById('entriesList');
    if (statsEl) statsEl.innerHTML = calculateStats(happiness, media);
    if (entriesEl) renderEntries(happiness, media);
}

function updateHappinessButton() {
    const today = getDateString(new Date());
    const happiness = loadHappiness();
    const todayEntry = happiness.find(h => h.date === today);
    const button = document.getElementById('openHappinessModal');
    if (button) {
        button.textContent = todayEntry ? 'Update Happiness Entry' : 'Add Happiness Entry';
    }
}

// Router setup
Router.register('/', () => {
    // If user has data, go straight to dashboard (unless force=true)
    const params = Router.getQueryParams();
    if (!params.force && (loadHappiness().length > 0 || loadMedia().length > 0)) {
        Router.navigate('/dashboard');
        return;
    }
    document.getElementById('root').innerHTML = Pages.landing();
});

Router.register('/landing', () => {
    // If user has data, go straight to dashboard (unless force=true)
    const params = Router.getQueryParams();
    if (!params.force && (loadHappiness().length > 0 || loadMedia().length > 0)) {
        Router.navigate('/dashboard');
        return;
    }
    document.getElementById('root').innerHTML = Pages.landing();
});

Router.register('/dashboard', () => {
    // Restore user data if coming back from example
    const savedHappiness = sessionStorage.getItem('savedHappiness');
    const savedMedia = sessionStorage.getItem('savedMedia');
    const savedSources = sessionStorage.getItem('savedSources');
    
    if (savedHappiness || savedMedia) {
        // Restore the user's data
        if (savedHappiness) {
            localStorage.setItem(HAPPINESS_KEY, savedHappiness);
            sessionStorage.removeItem('savedHappiness');
        }
        if (savedMedia) {
            localStorage.setItem(MEDIA_KEY, savedMedia);
            sessionStorage.removeItem('savedMedia');
        }
        if (savedSources) {
            localStorage.setItem(SOURCES_KEY, savedSources);
            sessionStorage.removeItem('savedSources');
        }
    } else if (sessionStorage.getItem('inExampleMode') === 'true') {
        // Coming from example but had no saved data - clear everything
        clearAllData();
    }
    
    // Clear example mode flag
    sessionStorage.removeItem('inExampleMode');
    
    document.getElementById('root').innerHTML = Pages.dashboard();
    setupFormHandlers();
    setupModalHandlers();
    render();
    updateHappinessButton();
});

// Helper function to clear data and navigate
window.clearDataAndNavigate = function() {
    clearAllData();
    Router.navigate('/dashboard');
};

// Tab switching function
window.switchTab = function(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // If switching to chart, redraw it
    if (tabName === 'chart') {
        const happiness = loadHappiness();
        const media = loadMedia();
        drawChart(happiness, media);
        const statsEl = document.getElementById('stats');
        if (statsEl) statsEl.innerHTML = calculateStats(happiness, media);
    }
};

// Handle image file upload and convert to base64
window.handleImageUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 500KB for localStorage)
    if (file.size > 500000) {
        alert('Image too large. Please choose an image under 500KB.');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('mediaImageData').value = e.target.result;
        document.getElementById('mediaImageUrl').value = ''; // Clear URL if file uploaded
        
        // Update button text to show filename
        const label = event.target.parentElement.querySelector('.file-upload-text');
        if (label) label.textContent = file.name;
    };
    reader.readAsDataURL(file);
};

Router.register('/example', () => {
    // Mark that we're in example mode
    sessionStorage.setItem('inExampleMode', 'true');
    
    // Save user's current data temporarily (only if it's not already example data)
    const userHappiness = loadHappiness();
    const userMedia = loadMedia();
    const userSources = loadSources();
    
    // Only save to sessionStorage if we don't already have saved data
    // This prevents saving example data over real user data
    if (!sessionStorage.getItem('savedHappiness') && !sessionStorage.getItem('savedMedia')) {
        if (userHappiness.length > 0 || userMedia.length > 0) {
            sessionStorage.setItem('savedHappiness', JSON.stringify(userHappiness));
            sessionStorage.setItem('savedMedia', JSON.stringify(userMedia));
            sessionStorage.setItem('savedSources', JSON.stringify(userSources));
        }
    }
    
    // Clear and load example data
    clearAllData();
    loadExampleData();
    
    document.getElementById('root').innerHTML = Pages.example();
    setupFormHandlers();
    setupModalHandlers();
    render();
    updateHappinessButton();
});

Router.init();
