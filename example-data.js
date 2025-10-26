// Example data generator
const exampleHappiness = [
    { date: "2024-10-20", happiness: 2, createdAt: "2024-10-20T22:00:00.000Z" },
    { date: "2024-10-21", happiness: 1, createdAt: "2024-10-21T22:00:00.000Z" },
    { date: "2024-10-22", happiness: 0, createdAt: "2024-10-22T22:00:00.000Z" },
    { date: "2024-10-23", happiness: -1, createdAt: "2024-10-23T22:00:00.000Z" },
    { date: "2024-10-24", happiness: 2, createdAt: "2024-10-24T22:00:00.000Z" },
    { date: "2024-10-25", happiness: 1, createdAt: "2024-10-25T22:00:00.000Z" },
    { date: "2024-10-26", happiness: 1, createdAt: "2024-10-26T22:00:00.000Z" }
];

const exampleMedia = [
    { name: "The Shawshank Redemption", type: "Movie", duration: 142, date: "2024-10-20", id: 1729454400001, createdAt: "2024-10-20T19:30:00.000Z" },
    { name: "Breaking Bad S5E14", type: "TV Show", duration: 47, date: "2024-10-21", id: 1729540800001, createdAt: "2024-10-21T21:15:00.000Z" },
    { name: "Atomic Habits", type: "Book", duration: 180, date: "2024-10-22", id: 1729627200001, createdAt: "2024-10-22T14:00:00.000Z" },
    { name: "The Daily", type: "Podcast", duration: 25, date: "2024-10-22", id: 1729627200002, createdAt: "2024-10-22T08:30:00.000Z" },
    { name: "Sad documentary about climate", type: "Movie", duration: 95, date: "2024-10-23", id: 1729713600001, createdAt: "2024-10-23T20:00:00.000Z" },
    { name: "Spotify Focus playlist", type: "Music", duration: 120, date: "2024-10-23", id: 1729713600002, createdAt: "2024-10-23T10:00:00.000Z" },
    { name: "Elden Ring", type: "Video Game", duration: 180, date: "2024-10-24", id: 1729800000001, createdAt: "2024-10-24T16:00:00.000Z" },
    { name: "The Office reruns", type: "TV Show", duration: 66, date: "2024-10-24", id: 1729800000002, createdAt: "2024-10-24T22:00:00.000Z" },
    { name: "Boring work article", type: "Article", duration: 10, date: "2024-10-25", id: 1729886400001, createdAt: "2024-10-25T09:00:00.000Z" },
    { name: "Inception", type: "Movie", duration: 148, date: "2024-10-25", id: 1729886400002, createdAt: "2024-10-25T19:00:00.000Z" },
    { name: "New York Times news", type: "Article", duration: 15, date: "2024-10-25", id: 1729886400003, createdAt: "2024-10-25T07:00:00.000Z" },
    { name: "lo-fi beats", type: "Music", duration: 90, date: "2024-10-26", id: 1729972800001, createdAt: "2024-10-26T11:00:00.000Z" },
    { name: "Bad reality TV", type: "TV Show", duration: 45, date: "2024-10-26", id: 1729972800002, createdAt: "2024-10-26T23:00:00.000Z" },
    { name: "How I Built This", type: "Podcast", duration: 55, date: "2024-10-26", id: 1729972800003, createdAt: "2024-10-26T08:00:00.000Z" },
    { name: "Project Hail Mary", type: "Book", duration: 240, date: "2024-10-26", id: 1729972800004, createdAt: "2024-10-26T15:00:00.000Z" }
];

function loadExampleData() {
    const HAPPINESS_KEY = 'happinessRatings';
    const MEDIA_KEY = 'mediaEntries';
    const SOURCES_KEY = 'mediaSources';
    
    localStorage.setItem(HAPPINESS_KEY, JSON.stringify(exampleHappiness));
    localStorage.setItem(MEDIA_KEY, JSON.stringify(exampleMedia));
    
    // Generate sources from example media
    const sources = [];
    const sourceMap = new Map();
    
    exampleMedia.forEach((media, index) => {
        const key = `${media.name}-${media.type}`;
        if (!sourceMap.has(key)) {
            sourceMap.set(key, {
                name: media.name,
                type: media.type,
                createdAt: media.createdAt,
                lastUsed: media.createdAt,
                useCount: 1
            });
        }
    });
    
    localStorage.setItem(SOURCES_KEY, JSON.stringify(Array.from(sourceMap.values())));
    
    console.log(`Loaded ${exampleHappiness.length} happiness ratings, ${exampleMedia.length} media entries, and ${sourceMap.size} sources`);
    
    // Reload the page to show the data
    if (typeof render === 'function') {
        render();
    } else {
        window.location.reload();
    }
}

// Auto-load if localStorage is empty
if (!localStorage.getItem('happinessRatings') && !localStorage.getItem('mediaEntries') && !localStorage.getItem('hasSeenOnboarding')) {
    // Don't auto-load on first visit, let onboarding handle it
    console.log('First time visitor - showing onboarding');
}
