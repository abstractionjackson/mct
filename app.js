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

function addOrUpdateSource(name, type) {
    const sources = loadSources();
    const existing = sources.find(s => s.name === name && s.type === type);
    
    if (existing) {
        existing.lastUsed = new Date().toISOString();
        existing.useCount = (existing.useCount || 0) + 1;
    } else {
        sources.push({
            name: name,
            type: type,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            useCount: 1
        });
    }
    
    saveSources(sources);
}

function getRecentSources(limit = 5) {
    const sources = loadSources();
    return sources
        .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
        .slice(0, limit);
}

function deleteSource(name, type) {
    const sources = loadSources();
    const filtered = sources.filter(s => !(s.name === name && s.type === type));
    saveSources(filtered);
}

function clearAllSources() {
    saveSources([]);
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
    const mediaSearch = document.getElementById('mediaSearch');
    
    if (!happinessForm || !mediaForm) return;
    
    // Remove old listeners by cloning
    const newHappinessForm = happinessForm.cloneNode(true);
    happinessForm.parentNode.replaceChild(newHappinessForm, happinessForm);
    
    const newMediaForm = mediaForm.cloneNode(true);
    mediaForm.parentNode.replaceChild(newMediaForm, mediaForm);
    
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
            closeModal('happinessModal');
        }, 2000);
        
        render();
        updateHappinessButton();
    });

    document.getElementById('mediaForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const entry = {
            name: document.getElementById('mediaName').value,
            type: document.getElementById('mediaType').value,
            duration: parseInt(document.getElementById('duration').value),
            date: document.getElementById('mediaDate').value
        };
        
        addMedia(entry);
        e.target.reset();
        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('suggestedSources').innerHTML = '';
        closeModal('mediaModal');
        render();
    });

    // Media search functionality
    document.getElementById('mediaSearch').addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }
        
        const results = searchSources(query);
        
        if (results.length === 0) {
            document.getElementById('searchResults').innerHTML = '<div class="search-result-empty">No matches found. Press Enter or Tab to create new source.</div>';
            return;
        }
        
        document.getElementById('searchResults').innerHTML = results.map(source => `
            <div class="search-result" onclick="selectSource('${source.name.replace(/'/g, "\\'")}', '${source.type}')">
                <strong>${source.name}</strong> <span class="result-type">(${source.type})</span>
            </div>
        `).join('');
    });

    document.getElementById('mediaSearch').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                const results = searchSources(query);
                if (results.length === 0) {
                    e.preventDefault();
                    document.getElementById('mediaName').value = query;
                    document.getElementById('mediaSearch').value = '';
                    document.getElementById('searchResults').innerHTML = '';
                    document.getElementById('mediaType').focus();
                }
            }
        }
    });

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
}

function selectSource(name, type) {
    document.getElementById('mediaName').value = name;
    document.getElementById('mediaType').value = type;
    document.getElementById('mediaSearch').value = '';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('duration').focus();
}

window.selectSource = selectSource;

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
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
    deleteSource(name, type);
    renderSuggestedSources();
};

window.handleClearSources = function() {
    if (confirm('Clear all recent sources?')) {
        clearAllSources();
        renderSuggestedSources();
    }
};

// Modal handling
function setupModalHandlers() {
    const openHappinessBtn = document.getElementById('openHappinessModal');
    const openMediaBtn = document.getElementById('openMediaModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    
    if (openHappinessBtn) {
        openHappinessBtn.onclick = () => openModal('happinessModal');
    }
    
    if (openMediaBtn) {
        openMediaBtn.onclick = () => {
            renderSuggestedSources();
            openModal('mediaModal');
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
    ctx.fillText('Happiness Level', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Average Duration (minutes)', 0, 0);
    ctx.restore();
    
    // Draw duration scale (Y axis)
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    const durationSteps = 5;
    for (let i = 0; i <= durationSteps; i++) {
        const dur = (maxDuration / durationSteps) * i;
        const y = height - padding - (i / durationSteps) * chartHeight;
        ctx.fillText(Math.round(dur).toString(), padding - 10, y + 3);
        
        // Grid lines
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw bars
    const barWidth = chartWidth / (happinessLevels.length * 1.5);
    const barSpacing = chartWidth / happinessLevels.length;
    
    happinessLevels.forEach((level, index) => {
        const duration = avgDurationByHappiness[level];
        const barHeight = (duration / maxDuration) * chartHeight;
        const x = padding + (index * barSpacing) + (barSpacing - barWidth) / 2;
        const y = height - padding - barHeight;
        
        // Draw bar
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw happiness level label
        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(level.toString(), x + barWidth / 2, height - padding + 20);
        
        // Draw value on top of bar if there's data
        if (duration > 0) {
            ctx.font = '10px sans-serif';
            ctx.fillText(Math.round(duration).toString(), x + barWidth / 2, y - 5);
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
            ? `Happiness: ${data.happiness} <button class="delete-btn" onclick="handleDeleteHappiness('${date}')">Delete</button>` 
            : 'No happiness rating';
        
        return `
            <div class="day-group">
                <div class="day-header">
                    ${formatDateHuman(date)} • ${happinessText} • ${totalDuration} min total
                </div>
                ${data.media.length > 0 ? data.media.map(m => `
                    <div class="media-item">
                        ${m.name} (${m.type}, ${m.duration} min)
                        <button class="delete-btn" onclick="handleDeleteMedia(${m.id})">Delete</button>
                    </div>
                `).join('') : '<div class="media-item">No media entries</div>'}
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
    document.getElementById('root').innerHTML = Pages.landing();
});

Router.register('/landing', () => {
    document.getElementById('root').innerHTML = Pages.landing();
});

Router.register('/dashboard', () => {
    document.getElementById('root').innerHTML = Pages.dashboard();
    setupFormHandlers();
    setupModalHandlers();
    render();
    updateHappinessButton();
});

Router.register('/example', () => {
    // Load example data if not already loaded
    if (loadHappiness().length === 0 && loadMedia().length === 0) {
        loadExampleData();
    }
    document.getElementById('root').innerHTML = Pages.example();
    setupFormHandlers();
    setupModalHandlers();
    render();
    updateHappinessButton();
});

Router.init();
