const moviesContainer = document.getElementById('movies');
const searchTitle = document.getElementById('search-title');

const apiKey = 'aab044a8c8a395ff28b777d2c0f890b1';
const baseUrl = 'https://api.themoviedb.org/3';

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('query');

async function fetchSearchResults() {
    try {
        const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            displayMovies(data.results);
            searchTitle.textContent = `Search Results for "${query}"`;
        } else {
            moviesContainer.innerHTML = '<p class="text-xl text-center">No movies found matching your search.</p>';
            searchTitle.textContent = `No Results for "${query}"`;
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
        moviesContainer.innerHTML = '<p class="text-xl text-center">Error fetching search results. Please try again later.</p>';
    }
}

function displayMovies(movies) {
    moviesContainer.innerHTML = movies.map(movie => `
        <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="w-full h-64 object-cover">
            <div class="p-4">
                <h2 class="text-lg font-semibold mb-2">${movie.title}</h2>
                <p class="text-sm text-gray-300 mb-2">Rating: ${movie.vote_average}/10</p>
                <a href="details.html?title=${encodeURIComponent(movie.title)}" class="inline-block bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">View Details</a>
            </div>
        </div>
    `).join('');
}

fetchSearchResults();