// API integrations for media search

// Open Library API for books
async function searchBooks(query) {
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
        const data = await response.json();
        
        return data.docs.map(book => ({
            title: book.title,
            author: book.author_name?.[0] || 'Unknown Author',
            year: book.first_publish_year,
            coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
            reference: {
                type: 'openlibrary',
                key: book.key,
                isbn: book.isbn?.[0]
            }
        }));
    } catch (error) {
        console.error('Open Library search failed:', error);
        return [];
    }
}

// OMDb API for movies (requires API key from http://www.omdbapi.com/)
async function searchMovies(query) {
    try {
        // Using free OMDb API - you can get a key from http://www.omdbapi.com/
        // For demo purposes, using a public key (limited requests)
        const apiKey = '3e6e4b0e'; // Get your own key for production
        const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}&type=movie`);
        const data = await response.json();
        
        if (data.Response === 'False' || !data.Search) {
            return [];
        }
        
        return data.Search.map(movie => ({
            title: movie.Title,
            author: movie.Year,
            year: movie.Year,
            coverUrl: movie.Poster !== 'N/A' ? movie.Poster : null,
            reference: {
                type: 'omdb',
                imdbID: movie.imdbID
            }
        }));
    } catch (error) {
        console.error('OMDb search failed:', error);
        return [];
    }
}

// Search based on selected format
async function searchMediaByFormat(format, query) {
    switch (format) {
        case 'Book':
            return await searchBooks(query);
        case 'Movie':
            return await searchMovies(query);
        case 'TV Show':
            // TODO: Implement TV show search (can also use OMDb)
            return [];
        case 'Music':
            // TODO: Implement music search (Spotify, Last.fm)
            return [];
        case 'Video':
            // TODO: Implement YouTube search
            return [];
        case 'Podcast':
            // TODO: Implement podcast search
            return [];
        default:
            return [];
    }
}
