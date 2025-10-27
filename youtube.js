// YouTube Integration

const YOUTUBE_CLIENT_ID = 'YOUR_CLIENT_ID'; // User needs to set this up
const YOUTUBE_API_KEY = 'YOUR_API_KEY'; // User needs to set this up
const YOUTUBE_SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

let youtubeAccessToken = null;

// Check if YouTube is configured
function isYouTubeConfigured() {
    return YOUTUBE_CLIENT_ID !== 'YOUR_CLIENT_ID' && YOUTUBE_API_KEY !== 'YOUR_API_KEY';
}

// Load Google API
function loadYouTubeAPI() {
    return new Promise((resolve, reject) => {
        if (!isYouTubeConfigured()) {
            reject(new Error('YouTube API not configured. See YOUTUBE_SETUP.md'));
            return;
        }
        
        if (window.gapi) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            gapi.load('client:auth2', () => {
                gapi.client.init({
                    apiKey: YOUTUBE_API_KEY,
                    clientId: YOUTUBE_CLIENT_ID,
                    scope: YOUTUBE_SCOPES,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
                }).then(resolve, reject);
            });
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Authenticate with YouTube
async function authenticateYouTube() {
    try {
        await loadYouTubeAPI();
        
        const authInstance = gapi.auth2.getAuthInstance();
        
        if (!authInstance.isSignedIn.get()) {
            await authInstance.signIn();
        }
        
        const user = authInstance.currentUser.get();
        const authResponse = user.getAuthResponse(true);
        youtubeAccessToken = authResponse.access_token;
        
        return true;
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
    if (window.gapi && gapi.auth2) {
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
            authInstance.signOut();
        }
    }
    youtubeAccessToken = null;
}

// Check if connected
function isYouTubeConnected() {
    if (!window.gapi || !gapi.auth2) return false;
    const authInstance = gapi.auth2.getAuthInstance();
    return authInstance && authInstance.isSignedIn.get();
}
