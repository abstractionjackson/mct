// YouTube Integration using Google Identity Services (GIS)

const YOUTUBE_SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';
let youtubeAccessToken = null;
let tokenClient = null;

// Check if YouTube is configured
function isYouTubeConfigured() {
    const config = getYouTubeConfig();
    return config.CLIENT_ID !== 'YOUR_CLIENT_ID' && config.API_KEY !== 'YOUR_API_KEY';
}

// Load Google API and GIS
function loadYouTubeAPI() {
    return new Promise((resolve, reject) => {
        const config = getYouTubeConfig();
        
        if (!isYouTubeConfigured()) {
            reject(new Error('YouTube API not configured. See YOUTUBE_SETUP.md'));
            return;
        }
        
        // Load gapi client
        if (!window.gapi) {
            const gapiScript = document.createElement('script');
            gapiScript.src = 'https://apis.google.com/js/api.js';
            gapiScript.onload = () => {
                gapi.load('client', () => {
                    gapi.client.init({
                        apiKey: config.API_KEY,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
                    }).then(() => {
                        loadGIS(config, resolve, reject);
                    }, reject);
                });
            };
            gapiScript.onerror = reject;
            document.head.appendChild(gapiScript);
        } else if (!window.google?.accounts) {
            loadGIS(config, resolve, reject);
        } else {
            resolve();
        }
    });
}

// Load Google Identity Services
function loadGIS(config, resolve, reject) {
    if (!window.google?.accounts) {
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.onload = () => {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: config.CLIENT_ID,
                scope: YOUTUBE_SCOPES,
                callback: ''
            });
            resolve();
        };
        gisScript.onerror = reject;
        document.head.appendChild(gisScript);
    } else {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: config.CLIENT_ID,
            scope: YOUTUBE_SCOPES,
            callback: ''
        });
        resolve();
    }
}

// Authenticate with YouTube
async function authenticateYouTube() {
    try {
        await loadYouTubeAPI();
        
        return new Promise((resolve, reject) => {
            tokenClient.callback = (response) => {
                if (response.error) {
                    console.error('YouTube authentication failed:', response);
                    reject(response);
                    return;
                }
                youtubeAccessToken = response.access_token;
                resolve(true);
            };
            
            // Request token
            if (youtubeAccessToken) {
                // Check if token is still valid
                resolve(true);
            } else {
                tokenClient.requestAccessToken({ prompt: 'consent' });
            }
        });
    } catch (error) {
        console.error('YouTube authentication failed:', error);
        return false;
    }
}

// Get today's watch history
async function getTodayWatchHistory() {
    if (!youtubeAccessToken) {
        throw new Error('Not authenticated');
    }
    
    // Set authorization header
    gapi.client.setToken({ access_token: youtubeAccessToken });
    
    // Get start of today in ISO format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const publishedAfter = today.toISOString();
    
    try {
        const response = await gapi.client.youtube.activities.list({
            part: 'snippet,contentDetails',
            mine: true,
            maxResults: 50,
            publishedAfter: publishedAfter
        });
        
        // Filter for watch activities and get video details
        const watchedVideos = response.result.items
            .filter(item => item.snippet.type === 'upload' || item.contentDetails?.upload)
            .map(item => {
                const videoId = item.contentDetails?.upload?.videoId || item.snippet?.resourceId?.videoId;
                return {
                    id: videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                    channelTitle: item.snippet.channelTitle,
                    publishedAt: item.snippet.publishedAt
                };
            })
            .filter(v => v.id); // Remove any without video IDs
        
        // Get video durations
        if (watchedVideos.length > 0) {
            const videoIds = watchedVideos.map(v => v.id).join(',');
            const videoDetails = await gapi.client.youtube.videos.list({
                part: 'contentDetails',
                id: videoIds
            });
            
            // Parse durations and add to videos
            watchedVideos.forEach((video, index) => {
                const details = videoDetails.result.items.find(item => item.id === video.id);
                if (details) {
                    video.duration = parseYouTubeDuration(details.contentDetails.duration);
                }
            });
        }
        
        return watchedVideos;
    } catch (error) {
        console.error('Failed to fetch watch history:', error);
        throw error;
    }
}

// Parse ISO 8601 duration to minutes
function parseYouTubeDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    const hours = (match[1] || '').replace('H', '') || '0';
    const minutes = (match[2] || '').replace('M', '') || '0';
    const seconds = (match[3] || '').replace('S', '') || '0';
    
    return parseInt(hours) * 60 + parseInt(minutes) + Math.ceil(parseInt(seconds) / 60);
}

// Disconnect YouTube
function disconnectYouTube() {
    if (youtubeAccessToken && window.google?.accounts?.oauth2) {
        google.accounts.oauth2.revoke(youtubeAccessToken, () => {
            console.log('YouTube access revoked');
        });
    }
    youtubeAccessToken = null;
}

// Check if connected
function isYouTubeConnected() {
    return !!youtubeAccessToken;
}
