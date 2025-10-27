// API integrations for media search

// Open Library API for books
async function searchBooks(query) {
    try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
        console.log('Open Library API request:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Open Library API response:', data);
        
        const results = data.docs.map(book => ({
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
        
        console.log('Parsed book results:', results);
        return results;
    } catch (error) {
        console.error('Open Library search failed:', error);
        return [];
    }
}

// OMDb API for movies (requires API key from http://www.omdbapi.com/)
async function searchMovies(query) {
    try {
        const apiKey = 'e7b0f735';
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}&type=movie`;
        console.log('OMDb API request:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('OMDb API response:', data);
        
        if (data.Response === 'False' || !data.Search) {
            console.log('No movies found or error:', data.Error);
            return [];
        }
        
        const results = data.Search.map(movie => ({
            title: movie.Title,
            author: movie.Year,
            year: movie.Year,
            coverUrl: movie.Poster !== 'N/A' ? movie.Poster : null,
            reference: {
                type: 'omdb',
                imdbID: movie.imdbID
            }
        }));
        
        console.log('Parsed movie results:', results);
        return results;
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
