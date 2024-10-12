const moviesContainer = document.getElementById('movies');

const apiKey = 'aab044a8c8a395ff28b777d2c0f890b1';
const baseUrl = 'https://api.themoviedb.org/3';

async function fetchTrendingMovies() {
    try {
        const response = await fetch(`${baseUrl}/trending/movie/week?api_key=${apiKey}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            displayMovies(data.results);
        } else {
            moviesContainer.innerHTML = '<p class="text-xl text-center">No trending movies found.</p>';
        }
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        moviesContainer.innerHTML = '<p class="text-xl text-center">Error fetching trending movies. Please try again later.</p>';
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

fetchTrendingMovies();