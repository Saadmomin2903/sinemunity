# Cinemunity - Movie Recommender

Cinemunity is a web-based movie recommendation platform that helps users discover new films based on their preferences. It leverages The Movie Database (TMDb) API to provide up-to-date information about movies and offers personalized recommendations using machine learning techniques.

## Features

- Browse trending movies
- Search for specific movies
- View detailed information about each movie
- Get personalized movie recommendations
- Responsive design for various devices

## Technology Stack

- Frontend:
  - HTML5
  - CSS3 (Tailwind CSS)
  - JavaScript (Vanilla JS)
- Backend:
  - Python
  - FastAPI
  - Modal
  - scikit-learn
- APIs:
  - The Movie Database (TMDb) API

## Project Structure

```
cinemunity/
├── index.html
├── pages/
│   ├── trending.html
│   ├── movies.html
│   ├── details.html
│   ├── result.html
│   └── team.html
├── scripts/
│   ├── movies.js
│   ├── trending.js
│   ├── details.js
│   └── results.js
├── assets/
│   ├── home.jpg
│   ├── saad.png
│   ├── sandesh.png
│   ├── zhatar.png
│   └── vinit.png
└── engine/
    └── main.py
```

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/cinemunity.git
   cd cinemunity
   ```

2. Set up the frontend:
   - No additional setup is required for the frontend as it uses CDN-hosted Tailwind CSS.

3. Set up the backend:
   - Install Python 3.10 or later.
   - Install required packages:
     ```
     pip install modal pandas scikit-learn requests aiohttp fastapi nltk
     ```
   - Set up your TMDb API key as a Modal secret:
     ```
     modal secret create tmdb_key <your-api-key>
     ```

4. Run the backend:
   ```
   modal serve engine/main.py
   ```

5. Open `index.html` in your web browser or set up a local server to serve the frontend files.

## Usage

- Visit the homepage to search for movies or explore trending films.
- Click on a movie to view its details and get recommendations.
- Use the navigation bar to switch between trending movies and the full movie list.
- Check out the team page to learn about the developers behind Cinemunity.

## API Endpoints

- `/all` (POST): Fetch all movies from TMDb API
- `/reco` (POST): Get movie recommendations based on a given title
- `/status` (GET): Check the status of the recommendation engine

## Team

- Saad Momin: Recommendation engine
- Sandesh Sawant: CSS development
- Aman Shaikh: JS developer
- Vinit Tippanvar: Deployment engineer

## Contributing

We welcome contributions to Cinemunity! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Create a pull request

## License

This project is licensed under the MIT License.

## Acknowledgements

- [The Movie Database (TMDb)](https://www.themoviedb.org/) for providing the movie data API
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Modal](https://modal.com/) for serverless Python infrastructure
