const movieDetails = document.getElementById('movie-details');
const recoContainer = document.getElementById('reco');
const reviewsContainer = document.getElementById('reviews');

const apiKey = 'aab044a8c8a395ff28b777d2c0f890b1';
const baseUrl = 'https://api.themoviedb.org/3';

const urlParams = new URLSearchParams(window.location.search);
const movieTitle = urlParams.get('title');

async function fetchMovieDetails() {
    console.log("Fetching movie details for:", movieTitle);
    try {
        const storedMovie = localStorage.getItem(movieTitle);
        if (storedMovie) {
            const movie = JSON.parse(storedMovie);
            displayMovieDetails(movie);
            fetchRecommendations(movie.id);
            fetchReviews(movie.id);
        } else {
            const encodedTitle = encodeURIComponent(movieTitle);
            const url = `${baseUrl}/search/movie?api_key=${apiKey}&query=${encodedTitle}&language=en-US&page=1&include_adult=false`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const movie = data.results[0];
                displayMovieDetails(movie);
                fetchRecommendations(movie.id);
                fetchReviews(movie.id);
            } else {
                console.log("Movie not found");
                movieDetails.innerHTML = '<p class="text-xl">Movie not found.</p>';
            }
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
        movieDetails.innerHTML = '<p class="text-xl">Error fetching movie details. Please try again later.</p>';
    }
}

function displayMovieDetails(movie) {
    movieDetails.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path || movie.poster}" alt="${movie.title}" class="w-full md:w-1/3 rounded-lg shadow-lg">
            <div class="w-full md:w-2/3">
                <h1 class="text-4xl font-bold mb-4">${movie.title}</h1>
                <p class="text-lg mb-2">Rating: <span class="text-yellow-400">${movie.vote_average}/10</span></p>
                <p class="text-lg mb-4">Release Date: ${movie.release_date}</p>
                <p class="text-lg">${movie.overview}</p>
            </div>
        </div>
    `;
}

async function fetchRecommendations(movieId) {
    try {
        const response = await fetch(`${baseUrl}/movie/${movieId}/recommendations?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            displayRecommendations(data.results.slice(0, 12));
        } else {
            recoContainer.innerHTML = '<p class="text-xl">No recommendations available.</p>';
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        recoContainer.innerHTML = '<p class="text-xl">Error fetching recommendations. Please try again later.</p>';
    }
}

function displayRecommendations(movies) {
    recoContainer.innerHTML = movies.map(movie => `
        <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="w-full h-64 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-2">${movie.title}</h3>
                <p class="text-sm text-gray-300 mb-2">Rating: ${movie.vote_average}/10</p>
                <a href="details.html?title=${encodeURIComponent(movie.title)}" class="inline-block bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">View Details</a>
            </div>
        </div>
    `).join('');
}

async function fetchReviews(movieId) {
    try {
        const response = await fetch(`${baseUrl}/movie/${movieId}/reviews?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            displayReviews(data.results.slice(0, 3));
        } else {
            reviewsContainer.innerHTML = '<p class="text-xl">No reviews available.</p>';
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
        reviewsContainer.innerHTML = '<p class="text-xl">Error fetching reviews. Please try again later.</p>';
    }
}

function displayReviews(reviews) {
    reviewsContainer.innerHTML = reviews.map(review => `
        <div class="bg-zinc-950 text-white rounded-lg border border-zinc-800 p-4 m-4">
            <h2 class="text-xl font-semibold ${review.sentiment === 'Positive' ? 'text-green-500' : 'text-red-500'}">${review.author}</h2>
            <div class="mt-2">
                <p class="text-sm"><strong>Author Details:</strong></p>
                <p class="text-sm">Name: ${review.author_details.name || 'N/A'}</p>
                <p class="text-sm">Username: ${review.author_details.username || 'N/A'}</p>
                <p class="text-sm">Rating: ${review.author_details.rating || 'N/A'}</p>
            </div>
            <div class="mt-4">
                <p class="text-sm leading-7">${review.content.replace(/\r?\n/g, '<br>')}</p>
            </div>
            <div class="mt-4">
                <p class="text-sm">Created At: ${new Date(review.created_at).toLocaleString()}</p>
                <p class="text-sm">Updated At: ${new Date(review.updated_at).toLocaleString()}</p>
                <p class="text-sm">Review URL: <a class="text-blue-500 hover:text-blue-700" href="${review.url}" target="_blank" rel="noopener noreferrer">${review.url}</a></p>
            </div>
        </div>
    `).join('');
}

fetchMovieDetails();
