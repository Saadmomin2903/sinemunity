const movieDetails = document.getElementById('movie-details');
const recoContainer = document.getElementById('reco');
const reviewsContainer = document.getElementById('reviews');

const urlParams = new URLSearchParams(window.location.search);
const movieTitle = urlParams.get('title');

const apiKey = 'aab044a8c8a395ff28b777d2c0f890b1';
const baseUrl = 'https://api.themoviedb.org/3';

async function fetchMovieDetails() {
    try {
        const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movieTitle)}&language=en-US&page=1&include_adult=false`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const movie = data.results[0];
            displayMovieDetails(movie);
            fetchRecommendations(movie.id);
            fetchReviews(movie.id);
        } else {
            movieDetails.innerHTML = '<p class="text-xl">Movie not found.</p>';
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
        movieDetails.innerHTML = '<p class="text-xl">Error fetching movie details. Please try again later.</p>';
    }
}

function displayMovieDetails(movie) {
    const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/path/to/placeholder-image.jpg';
    movieDetails.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8">
            <img src="${posterPath}" alt="${movie.title}" class="w-full md:w-1/3 rounded-lg shadow-lg">
            <div class="flex-1">
                <h1 class="text-4xl font-bold mb-4">${movie.title}</h1>
                <p class="text-gray-300 mb-4">${movie.overview}</p>
                <div class="grid grid-cols-2 gap-4">
                    <p><span class="font-semibold">Release Date:</span> ${movie.release_date}</p>
                    <p><span class="font-semibold">Rating:</span> ${movie.vote_average}/10</p>
                    <p><span class="font-semibold">Popularity:</span> ${movie.popularity}</p>
                    <p><span class="font-semibold">Original Language:</span> ${movie.original_language}</p>
                </div>
            </div>
        </div>
    `;
}

async function fetchRecommendations(movieId) {
    try {
        const response = await fetch(`${baseUrl}/movie/${movieId}/recommendations?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            displayRecommendations(data.results.slice(0, 5));
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
        <div class="bg-gray-800 rounded-lg p-6 mb-6">
            <div class="flex items-center mb-4">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(review.author)}&background=random" alt="${review.author}" class="w-12 h-12 rounded-full mr-4">
                <div>
                    <h3 class="text-lg font-semibold">${review.author}</h3>
                    <p class="text-gray-400 text-sm">Posted on ${new Date(review.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <p class="text-gray-300">${review.content.length > 300 ? review.content.substring(0, 300) + '...' : review.content}</p>
            ${review.content.length > 300 ? `<button class="text-blue-400 mt-2 hover:underline">Read more</button>` : ''}
        </div>
    `).join('');

    // Add event listeners for "Read more" buttons
    const readMoreButtons = reviewsContainer.querySelectorAll('button');
    readMoreButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const reviewContent = reviews[index].content;
            button.previousElementSibling.textContent = reviewContent;
            button.style.display = 'none';
        });
    });
}

fetchMovieDetails();